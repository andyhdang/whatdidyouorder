# TabbySplit 🐱

> Split the bill, purrfectly.

TabbySplit is a web app for splitting restaurant bills among friends. Upload a receipt, add people, assign items, configure tax and tip, and share the final summary via a single link.

🔗 **Live demo:** https://andyhdang.github.io/whatdidyouorder

---

## Features

- 📷 **Upload a receipt** — attach a photo or PDF to reference while splitting
- 👥 **Add people** — give each person a name and emoji avatar
- 🧾 **Add items** — enter menu items with prices and assign them to one or more people
- 🧮 **Tax & tip** — configure tax as a percentage or fixed amount; tip as a preset %, custom %, or fixed dollar amount; split proportionally or equally
- 🔗 **Shareable summary** — generate a compressed URL and QR code to share the full breakdown with your group

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

### Install & run locally

```sh
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Other scripts

| Script | Description |
|---|---|
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run deploy` | Build and deploy to GitHub Pages |

---

## Project Structure

```
src/
  pages/        # Full-page views: UploadReceipt, People, Items, Assign, Summary
  components/   # Shared UI components: Card, TabGroup, Footer, Snackbar, etc.
  assets/       # Logos and images
api/            # Serverless API endpoints
public/         # Static assets (og-preview.png, CNAME)
```

---

## Tech Stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [lz-string](https://github.com/pieroxy/lz-string) — URL-safe state compression for shareable links
- [qrcode.react](https://github.com/zpao/qrcode.react) — QR code generation
- Deployed via [GitHub Pages](https://pages.github.com/)
