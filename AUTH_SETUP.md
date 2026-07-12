# Auth Setup

This project now supports real login and registration through a Node server and a Notion database.

## Run locally

1. Copy `.env.example` to `.env`.
2. Or create `.env.local` directly and fill in `NOTION_TOKEN`, `NOTION_DATABASE_ID`, and `SESSION_SECRET`.
3. Start the server:

```bash
npm start
```

Open `http://localhost:3000`.

## Notion database schema

Create a database with these property names:

- `Name` - title
- `Email` - rich text
- `Password Hash` - rich text
- `Password Salt` - rich text
- `Avatar` - rich text
- `Role` - rich text
- `Created At` - rich text
- `Last Login At` - rich text

If your property names differ, set the matching `NOTION_*_PROPERTY` env vars.
The server loads `.env.local` first, then `.env`.

## Behavior

- New registrations are stored in Notion.
- Login verifies password hashes on the server.
- The header shows avatar + name after login.
- Admin accounts show an `Admin` button beside the profile chip.
