# DriveLux Premium MERN — corrected build

This version fixes the original image rendering and dashboard reliability problems.

## Stack
- React + Vite + JavaScript
- Express + Node.js
- MongoDB + Mongoose
- JWT authentication
- PDFKit invoices
- Framer Motion + Lucide

## Folder structure
client/
  public/images/cars/       <- all 15 car photos
  src/App.jsx
  src/api.js
  src/styles.css

server/
  src/server.js
  src/seed.js
  src/models/
  src/routes/

## Start MongoDB
Local MongoDB:
mongodb://127.0.0.1:27017/drivelux

## Install
From the project root:
npm install
npm run install-all

## Run
npm run dev

Frontend: http://localhost:5173
Backend:  http://localhost:5000
Health:   http://localhost:5000/api/health

## First run
The backend automatically connects to MongoDB and upserts all 15 vehicles. This is intentional: it also repairs image paths in an existing DriveLux database.

## Authentication
Register a new account from /register. The dashboard now validates the saved JWT with /api/auth/me and gracefully logs out if the token is expired.

## Booking
1. Open Fleet.
2. Select a vehicle.
3. Continue to checkout.
4. Choose options and virtual payment method.
5. Confirm booking.
6. Open Dashboard.
7. Download the generated PDF invoice.

The payment methods are demo/virtual methods and do not charge real money.

## Car image paths
All images are served from Vite's public folder, for example:
`/images/cars/scorpio.jpeg`

Do not import these files from `src`. They are public assets.

## Production note
Replace demo payment/KYC/telemetry implementations with real providers before production.
