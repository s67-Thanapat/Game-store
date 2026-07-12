CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  name TEXT DEFAULT 'NEXORA',
  tagline TEXT DEFAULT 'DIGITAL STORE',
  bannerLabel TEXT DEFAULT 'WELCOME TO',
  announcement TEXT,
  footerNote TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  categoryLabel TEXT,
  desc TEXT,
  price INTEGER DEFAULT 0,
  symbol TEXT,
  cover TEXT,
  imageUrl TEXT,
  badge TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO settings (id, name, tagline, bannerLabel)
VALUES (1, 'NEXORA', 'DIGITAL STORE', 'WELCOME TO');
