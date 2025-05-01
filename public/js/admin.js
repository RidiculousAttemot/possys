// admin.js

// Flag to prevent multiple submissions
let isSubmitting = false;

// API base URL - define once at the top
const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    // FIRST: Check for last active section before doing anything else
    // This ensures that after a page reload (e.g., from form submission with image)
    // we return to the correct section (e.g., inventory)
    const lastSection = localStorage.getItem('lastActiveSection');
    if (lastSection) {
        // Navigate to that section
        showSection(lastSection);
        console.log('Navigated to previously active section:', lastSection);
        
        // Clear the stored section to avoid unexpected redirects in the future
        localStorage.removeItem('lastActiveSection');
    }

    // Check if user is logged in immediately
    if (!localStorage.getItem('authToken')) {
        console.log('No auth token found. Redirecting to login...');
        window.location.href = 'login.html';
        return;
    }
    
    // Check user role
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        console.log('User is not admin. Redirecting to POS...');
        window.location.href = 'pos.html';
        return;
    }

    // Set admin name in UI
    const userDisplayElement = document.querySelector('.user-display');
    if (userDisplayElement) {
        userDisplayElement.textContent = localStorage.getItem('userName') || 'Admin';
    }
    
    // Setup logout button with improved functionality
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            Swal.fire({
                title: 'Logout Confirmation',
                text: 'Are you sure you want to log out?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Logout',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Clear all authentication data from localStorage
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    
                    // Show quick confirmation and redirect
                    Swal.fire({
                        title: 'Logged Out',
                        text: 'You have been successfully logged out.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        background: '#141414',
                        color: '#f5f5f5'
                    }).then(() => {
                        // Redirect to login page
                        window.location.href = 'login.html';
                    });
                }
            });
        });
    }
    
    // Authentication check
    const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!token) {
            // Redirect to login page if no token
            window.location.href = 'login.html';
            return false;
        }
        
        // Check if user is not admin - they should not access admin page
        if (userRole !== 'admin') {
            window.location.href = 'pos.html';
            return false;
        }
        
        // Set admin name in UI
        const userDisplayElement = document.querySelector('.user-display');
        if (userDisplayElement) {
            userDisplayElement.textContent = localStorage.getItem('userName') || 'Admin';
        }
        
        return true;
    };
    
    // Check authentication on load
    if (!checkAuth()) return;
    
    // Load dashboard data with improved error handling
    const loadDashboard = async () => {
        try {
            console.log('Loading dashboard data...');
            
            // Show loading indicators
            document.getElementById('userCount').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            document.getElementById('totalSales').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            document.getElementById('transactionCount').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            document.getElementById('itemCount').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            // 1. Get user count
            const userResponse = await fetch(`${API_URL}/users`);
            const users = await userResponse.json();
            document.getElementById('userCount').textContent = users.length;
            
            // 2. Get transaction stats
            const statsResponse = await fetch(`${API_URL}/transaction-stats`);
            const stats = await statsResponse.json();
            
            document.getElementById('totalSales').textContent = `₱${parseFloat(stats.totalSales).toFixed(2)}`;
            document.getElementById('transactionCount').textContent = stats.transactionCount;
            
            // 3. Get item count (inventory count)
            const itemsResponse = await fetch(`${API_URL}/inventory`);
            const items = await itemsResponse.json();
            document.getElementById('itemCount').textContent = items.length;
            
            // 4. Update recent activity
            updateRecentActivity(stats.recentTransactions);
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            
            // Reset counters with error indication
            document.getElementById('userCount').textContent = 'Error';
            document.getElementById('totalSales').textContent = 'Error';
            document.getElementById('transactionCount').textContent = 'Error';
            document.getElementById('itemCount').textContent = 'Error';
            
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load dashboard data. Please try again.',
                icon: 'error',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
        }
    };
    
    // Update recent activity section
    const updateRecentActivity = (recentTransactions) => {
        const activityList = document.getElementById('activityList');
        
        if (!recentTransactions || recentTransactions.length === 0) {
            activityList.innerHTML = `
                <div class="no-activity">
                    <i class="fas fa-info-circle"></i>
                    <p>No recent activity to display.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        recentTransactions.forEach(transaction => {
            const date = new Date(transaction.transaction_date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon transaction-icon">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-primary">New transaction #${transaction.transaction_id}</div>
                        <div class="activity-secondary">₱${parseFloat(transaction.total_amount).toFixed(2)} - Processed by ${transaction.cashier_name}</div>
                        <div class="activity-time">${formattedDate}</div>
                    </div>
                </div>
            `;
        });
        
        activityList.innerHTML = html;
    };
    
    // Load inventory data - improved with caching prevention
    window.loadInventory = async () => {
        const inventoryTable = document.getElementById('inventoryTable');
        if (!inventoryTable) return;
        
        // Show loading indicator
        inventoryTable.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading inventory...</p>
                </td>
            </tr>
        `;
        
        try {
            // Add timestamp to prevent caching
            const response = await fetch(`${API_URL}/inventory?timestamp=${Date.now()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch inventory');
            }
            
            const inventory = await response.json();
            console.log(`Loaded ${inventory.length} inventory items`);
            
            // Display the items
            displayInventory(inventory);
            return inventory;
        } catch (error) {
            console.error('Error loading inventory:', error);
            
            // Show error message with retry button
            inventoryTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Failed to load inventory. Please try again.</p>
                        <button class="btn-retry" onclick="loadInventory()">Retry</button>
                    </td>
                </tr>
            `;
            return [];
        }
    };
    
    // Display inventory function with fixed image path handling
    function displayInventory(items) {
        const inventoryTable = document.getElementById('inventoryTable');
        
        // Clear the table first to prevent duplicates
        inventoryTable.innerHTML = '';
        
        if (!items || items.length === 0) {
            inventoryTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No items found in inventory</td>
                </tr>
            `;
            return;
        }
        
        // Build the HTML string
        let html = '';
        items.forEach(item => {
            // Log the image path for debugging
            console.log(`Item ${item.item_id} (${item.item_name}) image path:`, item.image);
            
            // Fix image path with correct URL construction
            let imagePath = '';
            let imageHtml = '';
            
            if (item.image && item.image !== 'null' && item.image !== 'undefined') {
                // For working with Live Server which serves from /public
                // When using Live Server, adjust the path to include /public
                if (window.location.href.includes(':5500') || window.location.href.includes('localhost')) {
                    imagePath = window.location.origin + '/public' + item.image;
                } else {
                    // For production deployment
                    imagePath = item.image;
                }
                
                imageHtml = `<img src="${imagePath}" alt="${item.item_name}" onerror="this.onerror=null; this.src='${window.location.origin}/public/assets/images/no-image.png'; console.log('Using fallback for item ${item.item_id}');">`;
            } else {
                imageHtml = '<i class="fas fa-image no-image"></i>';
            }
            
            html += `
                <tr>
                    <td>${item.item_id}</td>
                    <td>
                        <div class="item-image">
                            ${imageHtml}
                        </div>
                    </td>
                    <td>${item.item_name}</td>
                    <td>${item.category || 'N/A'}</td>
                    <td>₱${parseFloat(item.price).toFixed(2)}</td>
                    <td>
                        <span class="stock-badge ${item.stock_quantity < 10 ? 'low-stock' : ''}">${item.stock_quantity}</span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" data-id="${item.item_id}"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete" data-id="${item.item_id}"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        // Set the HTML content at once
        inventoryTable.innerHTML = html;
        
        // Add event listeners for edit and delete buttons
        addInventoryButtonListeners();
    }
    
    // Add event listeners to buttons in inventory table
    function addInventoryButtonListeners() {
        document.querySelectorAll('.inventory-table .btn-edit').forEach(button => {
            // Clone and replace to avoid stale event listeners
            const newBtn = button.cloneNode(true);
            button.parentNode.replaceChild(newBtn, button);
            
            // Add event listener to the new button
            newBtn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                openEditItemModal(itemId);
            });
        });
        
        document.querySelectorAll('.inventory-table .btn-delete').forEach(button => {
            // Clone and replace to avoid stale event listeners
            const newBtn = button.cloneNode(true);
            button.parentNode.replaceChild(newBtn, button);
            
            // Add event listener to the new button
            newBtn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                openDeleteItemModal(itemId);
            });
        });
    }
    
    // Load user data - improved with error handling and caching prevention
    window.loadUsers = async () => {
        const usersTable = document.getElementById('usersTable');
        if (!usersTable) return;
        
        // Show loading indicator
        usersTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading users...</p>
                </td>
            </tr>
        `;
        
        try {
            // Add timestamp to prevent caching
            const response = await fetch(`${API_URL}/users?timestamp=${Date.now()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            
            const users = await response.json();
            console.log(`Loaded ${users.length} users`);
            
            // Display the users
            displayUsers(users);
            return users;
        } catch (error) {
            console.error('Error loading users:', error);
            
            // Show error message with retry button
            usersTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Failed to load users. Please try again.</p>
                        <button class="btn-retry" onclick="loadUsers()">Retry</button>
                    </td>
                </tr>
            `;
            return [];
        }
    };
    
    // Display users in table - enhanced for safety
    function displayUsers(users) {
        const usersTable = document.getElementById('usersTable');
        
        // Clear the table first to prevent duplicates
        usersTable.innerHTML = '';
        
        if (!users || users.length === 0) {
            usersTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <i class="fas fa-users"></i>
                        <p>No users found.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        const currentUserId = localStorage.getItem('userId');
        
        users.forEach(user => {
            const roleClass = user.role === 'admin' ? 'role-admin' : 'role-cashier';
            const isCurrentUser = user.user_id.toString() === currentUserId;
            
            html += `
                <tr>
                    <td>${user.user_id}</td>
                    <td>${user.full_name || user.username}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td><span class="role-badge ${roleClass}">${user.role}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit-user" data-id="${user.user_id}"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete-user" data-id="${user.user_id}" ${isCurrentUser ? 'disabled title="Cannot delete your own account"' : ''}>
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        usersTable.innerHTML = html;
        
        // Add event listeners for user action buttons
        addUserButtonListeners();
    }
    
    // Add event listeners to buttons in user table
    function addUserButtonListeners() {
        document.querySelectorAll('.users-table .btn-edit-user').forEach(button => {
            // Clone and replace to avoid stale event listeners
            const newBtn = button.cloneNode(true);
            button.parentNode.replaceChild(newBtn, button);
            
            // Add event listener to the new button
            newBtn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                openEditUserModal(userId);
            });
        });
        
        document.querySelectorAll('.users-table .btn-delete-user').forEach(button => {
            // Clone and replace to avoid stale event listeners
            const newBtn = button.cloneNode(true);
            button.parentNode.replaceChild(newBtn, button);
            
            // Add event listener to the new button
            newBtn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                openDeleteUserModal(userId);
            });
        });
    }
    
    // Add User button - with improved handling
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        // Clone button to remove any existing event listeners
        const newBtn = addUserBtn.cloneNode(true);
        if (addUserBtn.parentNode) {
            addUserBtn.parentNode.replaceChild(newBtn, addUserBtn);
        }
        
        // Add fresh event listener
        newBtn.addEventListener('click', function() {
            openModal('addUserModal');
            
            // Reset form when opening modal
            const form = document.getElementById('addUserForm');
            if (form) form.reset();
        });
    }
    
    // Add User Form Submission - With anti-double submission protection
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        // Remove any existing event listeners (prevents duplicates)
        const clonedForm = addUserForm.cloneNode(true);
        addUserForm.parentNode.replaceChild(clonedForm, addUserForm);
        
        // Re-assign the form reference after cloning
        const newAddUserForm = document.getElementById('addUserForm');
        
        // Add the event listener to the fresh form element
        newAddUserForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Prevent double submission
            if (isSubmitting) return;
            isSubmitting = true;
            
            // Disable form to prevent double submission
            const allInputs = this.querySelectorAll('input, select, textarea, button');
            allInputs.forEach(input => input.disabled = true);
            
            // Show loading state
            const submitBtn = document.getElementById('addUserSubmitButton');
            const originalBtnText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
            
            try {
                // Get form values directly
                const userData = {
                    username: document.getElementById('userName').value,
                    full_name: document.getElementById('userFullName').value,
                    email: document.getElementById('userEmail').value,
                    password: document.getElementById('userPassword').value,
                    role: document.getElementById('userRole').value
                };
                
                // Validate required fields
                if (!userData.username || !userData.full_name || !userData.email || !userData.password || !userData.role) {
                    throw new Error('All fields are required');
                }
                
                // Send API request to add user
                const response = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify(userData)
                });
                
                const responseData = await response.json();
                
                if (!response.ok) {
                    throw new Error(responseData.error || 'Failed to add user');
                }
                
                // Close modal and reset form
                closeModal('addUserModal');
                this.reset();
                
                // Show success message with auto-dismiss
                Swal.fire({
                    title: 'Success!',
                    text: 'User added successfully!',
                    icon: 'success',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5',
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // Immediately reload users data and dashboard
                loadUsers();
                loadDashboard();
                
            } catch (error) {
                console.error('Error adding user:', error);
                
                Swal.fire({
                    title: 'Error!',
                    text: error.message || 'Failed to add user. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5'
                });
            } finally {
                // Re-enable form inputs
                allInputs.forEach(input => input.disabled = false);
                
                // Reset button state
                document.getElementById('addUserSubmitButton').innerHTML = originalBtnText;
                
                // Reset submission flag
                isSubmitting = false;
            }
        });
    }
    
    // Function to open edit user modal and populate with user data
    const openEditUserModal = async (userId) => {
        try {
            // Fetch user details
            const response = await fetch(`${API_URL}/users/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }
            
            const user = await response.json();
            
            // Populate form fields
            document.getElementById('editUserId').value = user.user_id;
            document.getElementById('editUserName').value = user.username || '';
            document.getElementById('editUserFullName').value = user.full_name || '';
            document.getElementById('editUserEmail').value = user.email || '';
            document.getElementById('editUserPassword').value = ''; // Clear password field for security
            
            // Set role in dropdown
            const roleSelect = document.getElementById('editUserRole');
            for (let i = 0; i < roleSelect.options.length; i++) {
                if (roleSelect.options[i].value === user.role) {
                    roleSelect.selectedIndex = i;
                    break;
                }
            }
            
            // Open modal
            openModal('editUserModal');
            
        } catch (error) {
            console.error('Error opening edit user modal:', error);
            
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load user details. Please try again.',
                icon: 'error',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
        }
    };
    
    // Edit User Form Submission
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userId = document.getElementById('editUserId').value;
            
            // Show loading state
            const submitBtn = editUserForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            
            try {
                // Get form values
                const userData = {
                    username: document.getElementById('editUserName').value,
                    full_name: document.getElementById('editUserFullName').value,
                    email: document.getElementById('editUserEmail').value,
                    role: document.getElementById('editUserRole').value
                };
                
                // Add password only if it was entered
                const password = document.getElementById('editUserPassword').value;
                if (password) {
                    userData.password = password;
                }
                
                // Send API request to update user
                const response = await fetch(`${API_URL}/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify(userData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update user');
                }
                
                // Close modal
                closeModal('editUserModal');
                
                // Show success message with auto-dismiss
                Swal.fire({
                    title: 'Success!',
                    text: 'User updated successfully!',
                    icon: 'success',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5',
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // Reload users
                loadUsers();
                
            } catch (error) {
                console.error('Error updating user:', error);
                
                Swal.fire({
                    title: 'Error!',
                    text: error.message || 'Failed to update user. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5'
                });
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update User';
            }
        });
    }
    
    // Function to open delete user modal
    const openDeleteUserModal = async (userId) => {
        try {
            // Fetch user details
            const response = await fetch(`${API_URL}/users/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }
            
            const user = await response.json();
            
            // Prevent deleting your own account
            const currentUserId = localStorage.getItem('userId');
            if (user.user_id.toString() === currentUserId) {
                Swal.fire({
                    title: 'Warning!',
                    text: 'You cannot delete your own account.',
                    icon: 'warning',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5'
                });
                return;
            }
            
            // Set user details in modal
            document.getElementById('deleteUserName').textContent = user.full_name || user.username;
            document.getElementById('deleteUserEmail').textContent = user.email || 'N/A';
            document.getElementById('deleteUserRole').textContent = user.role || 'N/A';
            
            // Set user id for delete button
            document.getElementById('confirmDeleteUserBtn').setAttribute('data-id', user.user_id);
            
            // Open modal
            openModal('deleteUserModal');
            
        } catch (error) {
            console.error('Error opening delete user modal:', error);
            
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load user details. Please try again.',
                icon: 'error',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
        }
    };
    
    // Delete User Confirmation
    const confirmDeleteUserBtn = document.getElementById('confirmDeleteUserBtn');
    if (confirmDeleteUserBtn) {
        confirmDeleteUserBtn.addEventListener('click', async function() {
            const userId = this.getAttribute('data-id');
            
            try {
                // Show loading state
                const originalText = this.textContent;
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
                
                // Send API request to delete user
                const response = await fetch(`${API_URL}/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete user');
                }
                
                // Close modal
                closeModal('deleteUserModal');
                
                // Show success message with auto-dismiss
                Swal.fire({
                    title: 'Success!',
                    text: 'User deleted successfully!',
                    icon: 'success',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5',
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // Reload users without switching to dashboard
                loadUsers();
                
                // Update dashboard counters without switching
                updateDashboardCounters();
                
            } catch (error) {
                console.error('Error deleting user:', error);
                
                Swal.fire({
                    title: 'Error!',
                    text: error.message || 'Failed to delete user. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5'
                });
            } finally {
                // Reset button state
                this.disabled = false;
                this.textContent = 'Delete';
            }
        });
    }
    
    // Load transaction data - improved with error handling and caching prevention
    window.loadTransactions = async () => {
        const transactionsTable = document.getElementById('transactionsTable');
        if (!transactionsTable) return;
        
        // Show loading indicator
        transactionsTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading transactions...</p>
                </td>
            </tr>
        `;
        
        try {
            // Add timestamp to prevent caching
            const response = await fetch(`${API_URL}/transactions?timestamp=${Date.now()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            
            const transactions = await response.json();
            console.log(`Loaded ${transactions.length} transactions`);
            
            // Display the transactions
            displayTransactions(transactions);
            return transactions;
        } catch (error) {
            console.error('Error loading transactions:', error);
            
            // Show error message with retry button
            transactionsTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Failed to load transactions. Please try again.</p>
                        <button class="btn-retry" onclick="loadTransactions()">Retry</button>
                    </td>
                </tr>
            `;
            return [];
        }
    };
    
    // Display transactions in table
    function displayTransactions(transactions) {
        const transactionsTable = document.getElementById('transactionsTable');
        
        // Clear the table first to prevent duplicates
        transactionsTable.innerHTML = '';
        
        if (!transactions || transactions.length === 0) {
            transactionsTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <i class="fas fa-receipt"></i>
                        <p>No transactions found.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.transaction_date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <tr>
                    <td>${transaction.transaction_id}</td>
                    <td>${transaction.cashier_name}</td>
                    <td>${formattedDate}</td>
                    <td>₱${parseFloat(transaction.total_amount).toFixed(2)}</td>
                    <td>
                        <button class="btn-view" data-id="${transaction.transaction_id}">View Details</button>
                    </td>
                </tr>
            `;
        });
        
        transactionsTable.innerHTML = html;
        
        // Add event listeners to view buttons
        addTransactionButtonListeners();
    }
    
    // Add event listeners to buttons in transaction table
    function addTransactionButtonListeners() {
        document.querySelectorAll('.transactions-table .btn-view').forEach(button => {
            // Clone and replace to avoid stale event listeners
            const newBtn = button.cloneNode(true);
            button.parentNode.replaceChild(newBtn, button);
            
            // Add event listener to the new button
            newBtn.addEventListener('click', function() {
                const transactionId = this.getAttribute('data-id');
                viewTransactionDetails(transactionId);
            });
        });
    }
    
    // Add Item Form Submission - With auto-dismiss success and no page reload
    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        // Remove any existing event listeners (prevents duplicates)
        const clonedForm = addItemForm.cloneNode(true);
        addItemForm.parentNode.replaceChild(clonedForm, addItemForm);
        
        // Re-assign the form reference after cloning
        const newAddItemForm = document.getElementById('addItemForm');
        
        // Set a direct onsubmit handler on the form element itself
        newAddItemForm.onsubmit = function(e) {
            // Immediate prevention of default form behavior
            e.preventDefault();
            e.stopPropagation();
            
            // Store current section before form submission
            localStorage.setItem('lastActiveSection', 'inventory');
            
            // Prevent double submission
            if (isSubmitting) return false;
            isSubmitting = true;
            
            // Disable form to prevent double submission
            const allInputs = this.querySelectorAll('input, select, textarea, button');
            allInputs.forEach(input => input.disabled = true);
            
            // Show loading state
            const submitBtn = document.getElementById('addItemSubmitButton');
            const originalBtnText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
            
            // Create a function to handle the form submission
            const processForm = async () => {
                try {
                    // Get form values directly
                    const itemName = document.getElementById('itemName').value;
                    const description = document.getElementById('itemDescription').value || '';
                    const category = document.getElementById('itemCategory').value;
                    const priceValue = document.getElementById('itemPrice').value;
                    const stockValue = document.getElementById('itemStock').value;
                    
                    // Parse numeric values with validation
                    const price = priceValue ? parseFloat(priceValue) : 0;
                    const stockQuantity = stockValue ? parseInt(stockValue) : 0;
                    
                    // Check for required fields
                    if (!itemName || !category) {
                        throw new Error('Please fill all required fields');
                    }
                    
                    // Create item data object with direct values
                    const itemData = {
                        item_name: itemName,
                        description: description,
                        category: category,
                        price: price,
                        stock_quantity: stockQuantity,
                        image: null // Will be updated if image is uploaded
                    };
                    
                    console.log('Processing item data:', itemData);
                    
                    // Handle image file upload if provided
                    const imageFile = document.getElementById('itemImage').files[0];
                    if (imageFile) {
                        console.log('Image file detected, uploading:', imageFile.name);
                        
                        // Create a FormData object for the image
                        const imageFormData = new FormData();
                        imageFormData.append('image', imageFile);
                        
                        try {
                            console.log('Uploading image...');
                            // Upload the image first
                            const imageUploadResponse = await fetch(`${API_URL}/upload-image`, {
                                method: 'POST',
                                body: imageFormData
                            });
                            
                            if (!imageUploadResponse.ok) {
                                console.error('Image upload failed:', await imageUploadResponse.text());
                                throw new Error('Failed to upload image');
                            }
                            
                            const imageResult = await imageUploadResponse.json();
                            console.log('Image uploaded successfully:', imageResult);
                            
                            // Set the image path in the item data
                            itemData.image = imageResult.imagePath;
                            console.log('Updated item data with image:', itemData);
                        } catch (imageError) {
                            console.error('Error during image upload:', imageError);
                            // We'll continue with item creation even if image upload fails
                            // but show a warning to the user
                            await Swal.fire({
                                title: 'Warning',
                                text: 'Image upload failed, but we can still add the item without an image.',
                                icon: 'warning',
                                confirmButtonColor: '#3498db',
                                background: '#141414',
                                color: '#f5f5f5'
                            });
                        }
                    }
                    
                    console.log('Sending final item data to API:', itemData);
                    
                    // Send API request to add item
                    const response = await fetch(`${API_URL}/inventory`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify(itemData)
                    });
                    
                    if (!response.ok) {
                        const responseData = await response.json();
                        console.error('API returned error:', responseData);
                        throw new Error(responseData.error || 'Failed to add item');
                    }
                    
                    const responseData = await response.json();
                    console.log('Item added successfully:', responseData);
                    
                    // First close modal and reset form
                    closeModal('addItemModal');
                    newAddItemForm.reset();
                    
                    // Show success message with auto-dismiss
                    Swal.fire({
                        title: 'Success!',
                        text: 'Item added successfully!',
                        icon: 'success',
                        confirmButtonColor: '#3498db',
                        background: '#141414',
                        color: '#f5f5f5',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    
                    // Make sure we stay in the inventory section
                    showSection('inventory');
                    
                    // Reload inventory data only
                    loadInventory();
                    
                    // Update dashboard counters without changing section
                    updateDashboardCounters();
                    
                } catch (error) {
                    console.error('Error adding item:', error);
                    
                    Swal.fire({
                        title: 'Error!',
                        text: error.message || 'Failed to add item. Please try again.',
                        icon: 'error',
                        confirmButtonColor: '#3498db',
                        background: '#141414',
                        color: '#f5f5f5'
                    });
                } finally {
                    // Re-enable form inputs
                    allInputs.forEach(input => input.disabled = false);
                    
                    // Reset button state
                    document.getElementById('addItemSubmitButton').innerHTML = originalBtnText;
                    
                    // Reset submission flag
                    isSubmitting = false;
                }
            };
            
            // Execute the form processing
            processForm();
            
            // Ensure the form doesn't submit normally
            return false;
        };
    }
    
    // Function to open edit item modal and populate with item data
    const openEditItemModal = async (itemId) => {
        // Store current section before opening modal
        localStorage.setItem('lastActiveSection', 'inventory');
        
        try {
            // Fetch item details
            const response = await fetch(`${API_URL}/inventory/${itemId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch item details');
            }
            
            const item = await response.json();
            
            // Log item data to debug image paths
            console.log("Item data for editing:", item);
            
            // Populate form fields
            document.getElementById('editItemId').value = item.item_id;
            document.getElementById('editItemName').value = item.item_name;
            document.getElementById('editItemCategory').value = item.category || '';
            document.getElementById('editItemPrice').value = item.price;
            document.getElementById('editItemStock').value = item.stock_quantity;
            document.getElementById('editItemDescription').value = item.description || '';
            
            // Show current image if it exists - with fixed path handling
            const currentImagePreview = document.getElementById('currentItemImage');
            if (item.image) {
                // Fix image path using similar logic as in displayInventory
                let imagePath = '';
                
                // For working with Live Server which serves from /public
                if (window.location.href.includes(':5500') || window.location.href.includes('localhost')) {
                    imagePath = window.location.origin + '/public' + item.image;
                } else {
                    // For production deployment
                    imagePath = item.image;
                }
                
                currentImagePreview.innerHTML = `
                    <img src="${imagePath}" alt="${item.item_name}" style="max-width: 100px; margin-bottom: 10px;" 
                         onerror="this.onerror=null; this.src='${window.location.origin}/public/assets/images/no-image.png'; console.log('Using fallback in preview');">
                    <p class="current-filename">Current: ${item.image.split('/').pop()}</p>
                `;
                currentImagePreview.style.display = 'block';
            } else {
                currentImagePreview.innerHTML = '<p>No image available</p>';
                currentImagePreview.style.display = 'block';
            }
            
            // Open modal
            openModal('editItemModal');
            
        } catch (error) {
            console.error('Error opening edit modal:', error);
            
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load item details. Please try again.',
                icon: 'error',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
        }
    };
    
    // Edit Item Form Submission
    const editItemForm = document.getElementById('editItemForm');
    if (editItemForm) {
        editItemForm.addEventListener('submit', async function(e) {
            // Store current section before form submission
            localStorage.setItem('lastActiveSection', 'inventory');
            
            e.preventDefault();
            
            const itemId = document.getElementById('editItemId').value;
            
            // Show loading state
            const submitBtn = editItemForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            
            try {
                // Initialize item data
                const itemData = {
                    item_name: document.getElementById('editItemName').value,
                    description: document.getElementById('editItemDescription').value,
                    category: document.getElementById('editItemCategory').value,
                    price: parseFloat(document.getElementById('editItemPrice').value),
                    stock_quantity: parseInt(document.getElementById('editItemStock').value)
                };
                
                // Handle image file upload if a new file was selected
                const imageFile = document.getElementById('editItemImage').files[0];
                
                if (imageFile) {
                    console.log('New image selected for upload:', imageFile.name);
                    
                    // Create a new FormData just for the image upload
                    const imageFormData = new FormData();
                    imageFormData.append('image', imageFile);
                    
                    // Upload the image first
                    const imageUploadResponse = await fetch(`${API_URL}/upload-image`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: imageFormData
                    });
                    
                    if (!imageUploadResponse.ok) {
                        throw new Error('Failed to upload image');
                    }
                    
                    const imageResult = await imageUploadResponse.json();
                    console.log('Image upload successful, new path:', imageResult.imagePath);
                    
                    // Set the image path for the item
                    itemData.image = imageResult.imagePath;
                } else {
                    console.log('No new image uploaded, keeping existing image');
                }
                
                console.log('Sending updated item data:', itemData);
                
                // Send API request to update item
                const response = await fetch(`${API_URL}/inventory/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify(itemData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to update item');
                }
                
                // Close modal
                closeModal('editItemModal');
                
                // Show success message
                Swal.fire({
                    title: 'Success!',
                    text: 'Item updated successfully!',
                    icon: 'success',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5'
                });
                
                // Reload inventory
                loadInventory();
                
            } catch (error) {
                console.error('Error updating item:', error);
                
                Swal.fire({
                    title: 'Error!',
                    text: error.message || 'Failed to update item. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5'
                });
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Item';
            }
        });
    }
    
    // Function to open delete item modal - with improved styling
    const openDeleteItemModal = async (itemId) => {
        try {
            // Fetch item details
            const response = await fetch(`${API_URL}/inventory/${itemId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch item details');
            }
            
            const item = await response.json();
            
            // Set item details in modal
            document.getElementById('deleteItemName').textContent = item.item_name || 'Unknown Item';
            document.getElementById('deleteItemCategory').textContent = item.category || 'N/A';
            
            // Set item id for delete button
            document.getElementById('confirmDeleteBtn').setAttribute('data-id', item.item_id);
            
            // Open modal with specific styling
            const modal = document.getElementById('deleteItemModal');
            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                
                // Ensure all buttons are enabled
                modal.querySelectorAll('button').forEach(button => {
                    button.disabled = false;
                });
            }
            
        } catch (error) {
            console.error('Error opening delete modal:', error);
            
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load item details. Please try again.',
                icon: 'error',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
        }
    };
    
    // Delete Item Confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async function() {
            const itemId = this.getAttribute('data-id');
            
            try {
                // Show loading state
                const originalText = this.textContent;
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
                
                // Send API request to delete item
                const response = await fetch(`${API_URL}/inventory/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to delete item');
                }
                
                // Close modal
                closeModal('deleteItemModal');
                
                // Show success message
                Swal.fire({
                    title: 'Success!',
                    text: 'Item deleted successfully!',
                    icon: 'success',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5',
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // Reload inventory only, without changing section
                loadInventory();
                
                // Update dashboard counters only
                updateDashboardCounters();
                
            } catch (error) {
                console.error('Error deleting item:', error);
                
                Swal.fire({
                    title: 'Error!',
                    text: error.message || 'Failed to delete item. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5'
                });
            } finally {
                // Reset button state
                this.disabled = false;
                this.textContent = 'Delete';
            }
        });
    }
    
    // Cancel buttons in modals
    document.querySelectorAll('.cancel-btn').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Helper function to open modal - with improved button handling
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex'; // Using flex for centering
            document.body.style.overflow = 'hidden'; // Prevent background scroll
            
            // Reset disabled state on all buttons in the modal
            const buttons = modal.querySelectorAll('button');
            buttons.forEach(button => {
                button.disabled = false;
            });
        }
    }

    // Helper function to close modal - with improved form handling
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore background scroll
            
            // Reset any form in the modal
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }
    
    // Setup modal event listeners with improved handling
    document.querySelectorAll('.modal .close, .modal .cancel-btn').forEach(button => {
        // Clone button to remove any existing event listeners
        const newBtn = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newBtn, button);
        }
        
        // Add fresh event listener
        newBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
                
                // Re-enable all buttons after modal close
                setTimeout(() => {
                    document.querySelectorAll('button').forEach(btn => {
                        btn.disabled = false;
                    });
                }, 100);
            }
        });
    });

    // Add Item button - with improved handling
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        // Clone button to remove any existing event listeners
        const newBtn = addItemBtn.cloneNode(true);
        if (addItemBtn.parentNode) {
            addItemBtn.parentNode.replaceChild(newBtn, addItemBtn);
        }
        
        // Add fresh event listener
        newBtn.addEventListener('click', function() {
            // Store current section before opening modal
            localStorage.setItem('lastActiveSection', 'inventory');
            openModal('addItemModal');
            
            // Reset form when opening modal
            const form = document.getElementById('addItemForm');
            if (form) form.reset();
        });
    }
    
    // Initialize the page
    const init = async () => {
        // Check if we're coming back after a page reload (e.g., from form submission)
        const lastSection = localStorage.getItem('lastActiveSection');
        if (lastSection) {
            // Navigate to that section
            showSection(lastSection);
            // Remove the stored section to avoid unexpected redirects in the future
            localStorage.removeItem('lastActiveSection');
            console.log('Navigated to previously active section:', lastSection);
        }

        // Load dashboard data first
        await loadDashboard();
        
        // Load all data sections in parallel
        await Promise.all([
            loadInventory(),
            loadUsers(),
            loadTransactions()
        ]);
        
        // Add dashboard refresh handler with loading state
        const refreshDashboard = document.getElementById('refreshDashboard');
        if (refreshDashboard) {
            refreshDashboard.addEventListener('click', async () => {
                // Show loading state
                const originalContent = refreshDashboard.innerHTML;
                refreshDashboard.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
                refreshDashboard.disabled = true;
                
                try {
                    // Reload all data sections
                    await Promise.all([
                        loadDashboard(),
                        loadInventory(),
                        loadUsers(),
                        loadTransactions()
                    ]);
                    
                    // Show success message
                    Swal.fire({
                        title: 'Refreshed!',
                        text: 'All data has been updated successfully.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        background: '#141414',
                        color: '#f5f5f5'
                    });
                } catch (error) {
                    console.error('Error refreshing data:', error);
                    
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to refresh data. Please try again.',
                        icon: 'error',
                        confirmButtonColor: '#3498db',
                        background: '#141414',
                        color: '#f5f5f5'
                    });
                } finally {
                    // Restore button state
                    refreshDashboard.innerHTML = originalContent;
                    refreshDashboard.disabled = false;
                }
            });
        }
        
        // Database connection checker
        const checkDatabaseBtn = document.getElementById('checkDatabase');
        if (checkDatabaseBtn) {
            checkDatabaseBtn.addEventListener('click', async () => {
                // Show loading state
                const originalContent = checkDatabaseBtn.innerHTML;
                checkDatabaseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
                checkDatabaseBtn.disabled = true;
                
                try {
                    const response = await fetch(`${API_URL}/?timestamp=${Date.now()}`);
                    
                    if (response.ok) {
                        Swal.fire({
                            title: 'Connection Successful!',
                            text: 'Database connection is working properly.',
                            icon: 'success',
                            confirmButtonColor: '#3498db',
                            background: '#141414',
                            color: '#f5f5f5'
                        });
                    } else {
                        throw new Error('Database connection test failed');
                    }
                } catch (error) {
                    console.error('Database connection test failed:', error);
                    
                    Swal.fire({
                        title: 'Connection Failed!',
                        text: 'Database connection test failed. Please check your server.',
                        icon: 'error',
                        confirmButtonColor: '#3498db',
                        background: '#141414',
                        color: '#f5f5f5'
                    });
                } finally {
                    // Restore button state
                    checkDatabaseBtn.innerHTML = originalContent;
                    checkDatabaseBtn.disabled = false;
                }
            });
        }
    };
    
    // Call init function
    init();
});

// Make load functions globally accessible for retry buttons
window.loadDashboard = async function() {
    try {
        console.log('Loading dashboard data...');
        
        // Show loading indicators
        document.getElementById('userCount').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        document.getElementById('totalSales').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        document.getElementById('transactionCount').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        document.getElementById('itemCount').innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // 1. Get user count
        const userResponse = await fetch(`${API_URL}/users?timestamp=${Date.now()}`);
        const users = await userResponse.json();
        document.getElementById('userCount').textContent = users.length;
        
        // 2. Get transaction stats
        const statsResponse = await fetch(`${API_URL}/transaction-stats?timestamp=${Date.now()}`);
        const stats = await statsResponse.json();
        
        document.getElementById('totalSales').textContent = `₱${parseFloat(stats.totalSales).toFixed(2)}`;
        document.getElementById('transactionCount').textContent = stats.transactionCount;
        
        // 3. Get item count (inventory count)
        const itemsResponse = await fetch(`${API_URL}/inventory?timestamp=${Date.now()}`);
        const items = await itemsResponse.json();
        document.getElementById('itemCount').textContent = items.length;
        
        // 4. Update recent activity
        const activityList = document.getElementById('activityList');
        
        if (!stats.recentTransactions || stats.recentTransactions.length === 0) {
            activityList.innerHTML = `
                <div class="no-activity">
                    <i class="fas fa-info-circle"></i>
                    <p>No recent activity to display.</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        stats.recentTransactions.forEach(transaction => {
            const date = new Date(transaction.transaction_date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
                <div class="activity-item">
                    <div class="activity-icon transaction-icon">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-primary">New transaction #${transaction.transaction_id}</div>
                        <div class="activity-secondary">₱${parseFloat(transaction.total_amount).toFixed(2)} - Processed by ${transaction.cashier_name}</div>
                        <div class="activity-time">${formattedDate}</div>
                    </div>
                </div>
            `;
        });
        
        activityList.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // Reset counters with error indication
        document.getElementById('userCount').textContent = 'Error';
        document.getElementById('totalSales').textContent = 'Error';
        document.getElementById('transactionCount').textContent = 'Error';
        document.getElementById('itemCount').textContent = 'Error';
        
        // Show error in activity list
        document.getElementById('activityList').innerHTML = `
            <div class="error-activity">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load activity data.</p>
                <button class="btn-retry" onclick="loadDashboard()">Retry</button>
            </div>
        `;
    }
};

// New function to update dashboard counters without switching to dashboard section
async function updateDashboardCounters() {
    try {
        // Get item count (inventory count)
        const itemsResponse = await fetch(`${API_URL}/inventory?timestamp=${Date.now()}`);
        const items = await itemsResponse.json();
        document.getElementById('itemCount').textContent = items.length;
        
        // Only update other counters if needed
        const statsResponse = await fetch(`${API_URL}/transaction-stats?timestamp=${Date.now()}`);
        const stats = await statsResponse.json();
        
        document.getElementById('transactionCount').textContent = stats.transactionCount;
    } catch (error) {
        console.error('Error updating dashboard counters:', error);
    }
}

// Helper function to show a specific section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Update sidebar menu active state
    document.querySelectorAll('.menu li').forEach(item => {
        item.classList.remove('active');
    });
    
    const menuItem = document.querySelector(`.menu li a[href="#${sectionId}"]`);
    if (menuItem) {
        menuItem.parentElement.classList.add('active');
    }
}
