# POS System Setup Guide

This guide will help you set up the Point of Sale System for Motorcycle Parts.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Disk Initialization (Windows)](#disk-initialization-windows)
3. [MySQL Database Setup](#mysql-database-setup)
4. [Application Installation](#application-installation)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

Before installing the POS system, ensure you have:
- Node.js (version 14.0.0 or higher)
- MySQL Server (version 5.7 or higher)
- At least 1GB of free disk space
- Windows 10/11 (or appropriate OS)

## Disk Initialization (Windows)

If you encounter the error **"Disk 1 is unknown and not initialized"**, follow these steps:

### Step 1: Open Disk Management
1. Press `Windows + X` keys together
2. Select **Disk Management** from the menu
3. Wait for the Disk Management window to load

### Step 2: Initialize the Disk
1. In Disk Management, locate **Disk 1** (it will show as "Unknown" and "Not Initialized")
2. **Right-click** on the disk label (where it says "Disk 1")
3. Select **Initialize Disk** from the context menu
4. Choose the partition style:
   - **GPT (GUID Partition Table)** - Recommended for modern systems and disks larger than 2TB
   - **MBR (Master Boot Record)** - For older systems or compatibility with legacy software
5. Click **OK**

### Step 3: Create a New Volume
After initialization:
1. The disk will now show as "Online" but with "Unallocated" space
2. **Right-click** on the unallocated space
3. Select **New Simple Volume**
4. Follow the wizard:
   - Click **Next**
   - Choose the volume size (use the maximum available space or adjust as needed)
   - Assign a drive letter (e.g., D:, E:, etc.)
   - Format the volume:
     - File system: **NTFS** (recommended)
     - Allocation unit size: **Default**
     - Volume label: **Data** (or any name you prefer)
     - Check **Perform a quick format**
   - Click **Finish**

### Step 4: Verify Disk is Ready
1. Open **File Explorer** (Windows + E)
2. You should see your new drive with the assigned letter
3. The disk is now ready for use

## MySQL Database Setup

### Step 1: Install MySQL Server

If you haven't installed MySQL yet:

1. Download MySQL Community Server from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Run the installer
3. During installation:
   - Choose **Developer Default** or **Server only**
   - Set a **root password** (remember this!)
   - Configure MySQL to run as a Windows service
   - Use default port **3306**
4. Complete the installation

### Step 2: Configure MySQL Data Directory (Optional)

If you want MySQL to use your newly initialized disk:

1. Stop the MySQL service:
   ```
   net stop MySQL
   ```

2. Open MySQL configuration file:
   - Location: `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
   - Or: `C:\Program Files\MySQL\MySQL Server 8.0\my.ini`

3. Find the `datadir` line and change it to your new disk:
   ```ini
   datadir=D:/MySQL/Data
   ```

4. Copy the existing data directory to the new location:
   - From: `C:\ProgramData\MySQL\MySQL Server 8.0\Data`
   - To: `D:\MySQL\Data` (or your chosen location)

5. Start the MySQL service:
   ```
   net start MySQL
   ```

### Step 3: Create the Database

1. Open MySQL Command Line Client or any MySQL tool (MySQL Workbench, phpMyAdmin, etc.)
2. Log in with your root credentials
3. Run the following commands:

```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS morpos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verify the database was created
SHOW DATABASES;
```

4. Exit the MySQL client

## Application Installation

### Step 1: Clone or Download the Repository

```bash
git clone <repository-url>
cd possys
```

Or download and extract the ZIP file to your preferred location.

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

1. Create a `.env` file in the root directory (if it doesn't exist)
2. Add the following configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=morpos

# Server Configuration
PORT=5000
NODE_ENV=development
```

Replace `your_mysql_password_here` with your actual MySQL root password.

### Step 4: Initialize the Database Tables

Run the database setup script to create all required tables:

```bash
node server/dbSetup.js
```

This will create:
- `users` table (with a default admin user)
- `items` table
- `transactions` table
- `transaction_items` table

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Change the admin password after first login!

### Step 5: Start the Application

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:5000`

### Step 6: Access the Application

Open your web browser and navigate to:
- Login page: `http://localhost:5000/login.html`
- Admin panel: `http://localhost:5000/admin.html` (after login)
- POS interface: `http://localhost:5000/pos.html`

## Troubleshooting

### Issue: "Disk 1 is unknown and not initialized"

**Solution:** Follow the [Disk Initialization](#disk-initialization-windows) steps above.

### Issue: "Error connecting to MySQL database"

**Possible Causes:**
1. MySQL service is not running
   - Solution: Open Services (services.msc) and start MySQL service
2. Incorrect credentials in `.env` file
   - Solution: Verify DB_USER and DB_PASSWORD match your MySQL credentials
3. Database doesn't exist
   - Solution: Run the SQL commands in [Step 3: Create the Database](#step-3-create-the-database)
4. MySQL is using a different port
   - Solution: Add `DB_PORT=3306` to your `.env` file (or use the correct port)

### Issue: "ECONNREFUSED" or "Can't connect to MySQL server"

**Solution:**
1. Verify MySQL is running:
   ```bash
   mysql -u root -p
   ```
2. Check if MySQL is listening on the correct port:
   ```bash
   netstat -an | find "3306"
   ```
3. Ensure firewall isn't blocking the connection

### Issue: "Table doesn't exist" errors

**Solution:**
Run the database setup script again:
```bash
node server/dbSetup.js
```

### Issue: "Cannot find module" errors

**Solution:**
Reinstall dependencies:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Issue: Images not uploading

**Possible Causes:**
1. Upload directory doesn't exist
   - Solution: The application automatically creates it, but you can manually create `public/assets/images/`
2. Disk is full
   - Solution: Free up space on your disk
3. Insufficient permissions
   - Solution: Run the application with appropriate permissions or check folder permissions

### Issue: Port 5000 is already in use

**Solution:**
1. Stop the application using port 5000
2. Or change the port in `.env`:
   ```env
   PORT=3000
   ```

### Getting Help

If you encounter other issues:
1. Check the console for error messages
2. Check the browser console (F12) for client-side errors
3. Review the `server/database.js` and `server/dbSetup.js` files
4. Ensure all prerequisites are met
5. Verify your MySQL installation is working correctly

## Next Steps

After successful setup:
1. Log in with the default admin credentials
2. **Change the admin password immediately**
3. Add users (cashiers, managers)
4. Set up inventory items
5. Configure system settings
6. Start using the POS system

## Security Notes

⚠️ **Important Security Reminders:**
- Change the default admin password immediately
- Use strong passwords for all user accounts
- Keep the `.env` file secure and never commit it to version control
- Regularly backup your database
- Keep MySQL and Node.js updated to the latest stable versions

---

For more information, see the [README.md](README.md) file.
