// admin.js

// Authentication Check and Initial Data Load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchAdminData();
    fetchInventory();
    fetchUsers();
    fetchDashboardStats();
});

// Check if the user is authenticated
const checkAuth = () => {
    // In a real app, you would check for a valid token in localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Redirect to login page if no token found
        window.location.href = 'login.html';
        return;
    }

    // Set user display name (replace with actual user data fetch in production)
    const userDisplay = document.querySelector('.user-display');
    if (userDisplay) userDisplay.textContent = 'Admin User'; // This can be updated with dynamic user data
};

// Fetch admin user info from backend
function fetchAdminData() {
    fetch("http://localhost:5000/api/admin") // Updated to use correct endpoint
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch admin data");
            return response.json();
        })
        .then(data => {
            const userDisplay = document.querySelector('.user-display');
            if (userDisplay) userDisplay.textContent = data.name || 'Admin User';
        })
        .catch(error => {
            console.error("Error fetching admin info:", error);
            // Using conditional to check if Swal is available
            if (typeof Swal !== 'undefined') {
                Swal.fire("Error", "Unable to fetch admin info from the database.", "error");
            } else {
                console.error("Unable to fetch admin info from the database.");
            }
        });
}

// Fetch inventory data
function fetchInventory() {
    fetch("http://localhost:5000/api/inventory") // Updated to use correct endpoint
        .then(res => res.json())
        .then(data => {
            console.log("Inventory:", data);
            // Populate your inventory table here
        })
        .catch(err => {
            console.error("Failed to load inventory", err);
        });
}

// Fetch users data
function fetchUsers() {
    fetch("http://localhost:5000/api/users") // Updated to use correct endpoint
        .then(res => res.json())
        .then(data => {
            console.log("Users:", data);
            // Populate your users table or section here
        })
        .catch(err => {
            console.error("Failed to load users", err);
        });
}

// Fetch dashboard statistics
function fetchDashboardStats() {
    fetch("http://localhost:5000/api/stats") // Updated to use correct endpoint
        .then(res => res.json())
        .then(data => {
            console.log("Stats:", data);
            // Display stats on dashboard
            if (data) {
                document.getElementById('userCount').textContent = data.totalUsers || 0;
                document.getElementById('totalSales').textContent = '₱' + (data.totalSales || 0).toLocaleString();
                document.getElementById('itemCount').textContent = data.itemCount || 0;
                document.getElementById('transactionCount').textContent = data.transactionCount || 0;
            }
        })
        .catch(err => {
            console.error("Failed to load dashboard stats", err);
        });
}
