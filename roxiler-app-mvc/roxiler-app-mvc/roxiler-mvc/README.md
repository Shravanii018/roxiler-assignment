# Roxiler Store Ratings Platform

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your MySQL credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`).
Then create the database and tables:

```bash
# In MySQL: CREATE DATABASE roxiler_ratings;
npm run db:init
```

`db:init` runs `init/index.js`, which syncs all tables via Sequelize and
seeds one default admin account (see `init/data.js`):

- **email:** admin@roxiler.com
- **password:** Admin@1234

Start the API:

```bash
npm run dev      # http://localhost:5000
```

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so
just open http://localhost:5173 in your browser.


