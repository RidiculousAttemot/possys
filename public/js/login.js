document.addEventListener('DOMContentLoaded', () => {
    console.log('Login page loaded. Checking authentication...');
    
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    
    if (token) {
        console.log('Authentication token found. Validating...');
        // Validate token by making a request to the server
        fetch('http://localhost:5000/api/validate-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                console.log('Token validation failed. Clearing auth data...');
                // If token is invalid, clear localStorage
                localStorage.clear();
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.valid) {
                console.log('Token valid. Redirecting based on role...');
                // Redirect to appropriate page based on role
                const userRole = localStorage.getItem('userRole');
                if (userRole === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'pos.html';
                }
            }
        })
        .catch(error => {
            console.error('Error validating token:', error);
            localStorage.clear();
        });
    } else {
        console.log('No authentication token found. User needs to log in.');
    }

    // Listen for form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Login form submitted');

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const loginButton = document.querySelector('.btn-login');

            // Show loading state
            if (loginButton) {
                const originalButtonText = loginButton.innerHTML;
                loginButton.disabled = true;
                loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            }

            // Hide error messages
            const errorText = document.getElementById('errorText');
            if (errorText) errorText.style.display = 'none';

            try {
                // Send login request
                console.log(`Attempting login for user: ${username}`);
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Store authentication data
                    console.log('Login successful. Setting auth data...');
                    localStorage.setItem('authToken', data.token || 'token-' + Date.now());
                    localStorage.setItem('userName', data.user.full_name || username);
                    localStorage.setItem('userRole', data.user.role);
                    localStorage.setItem('userId', data.user.user_id);

                    // Show success message
                    Swal.fire({
                        title: 'Login Successful!',
                        text: `Welcome back, ${data.user.full_name || username}!`,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        // Redirect based on role
                        console.log(`Redirecting user with role: ${data.user.role}`);
                        if (data.user.role === 'admin') {
                            window.location.href = 'admin.html';
                        } else {
                            window.location.href = 'pos.html';
                        }
                    });
                } else {
                    // Show error message
                    console.log('Login failed:', data.error);
                    Swal.fire({
                        title: 'Login Failed',
                        text: data.error || 'Invalid username or password',
                        icon: 'error'
                    });
                    
                    // Reset form
                    loginForm.reset();
                    document.getElementById('username').focus();
                }
            } catch (error) {
                console.error('Login error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred during login. Please try again.',
                    icon: 'error'
                });
            } finally {
                // Restore button state
                if (loginButton) {
                    loginButton.disabled = false;
                    loginButton.innerHTML = 'Login';
                }
            }
        });
    }
});
