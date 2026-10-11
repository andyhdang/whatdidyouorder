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
- 🐾 **Live shared splits** — create a join code so friends can select what they ordered together, with instant updates

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

### Configure live shared splits (Supabase)

1. Create a free [Supabase](https://supabase.com) project and enable **Anonymous Sign-Ins** under **Authentication → Providers**.
2. Run [`supabase/shared-splits.sql`](./supabase/shared-splits.sql) in the Supabase SQL Editor.
3. Create `.env.local` with your project URL and **publishable** key:

   ```sh
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="your_publishable_key"
   ```

4. Add the same variables to your deployment environment.

Friends do not need Supabase accounts. The app creates an anonymous session for each browser; the join code grants that session access only to its shared split.

### Configure receipt extraction API

Set this environment variable before running serverless APIs locally/deployed:

```sh
export OPENAI_API_KEY="your_api_key_here"
```

`POST /api/extract-items` accepts JSON:

```json
{
  "imageBase64": "data:image/jpeg;base64,..."
}
```

Images are automatically compressed client-side before upload to stay within serverless payload limits (about 4MB request body, ~3MB decoded image).

You can also send `"imageUrl"` instead of `"imageBase64"`.  
Response format:

```json
{
  "items": [
    { "name": "Spicy Tuna Roll", "quantity": 2, "unitPrice": 8.5 }
  ]
}
```

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
