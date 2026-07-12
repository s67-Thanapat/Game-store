(function () {
  const store = window.NEXORA_STORE;
  const ADMIN_ID = "admin";
  const ADMIN_PASSWORD = "1234";

  const icons = {
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>'
  };

  let state = store.loadState();
  let selectedCategory = null;
  let toastTimer;

  async function apiRequest(pathname, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    // Use Worker API URL for /api/* endpoints
    const url = pathname.startsWith("/api/") ? `${API_URL}${pathname}` : pathname;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      const error = new Error(data?.message || "Request failed");
      error.statusCode = response.status;
      error.details = data;
      throw error;
    }

    return data;
  }

  const adminDashboard = document.getElementById("adminDashboard");
  const productList = document.getElementById("productList");
  const saveButton = document.getElementById("saveButton");
  const categoryTabs = document.getElementById("categoryTabs");
  const addCategoryButton = document.getElementById("addCategoryButton");
  const resetSettingsButton = document.getElementById("resetSettingsButton");
  const logoutButton = document.getElementById("logoutButton");
  const logoutButtonTop = document.getElementById("logoutButtonTop");
  const adminNav = document.getElementById("adminNav");

  const settingInputs = {
    name: document.getElementById("storeName"),
    tagline: document.getElementById("storeTagline"),
    bannerLabel: document.getElementById("bannerLabel"),
    announcement: document.getElementById("announcement"),
    footerNote: document.getElementById("footerNote"),
  };

  const summaryStoreName = document.getElementById("summaryStoreName");
  const summaryProductCount = document.getElementById("summaryProductCount");
  const summaryAveragePrice = document.getElementById("summaryAveragePrice");

  function escapeHtml(value) {
    return store.escapeHtml(value);
  }

  function productCoverStyle(product) {
    const pieces = [`--cover:${product.cover}`];
    if (product.imageUrl) {
      pieces.push(`background-image:url(${JSON.stringify(product.imageUrl)})`);
      pieces.push("background-size:cover");
      pieces.push("background-position:center");
    }
    return pieces.join(";");
  }

  function syncPageBindings() {
    document.title = `${state.settings.name} — Admin Panel`;
    document.querySelectorAll("[data-store-name]").forEach((el) => {
      el.textContent = state.settings.name;
    });
    document.querySelectorAll("[data-store-tagline]").forEach((el) => {
      el.textContent = state.settings.tagline;
    });
    document.querySelectorAll("[data-store-label]").forEach((el) => {
      el.textContent = state.settings.bannerLabel;
    });
  }

  function syncSettingsForm() {
    settingInputs.name.value = state.settings.name;
    settingInputs.tagline.value = state.settings.tagline;
    settingInputs.bannerLabel.value = state.settings.bannerLabel;
    settingInputs.announcement.value = state.settings.announcement;
    settingInputs.footerNote.value = state.settings.footerNote;
  }

  function syncSummary() {
    summaryStoreName.textContent = state.settings.name;
    summaryProductCount.textContent = `${state.products.length} รายการ`;
    const total = state.products.reduce((sum, product) => sum + Number(product.price || 0), 0);
    const average = state.products.length ? Math.round(total / state.products.length) : 0;
    summaryAveragePrice.textContent = `฿${average.toLocaleString("th-TH")}`;
  }

  function getCategories() {
    const categories = {};
    state.products.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = {
          key: product.category,
          label: product.categoryLabel || store.categoryLabels[product.category] || product.category,
          count: 0
        };
      }
      categories[product.category].count++;
    });
    return Object.values(categories);
  }

  function renderCategoryTabs() {
    const categories = getCategories();
    if (!selectedCategory && categories.length > 0) {
      selectedCategory = categories[0].key;
    }
    categoryTabs.innerHTML = categories.map(cat => `
      <button
        class="category-tab ${selectedCategory === cat.key ? 'active' : ''}"
        data-category="${cat.key}"
        type="button"
      >
        ${escapeHtml(cat.label)}
      </button>
    `).join("");
  }

  function renderProducts() {
    const filteredProducts = state.products.filter(product => product.category === selectedCategory);
    const productsHTML = filteredProducts.map((product, index) => `
      <article class="admin-product-card" data-product-id="${product.id}">
        <div class="admin-card-header">
          <span class="product-index">#${index + 1}</span>
          <div class="admin-card-actions">
            <button class="button-icon-mini" type="button" data-action="duplicate" title="คัดลอกสินค้า">${icons.copy}</button>
            <button class="button-icon-mini danger" type="button" data-action="delete" title="ลบสินค้า">${icons.trash}</button>
          </div>
        </div>

        <div class="product-cover ${product.imageUrl ? "has-image" : ""}" style="${productCoverStyle(product)}">
          <span class="product-badge">${escapeHtml(product.badge)}</span>
          <span class="product-symbol">${escapeHtml(product.symbol)}</span>
          <div class="admin-cover-tools-overlay">
            <label class="btn-upload">
              อัปโหลดรูป
              <input type="file" accept="image/*" data-cover-file>
            </label>
          </div>
        </div>

        <div class="admin-card-form">
          <div class="admin-form-row">
            <div class="admin-field-mini">
              <label>หมวดหมู่</label>
              <select data-field="category">
                <option value="premium"${product.category === "premium" ? " selected" : ""}>แอปพรีเมียม</option>
                <option value="game"${product.category === "game" ? " selected" : ""}>เกม & ไอเท็ม</option>
                <option value="service"${product.category === "service" ? " selected" : ""}>บริการออนไลน์</option>
              </select>
            </div>
            <div class="admin-field-mini">
              <label>ราคา (฿)</label>
              <input type="number" min="0" step="1" data-field="price" value="${escapeHtml(product.price)}">
            </div>
          </div>

          <div class="admin-field-mini">
            <label>ชื่อสินค้า</label>
            <input type="text" data-field="name" value="${escapeHtml(product.name)}">
          </div>

          <div class="admin-form-row">
            <div class="admin-field-mini">
              <label>ป้ายสถานะ</label>
              <input type="text" data-field="badge" value="${escapeHtml(product.badge)}">
            </div>
            <div class="admin-field-mini">
              <label>สัญลักษณ์</label>
              <input type="text" data-field="symbol" value="${escapeHtml(product.symbol)}">
            </div>
          </div>

          <div class="admin-field-mini">
            <label>รูปภาพ URL</label>
            <input type="text" data-field="imageUrl" value="${escapeHtml(product.imageUrl)}" placeholder="วางลิงก์รูปภาพ">
          </div>

          <div class="admin-field-mini">
            <label>คำอธิบายสินค้า</label>
            <textarea data-field="desc" rows="3">${escapeHtml(product.desc)}</textarea>
          </div>
        </div>
      </article>
    `).join("");

    const addProductButtonHTML = `
      <button class="admin-product-card add-product-btn" type="button" data-action="add-new">
        <div class="add-product-content">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="add-product-icon">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span class="add-product-text">เพิ่มสินค้า</span>
        </div>
      </button>
    `;

    productList.innerHTML = productsHTML + addProductButtonHTML;
  }

  function persistState(showNotice = true) {
    state = store.saveState(state);
    syncPageBindings();
    syncSettingsForm();
    syncSummary();
    renderCategoryTabs();
    renderProducts();
    if (showNotice) {
      showToast("บันทึกข้อมูลเรียบร้อย");
    }
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.querySelector("p").textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function setAuthView(isAuthed) {
    if (!isAuthed) {
      // Logout - redirect to index
      store.clearAuthSession();
      store.setAdminAuthenticated(false);
      window.location.href = "index.html";
      return;
    }
    adminDashboard.style.display = "block";
  }

  function resetSettings() {
    state.settings = {
      ...store.defaultState.settings,
    };
    persistState(true);
  }

  function addProduct() {
    const nextId = Math.max(0, ...state.products.map((product) => Number(product.id) || 0)) + 1;
    const newCategory = selectedCategory || "service";
    state.products.push(store.normalizeProduct({
      id: nextId,
      name: `สินค้าใหม่ ${nextId}`,
      category: newCategory,
      desc: "พิมพ์รายละเอียดสินค้าได้ที่นี่",
      price: 0,
      symbol: "N",
      cover: "linear-gradient(145deg,#32619a,#142642)",
      imageUrl: "",
      badge: "ใหม่",
    }, state.products.length));
    persistState(true);
  }

  function duplicateProduct(productId) {
    const source = state.products.find((product) => product.id === productId);
    if (!source) return;
    const nextId = Math.max(0, ...state.products.map((product) => Number(product.id) || 0)) + 1;
    state.products.push(store.normalizeProduct({ ...source, id: nextId, name: `${source.name} (สำเนา)` }, state.products.length));
    persistState(true);
  }

  function deleteProduct(productId) {
    if (state.products.length <= 1) {
      showToast("ต้องมีสินค้าอย่างน้อย 1 รายการ");
      return;
    }
    const product = state.products.find((item) => item.id === productId);
    if (!product) return;
    if (!confirm(`ลบสินค้า "${product.name}" ใช่หรือไม่`)) return;
    state.products = state.products.filter((item) => item.id !== productId);
    persistState(true);
  }

  function updateProductField(card, productId, field, value) {
    const product = state.products.find((item) => item.id === productId);
    if (!product) return;
    product[field] = field === "price" ? Math.max(0, Number(value || 0)) : value;
    if (field === "category") {
      product.categoryLabel = store.categoryLabels[value] || product.categoryLabel;
    }
    const normalized = store.normalizeProduct(product, state.products.findIndex((item) => item.id === productId));
    Object.assign(product, normalized);
    state = store.saveState(state);
    const headTitle = card.querySelector(".admin-card-header strong");
    const headMeta = card.querySelector(".product-index");
    const badge = card.querySelector(".product-badge");
    const symbol = card.querySelector(".product-symbol");
    const cover = card.querySelector(".product-cover");
    if (headTitle) headTitle.textContent = product.name;
    if (headMeta) headMeta.textContent = `#${state.products.findIndex((item) => item.id === productId) + 1}`;
    if (badge) badge.textContent = product.badge;
    if (symbol) symbol.textContent = product.symbol;
    if (cover) {
      cover.style.backgroundImage = product.imageUrl ? `url(${JSON.stringify(product.imageUrl)})` : "";
      cover.style.backgroundSize = product.imageUrl ? "cover" : "";
      cover.style.backgroundPosition = product.imageUrl ? "center" : "";
    }
    syncSummary();
    syncPageBindings();
  }

  function updateSetting(field, value) {
    state.settings[field] = value;
    state = store.saveState(state);
    syncPageBindings();
    syncSummary();
  }

  function openTab(tab) {
    document.querySelectorAll("[data-tab-target]").forEach((button) => {
      button.classList.toggle("active", button.dataset.tabTarget === tab);
    });
    if (tab === "settings") {
      document.getElementById("settingsPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      document.getElementById("productsPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }


  saveButton.addEventListener("click", () => {
    persistState(true);
  });

  categoryTabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-category]");
    if (!tab) return;
    selectedCategory = tab.dataset.category;
    renderCategoryTabs();
    renderProducts();
  });

  addCategoryButton.addEventListener("click", () => {
    const categories = getCategories();
    const newCategoryName = prompt("ชื่อหมวดหมู่ใหม่:");
    if (!newCategoryName) return;

    // For now, we'll just add products with existing category codes
    // In a real system, you'd want to extend the data structure
    showToast("ต้องระบุหมวด premium, game, หรือ service");
  });

  resetSettingsButton.addEventListener("click", resetSettings);

  [logoutButton, logoutButtonTop].forEach((button) => {
    button.addEventListener("click", () => {
      (async () => {
        const session = store.loadAuthSession();
        if (session?.token && session.token !== "local-admin-token") {
          try {
            await apiRequest("/api/logout", {
              method: "POST",
              body: JSON.stringify({ token: session.token }),
            });
          } catch {
            // best effort
          }
        }
        store.clearAuthSession();
        store.setAdminAuthenticated(false);
        loginForm.reset();
        window.location.href = "index.html";
      })();
    });
  });

  adminNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab-target]");
    if (!button) return;
    openTab(button.dataset.tabTarget);
  });

  document.getElementById("settingsPanel").addEventListener("input", (event) => {
    const target = event.target;
    if (!target.id) return;
    const map = {
      storeName: "name",
      storeTagline: "tagline",
      bannerLabel: "bannerLabel",
      announcement: "announcement",
      footerNote: "footerNote",
    };
    const field = map[target.id];
    if (!field) return;
    updateSetting(field, target.value);
  });

  productList.addEventListener("input", (event) => {
    const card = event.target.closest("[data-product-id]");
    if (!card) return;
    const productId = Number(card.dataset.productId);
    const field = event.target.dataset.field;
    if (!field) return;
    updateProductField(card, productId, field, event.target.value);
  });

  productList.addEventListener("change", (event) => {
    const card = event.target.closest("[data-product-id]");
    if (!card) return;

    const productId = Number(card.dataset.productId);
    if (event.target.matches("[data-cover-file]")) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        updateProductField(card, productId, "imageUrl", reader.result);
        const cover = card.querySelector(".product-cover");
        cover.style.backgroundImage = `url(${JSON.stringify(reader.result)})`;
        cover.style.backgroundSize = "cover";
        cover.style.backgroundPosition = "center";
        persistState(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    const field = event.target.dataset.field;
    if (!field) return;
    updateProductField(card, productId, field, event.target.value);
    persistState(false);
  });

  productList.addEventListener("click", (event) => {
    // Handle add product button
    const addBtn = event.target.closest("[data-action='add-new']");
    if (addBtn) {
      addProduct();
      return;
    }

    // Handle product card actions
    const card = event.target.closest("[data-product-id]");
    if (!card) return;
    const productId = Number(card.dataset.productId);
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.dataset.action === "duplicate") {
      duplicateProduct(productId);
      return;
    }
    if (button.dataset.action === "delete") {
      deleteProduct(productId);
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === store.storageKey) {
      state = store.loadState();
      if (store.isAdminAuthenticated()) {
        syncPageBindings();
        syncSettingsForm();
        syncSummary();
        renderCategoryTabs();
        renderProducts();
      }
    }
    if (event.key === store.adminSessionKey) {
      const isAuthed = store.isAdminAuthenticated();
      setAuthView(isAuthed);
      if (isAuthed) {
        syncPageBindings();
        syncSettingsForm();
        syncSummary();
        renderCategoryTabs();
        renderProducts();
      }
    }
  });

  // Check authentication on page load
  let isAuthed = store.isAdminAuthenticated();

  // If not authenticated, try to authenticate with default credentials
  if (!isAuthed) {
    const adminUser = {
      id: "admin",
      name: "Administrator",
      email: "admin",
      role: "admin",
      avatarUrl: "",
    };
    store.setAuthSession({
      token: "local-admin-token",
      user: adminUser,
    });
    store.setAdminAuthenticated(true);
    isAuthed = true;
  }

  if (isAuthed) {
    // Initialize dashboard if authenticated
    syncPageBindings();
    syncSettingsForm();
    syncSummary();
    renderCategoryTabs();
    renderProducts();
  }
})();
