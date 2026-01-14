# POS System for Motorcycle Parts

A Point of Sale system built with Node.js, Express, and MySQL for managing motorcycle parts inventory and sales.

## Quick Start

### Prerequisites
- Node.js (>= 14.0.0)
- MySQL Server (>= 5.7)
- Windows 10/11 or compatible OS

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL credentials
   ```

3. **Set up MySQL database:**
   - Create database: `morpos`
   - Update credentials in `.env` file

4. **Initialize database tables:**
   ```bash
   node server/dbSetup.js
   ```

5. **Start the application:**
   ```bash
   npm start
   ```

6. **Access the system:**
   - Open browser: `http://localhost:5000/login.html`
   - Default admin: `admin` / `admin123`

## Common Issues

### "Disk 1 is unknown and not initialized" Error

If you encounter this Windows disk management error, it means your storage disk needs to be initialized before MySQL can use it. **[See detailed solution in SETUP.md](SETUP.md#disk-initialization-windows)**

Quick fix:
1. Open Disk Management (Windows + X → Disk Management)
2. Right-click on "Disk 1" → Initialize Disk
3. Choose GPT (recommended) or MBR
4. Create a new volume and format as NTFS

### Database Connection Errors

If MySQL won't connect:
- Verify MySQL service is running
- Check credentials in `.env` file
- Ensure database `morpos` exists

**[See full troubleshooting guide in SETUP.md](SETUP.md#troubleshooting)**

## Documentation

- **[Complete Setup Guide](SETUP.md)** - Detailed installation and configuration instructions
- **[Troubleshooting](SETUP.md#troubleshooting)** - Solutions for common problems

## Features

- User authentication and authorization (Admin, Manager, Cashier roles)
- Inventory management
- Point of Sale interface
- Transaction history
- Sales reporting and data export
- Image upload for products

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Frontend:** HTML, CSS, JavaScript
- **File Upload:** Multer

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## Security

⚠️ **Important:**
- Change default admin password after first login
- Keep `.env` file secure
- Regularly backup your database

## License

ISC
