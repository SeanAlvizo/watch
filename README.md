<p align="center">
  <h1 align="center">⌚ The Digital Atelier</h1>
  <p align="center">
    <strong>A Premium Luxury Watch Management System</strong>
  </p>
  <p align="center">
    Full-stack inventory, CRM, sales, and analytics platform for high-end watch boutiques.<br/>
    Built with Next.js 16, Supabase, and Tailwind CSS.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.0-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
</p>

---

## 📖 Description

**The Digital Atelier** is a comprehensive luxury watch management system designed for high-end watch boutiques, dealers, and private collectors. It provides a unified ecosystem to manage inventory, clients, sales transactions, and business analytics — all in real-time.

### Key Highlights

- **Real-Time Everything** — All data syncs instantly across tabs and users via Supabase Realtime (WebSocket-powered Postgres changes)
- **Full CRUD Operations** — Add, edit, and delete watches, customers, and sales with modal-based forms
- **Authentication & Route Protection** — Supabase Auth with session cookies and middleware-based route guards
- **Dynamic Analytics** — KPIs, revenue charts, brand equity breakdown, and sell-through rates computed from live data
- **Data Export** — CSV export for sales/reports and full JSON workspace export
- **Public Catalog** — Client-facing collections page showcasing in-stock inventory
- **Premium UI** — Minimalist, editorial design inspired by luxury brand aesthetics

---

## ✨ Features

| Module | Features |
|--------|----------|
| **Authentication** | Email/password login, sign-up, session management, route protection |
| **Dashboard** | Live KPIs, brand distribution, activity feed, low stock alerts |
| **Inventory** | Full CRUD, search, filter by brand/status, activity logging |
| **Customers** | CRM system, VIP tiers, lifetime value tracking, preferred brands |
| **Sales** | Transaction processing, watch→sold automation, CSV export, status management |
| **Reports** | Net revenue, AOV, sell-through rate, monthly chart, brand equity |
| **Collections** | Public catalog, movement/condition filters, responsive grid |
| **Settings** | Profile editing, password change, data export, sign out |

---

## 📂 Project Structure

```
watch/
├── app/                          # Next.js App Router (Pages)
│   ├── layout.tsx                # Root layout (fonts, metadata, global styles)
│   ├── page.tsx                  # Root redirect (/ → /home)
│   ├── globals.css               # Global CSS + Tailwind + MD3 design tokens
│   ├── favicon.ico               # App icon
│   │
│   ├── home/
│   │   └── page.tsx              # 🏠 Public landing page (live valuation, demo form)
│   │
│   ├── login/
│   │   └── page.tsx              # 🔐 Auth page (sign in + sign up)
│   │
│   ├── dashboard/
│   │   └── page.tsx              # 📊 Admin dashboard (real-time KPIs, activity feed)
│   │
│   ├── inventory/
│   │   └── page.tsx              # ⌚ Watch inventory (CRUD + search + filters)
│   │
│   ├── customers/
│   │   └── page.tsx              # 👥 Client CRM (CRUD + VIP tiers)
│   │
│   ├── sales/
│   │   └── page.tsx              # 💰 Sales ledger (new sale flow + CSV export)
│   │
│   ├── reports/
│   │   └── page.tsx              # 📈 Analytics (computed KPIs + charts)
│   │
│   ├── collections/
│   │   └── page.tsx              # 🏛️ Public catalog (in-stock watches)
│   │
│   ├── settings/
│   │   └── page.tsx              # ⚙️ Account settings (profile, security, data)
│   │
│   └── legal/
│       └── page.tsx              # 📜 Legal / privacy policy page
│
├── components/                   # Reusable UI Components
│   ├── Sidebar.tsx               # Navigation sidebar (admin pages)
│   ├── TopNav.tsx                # Top navigation bar + logout dropdown
│   ├── MetricCard.tsx            # Dashboard KPI card
│   ├── ManufacturerCard.tsx      # Brand distribution card
│   ├── ActivityList.tsx          # Activity feed component
│   ├── LowStockAlert.tsx         # Low stock warning component
│   ├── InventoryCard.tsx         # Inventory display card
│   └── ActionItems.tsx           # Action items component
│
├── lib/                          # Utility Libraries
│   └── supabase/
│       ├── client.ts             # Browser-side Supabase client (createBrowserClient)
│       ├── server.ts             # Server-side Supabase client (createServerClient)
│       └── middleware.ts         # Auth session management + route protection logic
│
├── public/                       # Static Assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── middleware.ts                 # Next.js middleware entry (route protection)
├── .env.local                    # Environment variables (Supabase URL + Key)
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS configuration
├── eslint.config.mjs             # ESLint configuration
├── package.json                  # Dependencies and scripts
├── LICENSE                       # MIT License
└── README.md                     # This file
```

---

## 🗄️ Database Schema

```
┌──────────────────────┐     ┌──────────────────────┐
│       watches         │     │      customers        │
├──────────────────────┤     ├──────────────────────┤
│ id (uuid, PK)        │     │ id (uuid, PK)        │
│ brand (text)         │     │ first_name (text)     │
│ model (text)         │     │ last_name (text)      │
│ reference_number     │     │ email (text, unique)  │
│ serial_number        │     │ phone (text)          │
│ year (int)           │     │ tier (text)           │
│ condition (text)     │     │ preferred_brands []   │
│ movement (text)      │     │ lifetime_value (num)  │
│ case_size (text)     │     │ notes (text)          │
│ material (text)      │     │ created_at            │
│ price (numeric)      │     │ updated_at            │
│ status (text)        │     └──────────┬───────────┘
│ image_url (text)     │                │
│ provenance (text)    │                │
│ created_at           │     ┌──────────┴───────────┐
│ updated_at           │     │        sales          │
└──────────┬───────────┘     ├──────────────────────┤
           │                 │ id (uuid, PK)        │
           └────────────────►│ watch_id (FK)        │
                             │ customer_id (FK)     │
                             │ transaction_id       │
                             │ sale_price (numeric)  │
                             │ payment_method       │
                             │ status (text)        │
                             │ notes (text)         │
                             │ sold_at              │
                             └──────────────────────┘

┌──────────────────────┐
│    activity_log       │
├──────────────────────┤
│ id (uuid, PK)        │
│ type (text)          │
│ icon (text)          │
│ title (text)         │
│ description (text)   │
│ created_at           │
└──────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **npm** 9.x or later
- A **Supabase** account ([supabase.com](https://supabase.com))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/digital-atelier.git
cd digital-atelier
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Run the SQL migrations to create the database tables (see [Database Schema](#-database-schema))
3. Enable **Realtime** on all tables:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.watches;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
   ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
   ```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project → **Settings** → **API**.

### 5. Create an Admin User

Go to your Supabase dashboard → **Authentication** → **Users** → **Add User** and create an account, or use the **Sign Up** feature on `/login`.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 7. Build for Production

```bash
npm run build
npm start
```

---

## 🔐 Authentication

| Route | Access |
|-------|--------|
| `/home` | 🌐 Public |
| `/login` | 🌐 Public |
| `/collections` | 🌐 Public |
| `/legal` | 🌐 Public |
| `/dashboard` | 🔒 Authenticated |
| `/inventory` | 🔒 Authenticated |
| `/customers` | 🔒 Authenticated |
| `/sales` | 🔒 Authenticated |
| `/reports` | 🔒 Authenticated |
| `/settings` | 🔒 Authenticated |

Middleware intercepts all requests to protected routes and redirects unauthenticated users to `/login`.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI library |
| [TypeScript 5](https://typescriptlang.org/) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS framework |
| [Supabase](https://supabase.com/) | Backend-as-a-Service (Postgres, Auth, Realtime) |
| [@supabase/ssr](https://github.com/supabase/auth-helpers) | Server-side auth helpers for Next.js |
| [Material Symbols](https://fonts.google.com/icons) | Icon system |
| [Google Fonts](https://fonts.google.com/) | Typography (Noto Serif, Manrope) |

---

## 📱 User Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   /home     │────►│   /login     │────►│  /dashboard  │
│  (Landing)  │     │  (Auth Gate) │     │  (Overview)  │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │                           │                           │
             ┌──────▼───────┐           ┌──────▼───────┐           ┌──────▼───────┐
             │  /inventory  │           │  /customers  │           │    /sales    │
             │  (Add Watch) │──────────►│ (Add Client) │──────────►│ (Sell Watch) │
             └──────────────┘           └──────────────┘           └──────┬───────┘
                                                                          │
                                                                   ┌──────▼───────┐
                                                                   │  /reports    │
                                                                   │ (Analytics)  │
                                                                   └──────────────┘
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  <sub>Built with precision. Designed for the masters of time.</sub>
</p>
