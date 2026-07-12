const http = require("http");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
function loadEnvFile(filePath) {
  if (!fsSync.existsSync(filePath)) return;

  const content = fsSync.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) continue;

    let value = trimmed.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const PORT = Number(process.env.PORT || 3000);
const NOTION_TOKEN = process.env.NOTION_TOKEN || "";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "";
const NOTION_VERSION = process.env.NOTION_VERSION || "2022-06-28";
const SESSION_SECRET = process.env.SESSION_SECRET || "nexora-session-secret";
const ADMIN_ID = normalizeEmail(process.env.ADMIN_ID || "admin");
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "1234");
const ADMIN_NAME = normalizeText(process.env.ADMIN_NAME || "Administrator");
const ADMIN_AVATAR_URL = normalizeText(process.env.ADMIN_AVATAR_URL || "");
const AUTH_MODE = NOTION_TOKEN && NOTION_DATABASE_ID ? "notion" : "local";
const LOCAL_AUTH_FILE = path.join(ROOT, ".nexora-auth-users.json");

const NOTION_PROPERTIES = {
  name: process.env.NOTION_NAME_PROPERTY || "Name",
  email: process.env.NOTION_EMAIL_PROPERTY || "Email",
  passwordHash: process.env.NOTION_PASSWORD_HASH_PROPERTY || "Password Hash",
  passwordSalt: process.env.NOTION_PASSWORD_SALT_PROPERTY || "Password Salt",
  avatarUrl: process.env.NOTION_AVATAR_PROPERTY || "Avatar",
  role: process.env.NOTION_ROLE_PROPERTY || "Role",
  createdAt: process.env.NOTION_CREATED_AT_PROPERTY || "Created At",
  lastLoginAt: process.env.NOTION_LAST_LOGIN_AT_PROPERTY || "Last Login At",
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function sendJson(res, statusCode, payload) {
  const body = Buffer.from(JSON.stringify(payload));
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length,
  });
  res.end(body);
}

function sendText(res, statusCode, text, contentType = "text/plain; charset=utf-8") {
  const body = Buffer.from(text);
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Content-Length": body.length,
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
      if (Buffer.concat(chunks).length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function normalizeText(value, fallback = "") {
  const result = String(value ?? "").trim();
  return result || fallback;
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function makeId(prefix = "usr") {
  return `${prefix}_${crypto.randomBytes(10).toString("hex")}`;
}

function makeSalt() {
  return crypto.randomBytes(16).toString("hex");
}

function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signSession(payload) {
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifySession(token) {
  if (!token || typeof token !== "string") return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  if (expected.length !== signature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(body));
    if (!payload || typeof payload !== "object") return null;
    return payload;
  } catch {
    return null;
  }
}

function normalizeStoredUser(user) {
  const source = user || {};
  return {
    id: normalizeText(source.id, ""),
    name: normalizeText(source.name, normalizeText(source.email, "Guest")),
    email: normalizeEmail(source.email),
    avatarUrl: normalizeText(source.avatarUrl, ""),
    role: normalizeText(source.role, "user"),
    createdAt: normalizeText(source.createdAt, ""),
    lastLoginAt: normalizeText(source.lastLoginAt, ""),
    passwordHash: normalizeText(source.passwordHash, ""),
    passwordSalt: normalizeText(source.passwordSalt, ""),
  };
}

function sanitizeUser(user) {
  const normalized = normalizeStoredUser(user);
  return {
    id: normalized.id,
    name: normalized.name,
    email: normalized.email,
    avatarUrl: normalized.avatarUrl,
    role: normalized.role,
    createdAt: normalized.createdAt,
    lastLoginAt: normalized.lastLoginAt,
  };
}

async function readLocalUsers() {
  try {
    const raw = await fs.readFile(LOCAL_AUTH_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.users) ? parsed.users.map((user) => normalizeStoredUser(user)) : [];
  } catch {
    return [];
  }
}

async function writeLocalUsers(users) {
  const payload = JSON.stringify({ users }, null, 2);
  await fs.writeFile(LOCAL_AUTH_FILE, payload, "utf8");
}

function getPropertyText(property) {
  return property?.title?.[0]?.plain_text
    || property?.rich_text?.[0]?.plain_text
    || property?.email
    || property?.url
    || property?.select?.name
    || property?.date?.start
    || "";
}

function notionUserFromPage(page) {
  const properties = page?.properties || {};
  return normalizeStoredUser({
    id: page?.id,
    name: getPropertyText(properties[NOTION_PROPERTIES.name]),
    email: getPropertyText(properties[NOTION_PROPERTIES.email]),
    avatarUrl: getPropertyText(properties[NOTION_PROPERTIES.avatarUrl]),
    role: getPropertyText(properties[NOTION_PROPERTIES.role]),
    createdAt: getPropertyText(properties[NOTION_PROPERTIES.createdAt]),
    lastLoginAt: getPropertyText(properties[NOTION_PROPERTIES.lastLoginAt]),
    passwordHash: getPropertyText(properties[NOTION_PROPERTIES.passwordHash]),
    passwordSalt: getPropertyText(properties[NOTION_PROPERTIES.passwordSalt]),
  });
}

function buildNotionUserProperties(user) {
  return {
    [NOTION_PROPERTIES.name]: {
      title: [{ text: { content: user.name } }],
    },
    [NOTION_PROPERTIES.email]: {
      rich_text: [{ text: { content: user.email } }],
    },
    [NOTION_PROPERTIES.passwordHash]: {
      rich_text: [{ text: { content: user.passwordHash } }],
    },
    [NOTION_PROPERTIES.passwordSalt]: {
      rich_text: [{ text: { content: user.passwordSalt } }],
    },
    [NOTION_PROPERTIES.avatarUrl]: {
      rich_text: [{ text: { content: user.avatarUrl || "" } }],
    },
    [NOTION_PROPERTIES.role]: {
      rich_text: [{ text: { content: user.role || "user" } }],
    },
  };
}

async function notionRequest(urlPath, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${urlPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const message = data?.message || data?.error || `Notion request failed with ${response.status}`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

async function notionQueryUser(email) {
  const data = await notionRequest(`/databases/${NOTION_DATABASE_ID}/query`, {
    method: "POST",
    body: JSON.stringify({
      filter: {
        property: NOTION_PROPERTIES.email,
        rich_text: { equals: email },
      },
      page_size: 1,
    }),
  });

  const page = data?.results?.[0];
  return page ? notionUserFromPage(page) : null;
}

async function notionCreateUser(user) {
  const data = await notionRequest("/pages", {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: buildNotionUserProperties(user),
    }),
  });
  return notionUserFromPage(data);
}

async function notionUpdateLastLogin(pageId, lastLoginAt) {
  await notionRequest(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        [NOTION_PROPERTIES.lastLoginAt]: {
          date: { start: lastLoginAt },
        },
      },
    }),
  });
}

async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail === ADMIN_ID) {
    return getAdminUser();
  }

  if (AUTH_MODE === "notion") {
    return notionQueryUser(normalizedEmail);
  }

  const users = await readLocalUsers();
  return users.find((user) => normalizeEmail(user.email) === normalizedEmail) || null;
}

async function createUser(user) {
  if (AUTH_MODE === "notion") {
    return notionCreateUser(user);
  }

  const users = await readLocalUsers();
  const normalized = normalizeStoredUser(user);
  users.push(normalized);
  await writeLocalUsers(users);
  return normalized;
}

async function updateLastLogin(user, lastLoginAt) {
  if (AUTH_MODE === "notion") {
    try {
      await notionUpdateLastLogin(user.id, lastLoginAt);
    } catch {
      // Treat this as best-effort so login can still succeed even if the
      // database column type doesn't match the optional login metadata.
    }
    return;
  }

  const users = await readLocalUsers();
  const index = users.findIndex((item) => item.id === user.id);
  if (index !== -1) {
    users[index].lastLoginAt = lastLoginAt;
    await writeLocalUsers(users);
  }
}

function buildSession(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    issuedAt: new Date().toISOString(),
  };
  return signSession(payload);
}

function getAdminUser() {
  const now = new Date().toISOString();
  return sanitizeUser({
    id: "admin",
    name: ADMIN_NAME,
    email: ADMIN_ID,
    avatarUrl: ADMIN_AVATAR_URL,
    role: "admin",
    createdAt: now,
    lastLoginAt: now,
  });
}

async function authenticate(email, password) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (normalizedEmail === ADMIN_ID && password === ADMIN_PASSWORD) {
    return getAdminUser();
  }

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const rawPasswordHash = user.passwordHash || "";
  const rawSalt = user.passwordSalt || "";
  const expectedHash = hashPassword(password, rawSalt);
  if (!rawPasswordHash || expectedHash !== rawPasswordHash) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const nextLoginAt = new Date().toISOString();
  await updateLastLogin(user, nextLoginAt);
  return sanitizeUser({
    ...user,
    lastLoginAt: nextLoginAt,
  });
}

async function register(input) {
  const name = normalizeText(input.name);
  const email = normalizeEmail(input.email);
  const password = String(input.password || "");
  const confirmPassword = String(input.confirmPassword || "");
  const avatarUrl = normalizeText(input.avatarUrl);

  if (!name || !email || !password) {
    const error = new Error("Name, email and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error("Password must be at least 8 characters");
    error.statusCode = 400;
    throw error;
  }

  if (password !== confirmPassword) {
    const error = new Error("Passwords do not match");
    error.statusCode = 400;
    throw error;
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date().toISOString();
  const salt = makeSalt();
  const user = await createUser({
    id: makeId(),
    name,
    email,
    avatarUrl,
    role: "user",
    passwordHash: hashPassword(password, salt),
    passwordSalt: salt,
    createdAt: now,
    lastLoginAt: now,
  });

  return sanitizeUser(user);
}

function getTokenFromRequest(req, body = {}) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) return authHeader.slice(7).trim();
  return body.token || req.headers["x-session-token"] || "";
}

async function getCurrentUser(req, body = {}) {
  const token = getTokenFromRequest(req, body);
  const payload = verifySession(token);
  if (!payload?.email) return null;

  const user = await findUserByEmail(normalizeEmail(payload.email));
  if (!user) return null;
  return sanitizeUser(user);
}

async function handleApi(req, res, pathname) {
  try {
    if (pathname === "/api/health" && req.method === "GET") {
      sendJson(res, 200, {
        ok: true,
        mode: AUTH_MODE,
        notionConfigured: AUTH_MODE === "notion",
      });
      return true;
    }

    if (pathname === "/api/me" && req.method === "GET") {
      const user = await getCurrentUser(req);
      if (!user) {
        sendJson(res, 401, { ok: false, message: "Not authenticated" });
        return true;
      }
      sendJson(res, 200, { ok: true, user });
      return true;
    }

    if (pathname === "/api/register" && req.method === "POST") {
      const body = await readJsonBody(req);
      const user = await register(body);
      const token = buildSession(user);
      sendJson(res, 200, { ok: true, token, user });
      return true;
    }

    if (pathname === "/api/login" && req.method === "POST") {
      const body = await readJsonBody(req);
      const user = await authenticate(body.email, body.password);
      const token = buildSession(user);
      sendJson(res, 200, { ok: true, token, user });
      return true;
    }

    if (pathname === "/api/logout" && req.method === "POST") {
      sendJson(res, 200, { ok: true });
      return true;
    }

    return false;
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(res, statusCode, {
      ok: false,
      message: error.message || "Internal server error",
      details: error.details || null,
    });
    return true;
  }
}

function resolveFilePath(requestPath) {
  const normalizedPath = decodeURIComponent(requestPath).replace(/^\/+/, "");
  const safePath = path.normalize(normalizedPath || "index.html");
  if (safePath.startsWith("..")) {
    return null;
  }
  const candidate = path.join(ROOT, safePath === "." ? "index.html" : safePath);
  return candidate;
}

async function serveFile(res, requestPath) {
  let filePath = resolveFilePath(requestPath);
  if (!filePath) {
    sendText(res, 400, "Bad request");
    return;
  }

  try {
    let stat = await fs.stat(filePath).catch(() => null);
    if (stat && stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      stat = await fs.stat(filePath).catch(() => null);
    }
    if (!stat) {
      const withHtml = `${filePath}.html`;
      stat = await fs.stat(withHtml).catch(() => null);
      if (stat) filePath = withHtml;
    }
    if (!stat) {
      sendText(res, 404, "Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const data = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": data.length,
    });
    res.end(data);
  } catch (error) {
    sendText(res, 500, `Failed to serve file: ${error.message}`);
  }
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = requestUrl.pathname;

  if (pathname.startsWith("/api/")) {
    const handled = await handleApi(req, res, pathname);
    if (!handled) sendJson(res, 404, { ok: false, message: "Unknown API route" });
    return;
  }

  const staticPath = pathname === "/" ? "/index.html" : pathname;
  await serveFile(res, staticPath);
});

function startServer(initialPort) {
  let nextPort = initialPort;

  const attemptListen = () => {
    server.listen(nextPort, () => {
      console.log(`NEXORA server running on http://localhost:${nextPort}`);
      console.log(`Auth mode: ${AUTH_MODE}`);
      if (nextPort !== initialPort) {
        console.log(`Port ${initialPort} was busy, switched to ${nextPort}`);
      }
    });
  };

  server.once("error", (error) => {
    if (error.code === "EADDRINUSE") {
      nextPort += 1;
      console.log(`Port ${nextPort - 1} is already in use, trying ${nextPort}...`);
      server.removeAllListeners("error");
      startServer(nextPort);
      return;
    }

    console.error(error);
    process.exit(1);
  });

  attemptListen();
}

startServer(PORT);
