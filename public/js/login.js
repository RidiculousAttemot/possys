document.addEventListener('DOMContentLoaded', async () => {
    console.log('Login page loaded. Checking authentication...');

    const getApiBase = () => {
        const { protocol, hostname, origin } = window.location;

        // If frontend is served by Live Server (e.g. :5500/:5501), use backend API port.
        if (protocol.startsWith('http') && (hostname === 'localhost' || hostname === '127.0.0.1')) {
            if (window.location.port !== '5000') {
                return 'http://localhost:5000/api';
            }
            return `${origin}/api`;
        }

        if (protocol.startsWith('http') && hostname) {
            return `${origin}/api`;
        }

        return 'http://localhost:5000/api';
    };

    const API_BASE = getApiBase();
    
    // Redirect already authenticated users before showing the form
    if (window.AuthGuard && typeof window.AuthGuard.validateSession === 'function') {
        const session = await window.AuthGuard.validateSession();

        if (session.valid && session.user) {
            console.log('Token valid. Redirecting based on server-issued session...');
            window.AuthGuard.redirectByRole(session.user);
            return;
        }
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
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                let data = {};
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    data = await response.json();
                }

                if (response.ok) {
                    // Store authentication data
                    console.log('Login successful. Setting auth data...');
                    if (!data.token) {
                        throw new Error('Server did not return an authentication token');
                    }

                    localStorage.setItem('authToken', data.token);
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
                    const serverError = data && data.error ? data.error : null;
                    const fallbackError = response.status === 401
                        ? 'Invalid username or password.'
                        : `Login failed (${response.status}). Please try again.`;
                    const message = serverError || fallbackError;

                    console.log('Login failed:', message);

                    Swal.fire({
                        title: 'Login Failed',
                        text: message,
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
                    text: error.message || 'Unable to connect to the server. Please check that the backend is running and try again.',
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
