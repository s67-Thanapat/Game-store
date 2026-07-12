(function () {
  const STORAGE_KEY = "nexora-store-state";
  const ADMIN_SESSION_KEY = "nexora-admin-session";
  const AUTH_SESSION_KEY = "nexora-auth-session";

  const CATEGORY_LABELS = {
    premium: "แอปพรีเมียม",
    game: "เกม & ไอเท็ม",
    service: "บริการออนไลน์",
  };

  const DEFAULT_STATE = {
    settings: {
      name: "NEXORA",
      tagline: "DIGITAL STORE",
      bannerLabel: "WELCOME TO",
      announcement:
        "ยินดีต้อนรับสู่ NEXORA ร้านค้าดิจิทัลอัตโนมัติ เปิดให้บริการตลอด 24 ชั่วโมง",
      footerNote:
        "ร้านค้าดิจิทัลที่ให้ความสำคัญกับความเร็ว ความปลอดภัย และประสบการณ์ที่ดีของคุณ",
    },
    products: [
      {
        id: 1,
        name: "Stream Plus",
        category: "premium",
        categoryLabel: "แอปพรีเมียม",
        desc: "แพ็กเกจดูหนังและซีรีส์แบบส่วนตัว 30 วัน",
        price: 189,
        symbol: "S+",
        cover: "linear-gradient(145deg,#743848,#241425)",
        imageUrl: "",
        badge: "ขายดี",
      },
      {
        id: 2,
        name: "Music Unlimited",
        category: "premium",
        categoryLabel: "แอปพรีเมียม",
        desc: "ฟังเพลงไม่มีโฆษณา คุณภาพเสียงสูง 30 วัน",
        price: 129,
        symbol: "M",
        cover: "linear-gradient(145deg,#186c54,#0d2823)",
        imageUrl: "",
        badge: "ยอดนิยม",
      },
      {
        id: 3,
        name: "Creator Pro",
        category: "service",
        categoryLabel: "บริการออนไลน์",
        desc: "เครื่องมือออกแบบสำหรับครีเอเตอร์ 30 วัน",
        price: 159,
        symbol: "C",
        cover: "linear-gradient(145deg,#5b36a8,#22204e)",
        imageUrl: "",
        badge: "แนะนำ",
      },
      {
        id: 4,
        name: "Game Credits 500",
        category: "game",
        categoryLabel: "เกม & ไอเท็ม",
        desc: "เครดิตเกมพร้อมใช้งาน ส่งโค้ดอัตโนมัติ",
        price: 220,
        symbol: "G",
        cover: "linear-gradient(145deg,#1a6280,#12213e)",
        imageUrl: "",
        badge: "ส่งไว",
      },
      {
        id: 5,
        name: "Cloud Drive 2TB",
        category: "service",
        categoryLabel: "บริการออนไลน์",
        desc: "พื้นที่เก็บไฟล์บนคลาวด์ ใช้งานได้ 30 วัน",
        price: 99,
        symbol: "☁",
        cover: "linear-gradient(145deg,#32619a,#142642)",
        imageUrl: "",
        badge: "คุ้มค่า",
      },
      {
        id: 6,
        name: "Battle Pass",
        category: "game",
        categoryLabel: "เกม & ไอเท็ม",
        desc: "ปลดล็อกรางวัลประจำซีซันและไอเท็มพิเศษ",
        price: 299,
        symbol: "BP",
        cover: "linear-gradient(145deg,#8a5a1f,#322011)",
        imageUrl: "",
        badge: "ใหม่",
      },
      {
        id: 7,
        name: "Office Suite",
        category: "service",
        categoryLabel: "บริการออนไลน์",
        desc: "ชุดโปรแกรมทำงานครบถ้วน ระยะเวลา 1 ปี",
        price: 490,
        symbol: "O",
        cover: "linear-gradient(145deg,#9a492f,#3a1b1a)",
        imageUrl: "",
        badge: "1 ปี",
      },
      {
        id: 8,
        name: "Chat Premium",
        category: "premium",
        categoryLabel: "แอปพรีเมียม",
        desc: "ปลดล็อกฟีเจอร์แชตและโปรไฟล์พิเศษ 30 วัน",
        price: 139,
        symbol: "✦",
        cover: "linear-gradient(145deg,#4855a5,#211d4b)",
        imageUrl: "",
        badge: "ฮิต",
      },
    ],
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeString(value, fallback = "") {
    const result = String(value ?? "").trim();
    return result || fallback;
  }

  function normalizeNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function normalizeProduct(product, index = 0) {
    const source = product || {};
    const category = ["premium", "game", "service"].includes(source.category) ? source.category : "service";
    const name = normalizeString(source.name, `สินค้า ${index + 1}`);
    const price = Math.max(0, normalizeNumber(source.price, 0));
    const badge = normalizeString(source.badge, "ใหม่");
    const symbol = normalizeString(source.symbol, name.slice(0, 2).toUpperCase());
    const cover = normalizeString(source.cover, "linear-gradient(145deg,#32619a,#142642)");
    const imageUrl = normalizeString(source.imageUrl, "");

    return {
      id: normalizeNumber(source.id, index + 1),
      name,
      category,
      categoryLabel: normalizeString(source.categoryLabel, CATEGORY_LABELS[category]),
      desc: normalizeString(source.desc, ""),
      price,
      symbol,
      cover,
      imageUrl,
      badge,
    };
  }

  function normalizeState(state) {
    const source = state || {};
    const settings = {
      name: normalizeString(source.settings?.name, DEFAULT_STATE.settings.name),
      tagline: normalizeString(source.settings?.tagline, DEFAULT_STATE.settings.tagline),
      bannerLabel: normalizeString(source.settings?.bannerLabel, DEFAULT_STATE.settings.bannerLabel),
      announcement: normalizeString(source.settings?.announcement, DEFAULT_STATE.settings.announcement),
      footerNote: normalizeString(source.settings?.footerNote, DEFAULT_STATE.settings.footerNote),
    };
    const products = Array.isArray(source.products) && source.products.length
      ? source.products.map((product, index) => normalizeProduct(product, index))
      : clone(DEFAULT_STATE.products);

    return { settings, products };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return normalizeState(raw ? JSON.parse(raw) : DEFAULT_STATE);
    } catch {
      return normalizeState(DEFAULT_STATE);
    }
  }

  function saveState(nextState) {
    const normalized = normalizeState(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function setAdminAuthenticated(value) {
    localStorage.setItem(ADMIN_SESSION_KEY, value ? "1" : "0");
  }

  function isAdminAuthenticated() {
    return localStorage.getItem(ADMIN_SESSION_KEY) === "1";
  }

  function normalizeUserProfile(user) {
    const source = user || {};
    return {
      id: normalizeString(source.id, ""),
      name: normalizeString(source.name, normalizeString(source.email, "Guest")),
      email: normalizeString(source.email, ""),
      avatarUrl: normalizeString(source.avatarUrl, ""),
      role: normalizeString(source.role, "user"),
      createdAt: normalizeString(source.createdAt, ""),
      lastLoginAt: normalizeString(source.lastLoginAt, ""),
    };
  }

  function setAuthSession(session) {
    if (!session) {
      localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }

    const normalized = {
      token: normalizeString(session.token, ""),
      user: normalizeUserProfile(session.user),
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function loadAuthSession() {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const token = normalizeString(parsed?.token, "");
      if (!token) return null;
      return {
        token,
        user: normalizeUserProfile(parsed?.user),
      };
    } catch {
      return null;
    }
  }

  function clearAuthSession() {
    localStorage.removeItem(AUTH_SESSION_KEY);
  }

  window.NEXORA_STORE = {
    storageKey: STORAGE_KEY,
    adminSessionKey: ADMIN_SESSION_KEY,
    authSessionKey: AUTH_SESSION_KEY,
    defaultState: clone(DEFAULT_STATE),
    categoryLabels: CATEGORY_LABELS,
    escapeHtml,
    normalizeState,
    loadState,
    saveState,
    setAdminAuthenticated,
    isAdminAuthenticated,
    normalizeUserProfile,
    setAuthSession,
    loadAuthSession,
    clearAuthSession,
    normalizeProduct,
  };
})();
