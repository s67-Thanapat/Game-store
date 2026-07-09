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

document.querySelectorAll("[data-icon]").forEach(el => {
  el.innerHTML = icons[el.dataset.icon] || "";
});

const products = [
  { id: 1, name: "Stream Plus", category: "premium", categoryLabel: "แอปพรีเมียม", desc: "แพ็กเกจดูหนังและซีรีส์แบบส่วนตัว 30 วัน", price: 189, symbol: "S+", cover: "linear-gradient(145deg,#743848,#241425)", badge: "ขายดี" },
  { id: 2, name: "Music Unlimited", category: "premium", categoryLabel: "แอปพรีเมียม", desc: "ฟังเพลงไม่มีโฆษณา คุณภาพเสียงสูง 30 วัน", price: 129, symbol: "M", cover: "linear-gradient(145deg,#186c54,#0d2823)", badge: "ยอดนิยม" },
  { id: 3, name: "Creator Pro", category: "service", categoryLabel: "บริการออนไลน์", desc: "เครื่องมือออกแบบสำหรับครีเอเตอร์ 30 วัน", price: 159, symbol: "C", cover: "linear-gradient(145deg,#5b36a8,#22204e)", badge: "แนะนำ" },
  { id: 4, name: "Game Credits 500", category: "game", categoryLabel: "เกม & ไอเทม", desc: "เครดิตเกมพร้อมใช้งาน ส่งโค้ดอัตโนมัติ", price: 220, symbol: "G", cover: "linear-gradient(145deg,#1a6280,#12213e)", badge: "ส่งไว" },
  { id: 5, name: "Cloud Drive 2TB", category: "service", categoryLabel: "บริการออนไลน์", desc: "พื้นที่เก็บไฟล์บนคลาวด์ ใช้งานได้ 30 วัน", price: 99, symbol: "☁", cover: "linear-gradient(145deg,#32619a,#142642)", badge: "คุ้มค่า" },
  { id: 6, name: "Battle Pass", category: "game", categoryLabel: "เกม & ไอเทม", desc: "ปลดล็อกรางวัลประจำซีซันและไอเทมพิเศษ", price: 299, symbol: "BP", cover: "linear-gradient(145deg,#8a5a1f,#322011)", badge: "ใหม่" },
  { id: 7, name: "Office Suite", category: "service", categoryLabel: "บริการออนไลน์", desc: "ชุดโปรแกรมทำงานครบถ้วน ระยะเวลา 1 ปี", price: 490, symbol: "O", cover: "linear-gradient(145deg,#9a492f,#3a1b1a)", badge: "1 ปี" },
  { id: 8, name: "Chat Premium", category: "premium", categoryLabel: "แอปพรีเมียม", desc: "ปลดล็อกฟีเจอร์แชตและโปรไฟล์พิเศษ 30 วัน", price: 139, symbol: "✦", cover: "linear-gradient(145deg,#4855a5,#211d4b)", badge: "ฮิต" }
];

const productGrid = document.getElementById("productGrid");
let activeCategory = "all";
let showAllProducts = false;
let cart = JSON.parse(localStorage.getItem("nexora-cart") || "[]");

function renderProducts() {
  const filtered = products.filter(p => activeCategory === "all" || p.category === activeCategory);
  productGrid.innerHTML = filtered.map((p, index) => `
    <article class="product-card ${!showAllProducts && index > 3 ? "hidden" : ""}">
      <div class="product-cover" style="--cover:${p.cover}">
        <span class="product-badge">${p.badge}</span>
        <span class="product-symbol">${p.symbol}</span>
      </div>
      <div class="product-body">
        <span class="product-category">${p.categoryLabel}</span>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-bottom">
          <div class="price"><small>เริ่มต้น</small><strong>฿${p.price}</strong></div>
          <button class="add-cart" data-add="${p.id}" aria-label="เพิ่ม ${p.name} ลงตะกร้า">${icons.plus}</button>
        </div>
      </div>
    </article>
  `).join("");
  document.getElementById("showAll").style.display = filtered.length <= 4 || showAllProducts ? "none" : "inline-flex";
}

document.getElementById("categoryTabs").addEventListener("click", e => {
  const button = e.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  showAllProducts = false;
  document.querySelectorAll("[data-category]").forEach(b => b.classList.toggle("active", b === button));
  renderProducts();
});

document.querySelectorAll("[data-category-jump]").forEach(button => {
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

productGrid.addEventListener("click", e => {
  const button = e.target.closest("[data-add]");
  if (!button) return;
  const product = products.find(p => p.id === Number(button.dataset.add));
  const current = cart.find(item => item.id === product.id);
  if (current) current.qty += 1;
  else cart.push({ id: product.id, qty: 1 });
  saveCart();
  showToast(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
});

function saveCart() {
  localStorage.setItem("nexora-cart", JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product?.price || 0) * item.qty;
  }, 0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("mobileCartCount").textContent = count;
  document.getElementById("cartSummary").textContent = count ? `${count} รายการในตะกร้า` : "ยังไม่มีสินค้า";
  document.getElementById("cartTotal").textContent = `฿${total.toLocaleString("th-TH")}`;
  document.getElementById("emptyCart").classList.toggle("show", !cart.length);
  document.getElementById("cartFooter").classList.toggle("hide", !cart.length);
  document.getElementById("cartItems").style.display = cart.length ? "block" : "none";
  document.getElementById("cartItems").innerHTML = cart.map(item => {
    const p = products.find(product => product.id === item.id);
    if (!p) return "";
    return `<div class="cart-item">
      <div class="cart-item-icon" style="--cover:${p.cover}">${p.symbol}</div>
      <div><h4>${p.name}</h4><small>จำนวน ${item.qty} · พร้อมส่งทันที</small></div>
      <div><strong>฿${(p.price * item.qty).toLocaleString("th-TH")}</strong><button class="remove-item" data-remove="${p.id}">ลบ</button></div>
    </div>`;
  }).join("");
}

document.getElementById("cartItems").addEventListener("click", e => {
  const button = e.target.closest("[data-remove]");
  if (!button) return;
  cart = cart.filter(item => item.id !== Number(button.dataset.remove));
  saveCart();
});

const cartDrawer = document.getElementById("cartDrawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
function setCart(open) {
  cartDrawer.classList.toggle("open", open);
  drawerBackdrop.classList.toggle("open", open);
  cartDrawer.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("locked", open);
}
["cartButton", "mobileCart"].forEach(id => document.getElementById(id).addEventListener("click", () => setCart(true)));
document.getElementById("closeCart").addEventListener("click", () => setCart(false));
drawerBackdrop.addEventListener("click", () => setCart(false));
document.getElementById("emptyShop").addEventListener("click", () => {
  setCart(false);
  document.getElementById("products").scrollIntoView();
});
document.getElementById("checkoutButton").addEventListener("click", () => {
  setCart(false);
  openModal("login");
  showToast("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
});

const modalLayer = document.getElementById("modalLayer");
const authModal = document.getElementById("authModal");
const topupModal = document.getElementById("topupModal");
function openModal(type) {
  modalLayer.classList.add("open");
  modalLayer.setAttribute("aria-hidden", "false");
  authModal.classList.toggle("active", type === "login" || type === "register");
  topupModal.classList.toggle("active", type === "topup");
  if (type === "login" || type === "register") setAuthMode(type);
  document.body.classList.add("locked");
}
function closeModal() {
  modalLayer.classList.remove("open");
  modalLayer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
}
document.querySelectorAll("[data-open]").forEach(button => button.addEventListener("click", () => openModal(button.dataset.open)));
document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closeModal));

function setAuthMode(mode) {
  authModal.classList.toggle("register-mode", mode === "register");
  document.querySelectorAll("[data-auth]").forEach(b => b.classList.toggle("active", b.dataset.auth === mode));
  document.getElementById("authSubmit").textContent = mode === "register" ? "สร้างบัญชี" : "เข้าสู่ระบบ";
  document.getElementById("confirmPassword").required = mode === "register";
}
document.querySelector(".auth-tabs").addEventListener("click", e => {
  const button = e.target.closest("[data-auth]");
  if (button) setAuthMode(button.dataset.auth);
});
document.getElementById("authForm").addEventListener("submit", e => {
  e.preventDefault();
  closeModal();
  showToast(authModal.classList.contains("register-mode") ? "สร้างบัญชีตัวอย่างสำเร็จ" : "เข้าสู่ระบบตัวอย่างสำเร็จ");
});

document.querySelector(".amount-grid").addEventListener("click", e => {
  const button = e.target.closest("[data-amount]");
  if (!button) return;
  document.querySelectorAll("[data-amount]").forEach(b => b.classList.toggle("active", b === button));
  document.getElementById("customAmount").value = button.dataset.amount;
});
document.getElementById("confirmTopup").addEventListener("click", () => {
  const amount = Math.max(20, Number(document.getElementById("customAmount").value || 0));
  closeModal();
  showToast(`สร้างรายการเติมเงิน ฿${amount.toLocaleString("th-TH")} แล้ว`);
});

document.querySelectorAll(".accordion article button").forEach(button => button.addEventListener("click", () => {
  const article = button.closest("article");
  document.querySelectorAll(".accordion article").forEach(item => {
    if (item !== article) item.classList.remove("open");
  });
  article.classList.toggle("open");
}));

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.querySelector("p").textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
document.querySelectorAll("[data-toast]").forEach(button => button.addEventListener("click", e => {
  if (button.getAttribute("href") === "#") e.preventDefault();
  showToast(button.dataset.toast);
}));

window.addEventListener("scroll", () => {
  document.querySelector(".site-header").classList.toggle("scrolled", scrollY > 20);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeModal();
    setCart(false);
  }
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

renderProducts();
renderCart();
