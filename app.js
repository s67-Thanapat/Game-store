const icons = {
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6.5 8.5h11l1 11h-13l1-11Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M14 7l5 5-5 5"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z"/><path d="M15 11h5v4h-5a2 2 0 1 1 0-4Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6"/><path d="M4 4v4.6h4.6M12 8v4l3 2"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10h16v10H4zM3 7h18v4H3zM12 7v13"/><path d="M12 7c-3.2 0-5.2-.7-5.2-2.3C6.8 3.5 7.8 3 8.7 3 10.6 3 12 7 12 7Zm0 0c3.2 0 5.2-.7 5.2-2.3 0-1.2-1-1.7-1.9-1.7C13.4 3 12 7 12 7Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 11 9-8 9 8"/><path d="M5.5 9.5V21h13V9.5M9.5 21v-7h5v7"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>'
};

const store = window.NEXORA_STORE;
let storeState = store.loadState();
let activeCategory = "all";
let showAllProducts = false;
let cart = JSON.parse(localStorage.getItem("nexora-cart") || "[]");

const productGrid = document.getElementById("productGrid");
const cartDrawer = document.getElementById("cartDrawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const modalLayer = document.getElementById("modalLayer");
const authModal = document.getElementById("authModal");
const accountModal = document.getElementById("accountModal");
const topupModal = document.getElementById("topupModal");
const navAuth = document.getElementById("navAuth");
const mobileAuthButton = document.getElementById("mobileAuthButton");
const siteHeader = document.querySelector(".site-header");
let authSession = store.loadAuthSession();
let currentUser = authSession?.user || null;
let authStatus = authSession?.token ? "loading" : "signed-out";

function escapeHtml(value) {
  return store.escapeHtml(value);
}

function renderIcons() {
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = icons[el.dataset.icon] || "";
  });
}

function getInitials(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";
}

function getAvatarMarkup(user, className = "profile-avatar") {
  const label = escapeHtml(getInitials(user?.name || user?.email));
  const avatarUrl = String(user?.avatarUrl || "").trim();
  if (avatarUrl) {
    return `<span class="${className}"><img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(user?.name || user?.email || "User")}"></span>`;
  }
  return `<span class="${className}">${label}</span>`;
}

async function apiRequest(pathname, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (authSession?.token) {
    headers.Authorization = `Bearer ${authSession.token}`;
  }

  const response = await fetch(pathname, {
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

function renderAuthControls() {
  if (!navAuth || !mobileAuthButton) return;

  if (!currentUser) {
    navAuth.innerHTML = `
      <button class="button button-soft desktop-login" data-open="login">เข้าสู่ระบบ</button>
      <button class="button button-primary" data-open="register">สมัครสมาชิก</button>
    `;
    mobileAuthButton.dataset.open = "login";
    mobileAuthButton.innerHTML = '<i data-icon="user"></i><span>บัญชี</span>';
    renderIcons();
    return;
  }

  const roleLabel = currentUser.role === "admin" ? "Admin" : "สมาชิก";
  navAuth.innerHTML = `
    ${currentUser.role === "admin" ? '<a class="button button-ghost nav-admin-link" href="admin.html">Admin</a>' : ""}
    <button class="profile-chip" type="button" id="profileChip" data-open="account">
      ${getAvatarMarkup(currentUser)}
      <span class="profile-meta">
        <strong>${escapeHtml(currentUser.name)}</strong>
        <small>${escapeHtml(roleLabel)}</small>
      </span>
    </button>
  `;
  mobileAuthButton.dataset.open = "account";
  mobileAuthButton.innerHTML = `${getAvatarMarkup(currentUser, "mobile-avatar")}<span>โปรไฟล์</span>`;
  renderIcons();
}

function renderAccountModal() {
  if (!accountModal) return;
  const avatar = document.getElementById("accountAvatar");
  const name = document.getElementById("accountName");
  const email = document.getElementById("accountEmail");
  const status = document.getElementById("accountStatus");
  const adminLink = document.getElementById("accountAdminLink");
  const logoutButton = document.getElementById("accountLogout");

  if (!currentUser) {
    avatar.innerHTML = "";
    avatar.textContent = "G";
    name.textContent = "Guest";
    email.textContent = "ยังไม่ได้เข้าสู่ระบบ";
    status.innerHTML = `<span>Guest</span>`;
    adminLink.style.display = "none";
    logoutButton.textContent = "เข้าสู่ระบบ";
    logoutButton.dataset.action = "open-login";
    return;
  }

  avatar.innerHTML = getAvatarMarkup(currentUser, "account-avatar-image");
  name.textContent = currentUser.name;
  email.textContent = currentUser.email;
  status.innerHTML = `
    <span>${currentUser.role === "admin" ? "Admin" : "Member"}</span>
    <span>${currentUser.lastLoginAt ? `Last login ${new Date(currentUser.lastLoginAt).toLocaleString("th-TH")}` : "Active"}</span>
  `;
  adminLink.style.display = currentUser.role === "admin" ? "inline-flex" : "none";
  logoutButton.textContent = "ออกจากระบบ";
  logoutButton.dataset.action = "logout";
}

function syncAuthState(session) {
  authSession = session || null;
  authStatus = session?.token ? "signed-in" : "signed-out";
  currentUser = session?.user || null;
  store.setAuthSession(session);
  store.setAdminAuthenticated(Boolean(currentUser && currentUser.role === "admin"));
  renderAuthControls();
  renderAccountModal();
}

async function refreshAuthSession() {
  if (!authSession?.token) {
    authStatus = "signed-out";
    currentUser = null;
    renderAuthControls();
    renderAccountModal();
    return;
  }

  try {
    const response = await apiRequest("/api/me");
    const nextSession = { token: authSession.token, user: response.user };
    syncAuthState(nextSession);
  } catch (error) {
    // Only sign out / clear session if the server returned 401 (Unauthorized) or 403 (Forbidden)
    if (error.statusCode === 401 || error.statusCode === 403) {
      authStatus = "signed-out";
      authSession = null;
      currentUser = null;
      store.clearAuthSession();
      renderAuthControls();
      renderAccountModal();
    } else {
      // Keep current user session if it is a network error or server is offline
      console.warn("Auth check failed due to a network/server error. Session is kept active:", error);
      authStatus = "signed-in";
      renderAuthControls();
      renderAccountModal();
    }
  }
}

function updateStoreText() {
  const settings = storeState.settings;
  document.title = `${settings.name} — Digital Store`;

  document.querySelectorAll("[data-store-name]").forEach((el) => {
    el.textContent = settings.name;
  });
  document.querySelectorAll("[data-store-tagline]").forEach((el) => {
    el.textContent = settings.tagline;
  });
  document.querySelectorAll("[data-store-label]").forEach((el) => {
    el.textContent = settings.bannerLabel;
  });
  document.querySelectorAll("[data-store-announcement]").forEach((el) => {
    el.textContent = settings.announcement;
  });
  document.querySelectorAll("[data-store-footer]").forEach((el) => {
    el.textContent = settings.footerNote;
  });
}

function getProducts() {
  return storeState.products;
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

function renderProducts() {
  const filtered = getProducts().filter((product) => activeCategory === "all" || product.category === activeCategory);
  productGrid.innerHTML = filtered.map((product, index) => `
    <article class="product-card ${!showAllProducts && index > 3 ? "hidden" : ""}">
      <div class="product-cover ${product.imageUrl ? "has-image" : ""}" style="${productCoverStyle(product)}">
        <span class="product-badge">${escapeHtml(product.badge)}</span>
        <span class="product-symbol">${escapeHtml(product.symbol)}</span>
      </div>
      <div class="product-body">
        <span class="product-category">${escapeHtml(product.categoryLabel)}</span>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.desc)}</p>
        <div class="product-bottom">
          <div class="price"><small>เริ่มต้น</small><strong>฿${Number(product.price || 0).toLocaleString("th-TH")}</strong></div>
          <button class="add-cart" data-add="${product.id}" aria-label="เพิ่ม ${escapeHtml(product.name)} ลงตะกร้า">${icons.plus}</button>
        </div>
      </div>
    </article>
  `).join("");

  document.getElementById("showAll").style.display = filtered.length <= 4 || showAllProducts ? "none" : "inline-flex";
}

function saveCart() {
  localStorage.setItem("nexora-cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const products = getProducts();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product?.price || 0) * item.qty;
  }, 0);

  document.getElementById("cartCount").textContent = count;
  document.getElementById("mobileCartCount").textContent = count;
  document.getElementById("cartSummary").textContent = count ? `${count} รายการในตะกร้า` : "ยังไม่มีสินค้า";
  document.getElementById("cartTotal").textContent = `฿${total.toLocaleString("th-TH")}`;
  document.getElementById("emptyCart").classList.toggle("show", !cart.length);
  document.getElementById("cartFooter").classList.toggle("hide", !cart.length);
  document.getElementById("cartItems").style.display = cart.length ? "block" : "none";
  document.getElementById("cartItems").innerHTML = cart.map((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) return "";
    return `
      <div class="cart-item">
        <div class="cart-item-icon ${product.imageUrl ? "has-image" : ""}" style="${productCoverStyle(product)}">${escapeHtml(product.symbol)}</div>
        <div>
          <h4>${escapeHtml(product.name)}</h4>
          <small>จำนวน ${item.qty} · พร้อมส่งทันที</small>
        </div>
        <div>
          <strong>฿${(product.price * item.qty).toLocaleString("th-TH")}</strong>
          <button class="remove-item" data-remove="${product.id}">ลบ</button>
        </div>
      </div>
    `;
  }).join("");
}

function setCart(open) {
  cartDrawer.classList.toggle("open", open);
  drawerBackdrop.classList.toggle("open", open);
  cartDrawer.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("locked", open);
}

function setAuthMode(mode) {
  authModal.classList.toggle("register-mode", mode === "register");
  document.querySelectorAll("[data-auth]").forEach((button) => {
    button.classList.toggle("active", button.dataset.auth === mode);
  });
  document.getElementById("authSubmit").textContent = mode === "register" ? "สร้างบัญชี" : "เข้าสู่ระบบ";
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  emailInput.type = mode === "register" ? "email" : "text";
  emailInput.placeholder = mode === "register" ? "name@email.com" : "admin หรืออีเมลของคุณ";
  passwordInput.minLength = mode === "register" ? 8 : 0;
  passwordInput.placeholder = mode === "register" ? "อย่างน้อย 8 ตัวอักษร" : "รหัสผ่าน";
  confirmPasswordInput.required = mode === "register";
  confirmPasswordInput.minLength = mode === "register" ? 8 : 0;
  document.getElementById("name").required = mode === "register";
  document.getElementById("avatarUrl").required = false;
}

function openModal(type) {
  modalLayer.classList.add("open");
  modalLayer.setAttribute("aria-hidden", "false");
  authModal.classList.toggle("active", type === "login" || type === "register");
  accountModal.classList.toggle("active", type === "account");
  topupModal.classList.toggle("active", type === "topup");
  if (type === "login" || type === "register") setAuthMode(type);
  if (type === "account") renderAccountModal();
  document.body.classList.add("locked");
}

function closeModal() {
  modalLayer.classList.remove("open");
  modalLayer.setAttribute("aria-hidden", "true");
  authModal.classList.remove("active");
  accountModal.classList.remove("active");
  topupModal.classList.remove("active");
  document.body.classList.remove("locked");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.querySelector("p").textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function syncFromStorage() {
  storeState = store.loadState();
  updateStoreText();
  renderProducts();
  renderCart();
}

document.addEventListener("DOMContentLoaded", () => {
  renderIcons();
  updateStoreText();
  renderProducts();
  renderCart();
  syncAuthState(authSession);
  refreshAuthSession();
});

document.getElementById("categoryTabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  showAllProducts = false;
  document.querySelectorAll("[data-category]").forEach((item) => item.classList.toggle("active", item === button));
  renderProducts();
});

document.querySelectorAll("[data-category-jump]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(`[data-category="${button.dataset.categoryJump}"]`);
    if (target) target.click();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("showAll").addEventListener("click", () => {
  showAllProducts = true;
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const product = getProducts().find((item) => item.id === Number(button.dataset.add));
  if (!product) return;
  const current = cart.find((item) => item.id === product.id);
  if (current) current.qty += 1;
  else cart.push({ id: product.id, qty: 1 });
  saveCart();
  showToast(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
});

document.getElementById("cartItems").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  cart = cart.filter((item) => item.id !== Number(button.dataset.remove));
  saveCart();
});

["cartButton", "mobileCart"].forEach((id) => {
  document.getElementById(id).addEventListener("click", () => setCart(true));
});
document.getElementById("closeCart").addEventListener("click", () => setCart(false));
drawerBackdrop.addEventListener("click", () => setCart(false));

document.getElementById("emptyShop").addEventListener("click", () => {
  setCart(false);
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  setCart(false);
  if (!currentUser) {
    openModal("login");
    showToast("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
    return;
  }
  showToast(`พร้อมดำเนินการต่อในนาม ${currentUser.name}`);
});

document.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open]");
  if (openButton) {
    event.preventDefault();
    openModal(openButton.dataset.open);
    return;
  }

  const closeButton = event.target.closest("[data-close-modal]");
  if (closeButton) {
    closeModal();
  }
});

document.querySelector(".auth-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-auth]");
  if (button) setAuthMode(button.dataset.auth);
});

document.getElementById("authForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const mode = authModal.classList.contains("register-mode") ? "register" : "login";
  const payload = {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
  };

  if (mode === "register") {
    payload.name = document.getElementById("name").value.trim();
    payload.avatarUrl = document.getElementById("avatarUrl").value.trim();
    payload.confirmPassword = document.getElementById("confirmPassword").value;
  }

  const submitButton = document.getElementById("authSubmit");
  submitButton.disabled = true;

  (async () => {
    try {
      const response = await apiRequest(`/api/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      syncAuthState({ token: response.token, user: response.user });
      closeModal();
      if (response.user?.role === "admin") {
        showToast("เข้าสู่ระบบผู้ดูแลสำเร็จ กำลังเปิดหน้าจัดการ");
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 350);
        return;
      }
      showToast(mode === "register" ? `สร้างบัญชีสำเร็จ ยินดีต้อนรับ ${response.user.name}` : `เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${response.user.name}`);
    } catch (error) {
      showToast(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      submitButton.disabled = false;
    }
  })();
});

document.getElementById("accountLogout").addEventListener("click", async () => {
  if (!currentUser) {
    closeModal();
    openModal("login");
    return;
  }

  try {
    await apiRequest("/api/logout", { method: "POST", body: JSON.stringify({ token: authSession?.token || "" }) });
  } catch {
    // Logout is best-effort; clear local state either way.
  }

  syncAuthState(null);
  closeModal();
  showToast("ออกจากระบบแล้ว");
});

document.querySelector(".amount-grid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-amount]");
  if (!button) return;
  document.querySelectorAll("[data-amount]").forEach((item) => item.classList.toggle("active", item === button));
  document.getElementById("customAmount").value = button.dataset.amount;
});

document.getElementById("confirmTopup").addEventListener("click", () => {
  const amount = Math.max(20, Number(document.getElementById("customAmount").value || 0));
  closeModal();
  showToast(`สร้างรายการเติมเงิน ฿${amount.toLocaleString("th-TH")} แล้ว`);
});

document.querySelectorAll(".accordion article button").forEach((button) => {
  button.addEventListener("click", () => {
    const article = button.closest("article");
    document.querySelectorAll(".accordion article").forEach((item) => {
      if (item !== article) item.classList.remove("open");
    });
    article.classList.toggle("open");
  });
});

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", (event) => {
    if (button.getAttribute("href") === "#") event.preventDefault();
    showToast(button.dataset.toast);
  });
});

window.addEventListener("scroll", () => {
  siteHeader.classList.toggle("scrolled", window.scrollY > 20);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    setCart(false);
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

window.addEventListener("storage", (event) => {
  if (event.key === store.storageKey) {
    syncFromStorage();
  }
  if (event.key === store.authSessionKey) {
    authSession = store.loadAuthSession();
    currentUser = authSession?.user || null;
    renderAuthControls();
    renderAccountModal();
  }
});

syncFromStorage();
