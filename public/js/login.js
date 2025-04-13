document.addEventListener('DOMContentLoaded', () => {
    // Listen for form submission
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const loginButton = document.querySelector('.btn-login');

        // Show the loading spinner and reset feedback/error messages
        const feedback = document.getElementById('errorText');
        const loading = document.getElementById('loadingSpinner');
        const success = document.getElementById('successMessage');
        
        // Hide all feedback elements first
        feedback.style.display = 'none';
        loading.style.display = 'flex'; // Use flex to center the content
        success.style.display = 'none';

        // Validate that username and password are not empty
        if (!username || !password) {
            loading.style.display = 'none';
            feedback.style.display = 'flex';
            feedback.textContent = 'Username and password are required!';
            // Make sure the button is re-enabled
            loginButton.disabled = false;
            loginButton.classList.remove('processing');
            return;
        }

        try {
            // Send login request to backend
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            // Hide loading spinner regardless of result
            loading.style.display = 'none';

            // If login is successful, show success message and then redirect
            if (res.ok) {
                // Store auth token in localStorage for future requests
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                
                // Show success message
                success.style.display = 'flex';
                
                // Set a timeout to allow the user to see the success message
                setTimeout(() => {
                    // Redirect user based on role
                    if (data.role === 'admin') {
                        window.location.href = 'admin.html'; // Admin dashboard
                    } else {
                        window.location.href = 'pos.html'; // Regular user POS page
                    }
                }, 1500); // 1.5 seconds delay for the success message to be visible
            } else {
                // Display error message on failed login
                feedback.style.display = 'flex';
                feedback.textContent = data.error || 'Login failed! Please check your credentials.';
                
                // Re-enable the login button so user can try again
                loginButton.disabled = false;
                loginButton.classList.remove('processing');
            }
        } catch (err) {
            // Handle network or server error
            console.error('Login error:', err);
            loading.style.display = 'none';
            feedback.style.display = 'flex';
            feedback.textContent = 'An error occurred during login. Please try again later.';
            
            // Re-enable the login button so user can try again
            loginButton.disabled = false;
            loginButton.classList.remove('processing');
        }
    });

    // Add a click event listener to error message to dismiss it
    document.getElementById('errorText').addEventListener('click', function() {
        this.style.display = 'none';
    });
});
