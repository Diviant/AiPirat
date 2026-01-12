
# Zenith Portfolio & Admin

A modern, high-performance developer portfolio with a built-in admin dashboard.

## Features
- **Modern UI**: Built with Tailwind CSS and Framer-motion inspired transitions.
- **Admin Dashboard**: Secure CRUD management for projects.
- **Responsive**: Fully optimized for mobile, tablet, and desktop.
- **Persistence**: Data is persistent via LocalStorage (demonstration mode).

## Tech Stack
- **React 18**
- **Tailwind CSS**
- **Lucide Icons**
- **LocalStorage API** (for demo persistence)
- **Prisma** (Ready for server-side integration)

## Quick Start
1. **Admin Credentials**: 
   - Username: `admin`
   - Password: `admin`

2. **Managing Projects**:
   - Go to the bottom of the page and click "Admin" or use the top navigation.
   - Login to see the dashboard.
   - Add, edit, or delete projects.

## Deployment to Vercel
1. Fork the repository.
2. Connect to Vercel.
3. Ensure you have a database (PostgreSQL/SQLite) if migrating to the full Prisma backend.
4. Set `DATABASE_URL` as an environment variable.

## Development
This app uses a service-layer pattern (`services/dataService.ts`) making it easy to swap the `localStorage` implementation for real `fetch` calls to an API.
