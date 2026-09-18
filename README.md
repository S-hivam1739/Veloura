# Veloura - Modern Clothing E-Commerce Platform

Veloura is a modern, responsive full-stack clothing e-commerce platform built with Node.js, Express, Supabase (PostgreSQL), React, Tailwind CSS, Nodemailer (Real Email OTP verification & Order Confirmation Receipts), and Razorpay payment integration.

---

## 🚀 Features Highlights

1. **Curated 120-Product Catalogue**:
   - Exactly 30 products in each category: **Men (30)**, **Women (30)**, **Kids (30)**, and **Infants (30)**.
   - High quality, verified product photography matching actual luxury garments.
   - Subcategories: T-shirts, Shirts, Jeans, Hoodies, Jackets, Dresses, Kurtis, Rompers, Sleepwear.
2. **Supabase Database Integration**:
   - PostgreSQL schema with tables for `products`, `users`, `orders`, `order_items`, and `otps`.
   - Automated seeder to load all 120 products from `catalogue_120_products.json` into Supabase.
3. **Strict Indian Mobile Number Validation**:
   - Enforces exactly 10 digits starting with 6, 7, 8, or 9 (`/^[6-9]\d{9}$/`).
   - Prevents dummy formats and invalid lengths on both frontend and backend.
4. **Real 6-Digit Email OTP Verification**:
   - Cryptographically secure 6-digit OTPs sent via Nodemailer/SMTP.
   - Expiration timer (10 minutes), attempt limit protection, and resend cooldown.
5. **Smart "Complete the Look" Styling Engine**:
   - Matching outfit recommendations curated for each product.
6. **Comprehensive Search, Multi-Filter & Sorting**:
   - Instant search across all 120 products.
   - Filter by Category, Subcategory, Price slider, and Stock status.
   - Sort by Price (Low/High), Rating, and Newest.
7. **Razorpay & COD Checkout**:
   - Server-side Razorpay order creation and HMAC SHA256 signature verification.
   - Cash on Delivery (COD) option with instant order status tracking.
   - Automated branded HTML order confirmation receipts sent to the customer's email.
8. **Customer Account & Order History**:
   - User profile management and order tracking with itemized breakdowns.

---

## 📁 Project Structure

```
Veloura/
├── index.html               # Frontend HTML entry point
├── vite.config.js           # Vite build & dev configuration
├── tailwind.config.js       # Tailwind CSS luxury theme configuration
├── src/                     # React Frontend
│   ├── components/          # Navbar, Footer, CartDrawer, ProductCard, etc.
│   ├── pages/               # Home, Catalogue, ProductDetails, Login, Signup, Checkout, Profile, Orders
│   ├── context/             # AuthContext, CartContext
│   ├── utils/               # API clients and validation helpers
│   ├── index.css            # Styles & custom utilities
│   └── App.jsx              # Root component & page router
├── server/                  # Backend Application
│   ├── config/              # Supabase & Razorpay configuration
│   ├── controllers/         # Auth, Product, Order & Payment controllers
│   ├── routes/              # Express REST API routes
│   ├── utils/               # Nodemailer emails, OTP generator, Indian phone validator
│   ├── supabase_schema.sql  # Supabase PostgreSQL schema DDL & RLS policies
│   ├── seed.js              # Supabase 120-Product Database Seeder
│   └── index.js             # Express Server entry
├── catalogue_120_products.json # 120 curated luxury clothing products
├── .env.example             # Environment template
├── package.json
└── README.md
```

---

## ⚡ Setup & Run

### 1. Configure Environment (.env)
```bash
cp .env.example .env
```
Fill in your credentials in `.env`:
- `SUPABASE_URL`: Your Supabase Project URL.
- `SUPABASE_ANON_KEY`: Your Supabase Anon Key.
- `JWT_SECRET`: Any random secret key.
- `SMTP_USER` and `SMTP_PASS`: Your Gmail/SMTP credentials for sending real OTP and order confirmation emails.
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: Your Razorpay keys.

### 2. Database Setup (Supabase)
Run the SQL queries in `server/supabase_schema.sql` inside your Supabase SQL Editor.
Then seed the database with all 120 products:
```bash
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser!
