# Troubleshooting Guide

Quick solutions for common issues with the POS System.

## "Disk 1 is unknown and not initialized" Error

### What does this mean?
This is a Windows error indicating that a physical disk drive in your computer has not been initialized and therefore cannot be used to store data. This can prevent MySQL from accessing or storing database files if MySQL is configured to use that disk.

### Who sees this error?
This error appears in Windows Disk Management, not in the POS application itself. You might encounter it when:
- Setting up a new hard drive or SSD
- After a system restore or disk replacement
- When MySQL data directory is on an uninitialized disk

### Solution: Initialize the Disk

**Step-by-step guide:**

1. **Open Disk Management**
   - Press `Windows Key + X`
   - Click on "Disk Management"
   - Alternatively: Right-click Start → Disk Management
   - Or: Press `Windows Key + R`, type `diskmgmt.msc`, press Enter

2. **Locate Disk 1**
   - Look for a disk labeled "Disk 1"
   - It will show as "Unknown" and "Not Initialized"
   - The disk will have a black bar indicating unallocated space

3. **Initialize the Disk**
   - Right-click on the disk label (where it says "Disk 1", NOT on the black bar)
   - Select "Initialize Disk" from the menu
   - A dialog box will appear asking you to choose partition style:
     - **GPT (GUID Partition Table)** - Choose this for:
       - Modern computers (built after 2010)
       - Disks larger than 2TB
       - UEFI-based systems
     - **MBR (Master Boot Record)** - Choose this for:
       - Older systems
       - Compatibility with legacy software
       - Disks smaller than 2TB
   - Click "OK"

4. **Create a Volume**
   - After initialization, the disk will show as "Online" with "Unallocated" space
   - Right-click on the unallocated space (black bar)
   - Select "New Simple Volume"
   - Click "Next" in the wizard
   
5. **Configure the Volume**
   - **Volume size:** Use maximum available space (or choose specific size)
   - Click "Next"
   - **Drive letter:** Choose any available letter (e.g., D:, E:)
   - Click "Next"
   
6. **Format the Volume**
   - **File system:** NTFS (recommended for Windows)
   - **Allocation unit size:** Default
   - **Volume label:** Choose a name (e.g., "Data", "Storage")
   - **Quick Format:** Check this box (faster)
   - Click "Next" then "Finish"

7. **Verify**
   - Open File Explorer (Windows + E)
   - You should see the new drive with your chosen letter
   - The disk is now ready to use

### After Disk Initialization

If MySQL was trying to use this disk:

1. **Start MySQL Service**
   ```bash
   # Try these commands (service name may vary based on MySQL version)
   net start MySQL
   # Or
   net start MySQL80
   # Or
   net start MySQL57
   ```
   Note: The exact service name depends on your MySQL installation. Check Services console if needed.

2. **Or restart through Services**
   - Press `Windows + R`, type `services.msc`
   - Find "MySQL" in the list
   - Right-click → Start or Restart

3. **Verify Database Connection**
   - Run the application: `npm start`
   - Check for successful database connection in console

## Other Common Issues

### Cannot Connect to MySQL

**Error:** "Error connecting to MySQL database" or "ECONNREFUSED"

**Solutions:**

1. **Check if MySQL is running**
   ```bash
   # Windows
   net start MySQL
   
   # Or check in Services (services.msc)
   ```

2. **Verify MySQL credentials**
   - Open `.env` file
   - Ensure `DB_USER` and `DB_PASSWORD` are correct
   - Default is usually: `root` with an empty password

3. **Check MySQL port**
   - Default port is 3306
   - Add to `.env` if using different port:
     ```
     DB_PORT=3306
     ```

4. **Test MySQL connection directly**
   ```bash
   mysql -u root -p
   ```

### Database Does Not Exist

**Error:** "Unknown database 'morpos'"

**Solution:**

1. Open MySQL client:
   ```bash
   mysql -u root -p
   ```

2. Create the database:
   ```sql
   CREATE DATABASE morpos;
   exit;
   ```

3. Run setup script:
   ```bash
   node server/dbSetup.js
   ```

### Tables Do Not Exist

**Error:** "Table 'morpos.users' doesn't exist"

**Solution:**

Run the database setup script:
```bash
node server/dbSetup.js
```

This creates all required tables:
- users
- items
- transactions
- transaction_items

### Port Already in Use

**Error:** "Error: listen EADDRINUSE: address already in use :::5000"

**Solutions:**

1. **Find and kill the process using port 5000**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID_NUMBER> /F
   ```

2. **Or change the port in `.env`**
   ```
   PORT=3000
   ```

### Cannot Upload Images

**Possible Issues:**

1. **Directory doesn't exist**
   - The app creates `public/assets/images/` automatically
   - If needed, create manually:
     ```bash
     # Windows (Command Prompt)
     mkdir public\assets\images
     
     # Windows (PowerShell) or Unix/Linux/Mac
     mkdir -p public/assets/images
     ```

2. **File size too large**
   - Maximum file size is 5MB
   - Compress images before uploading

3. **Wrong file type**
   - Only image files are allowed (JPEG, PNG, GIF, etc.)

4. **Disk is full**
   - Check available space: `dir` (Windows) or `df -h` (Linux)
   - Free up space if needed

### Module Not Found Errors

**Error:** "Cannot find module 'express'" (or any other module)

**Solution:**

Reinstall dependencies:
```bash
# Windows (Command Prompt)
rmdir /s /q node_modules
del package-lock.json
npm install

# Windows (PowerShell) or Unix/Linux/Mac
rm -rf node_modules
rm package-lock.json
npm install
```

### Permission Denied Errors

**Error:** "EACCES: permission denied"

**Solutions:**

1. **Run as Administrator (Windows)**
   - Right-click Command Prompt or PowerShell
   - Select "Run as Administrator"
   - Navigate to project folder and run commands

2. **Check folder permissions**
   - Ensure you have write access to the project directory
   - Check `public/assets/images/` permissions

## Getting More Help

If these solutions don't resolve your issue:

1. **Check the console for detailed error messages**
   - Server console: Shows backend errors
   - Browser console (F12): Shows frontend errors

2. **Review log files**
   - Check MySQL error log: Usually in MySQL data directory
   - Check application logs if logging is enabled

3. **Verify all prerequisites**
   - Node.js version: `node --version` (should be >= 14.0.0)
   - npm version: `npm --version`
   - MySQL version: `mysql --version` (minimum 5.7, recommended 8.0 or higher)

4. **Check the setup guide**
   - See [SETUP.md](SETUP.md) for detailed installation instructions

5. **Common checks**
   - Is MySQL service running?
   - Do credentials in `.env` match MySQL?
   - Does the database exist?
   - Are all npm packages installed?
   - Is the correct port available?

## Preventive Measures

To avoid future issues:

1. **Regular backups**
   - Backup MySQL database regularly:
     ```bash
     mysqldump -u root -p morpos > backup.sql
     ```

2. **Keep software updated**
   - Update Node.js: Download from nodejs.org
   - Update npm: `npm install -g npm@latest`
   - Update MySQL: Check MySQL website

3. **Monitor disk space**
   - Keep at least 1GB free for database operations
   - Clean up old log files periodically

4. **Secure your installation**
   - Change default admin password
   - Use strong passwords
   - Keep `.env` file secure
   - Don't commit `.env` to version control

---

For detailed setup instructions, see [SETUP.md](SETUP.md).
