document.addEventListener('DOMContentLoaded', function() {
    // Set up login button to always redirect to login page
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear any existing authentication to ensure fresh login
            localStorage.clear();
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
    
    // Handle mobile menu toggling
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Handle header styling on scroll
    window.addEventListener('scroll', function() {
        const header = document.getElementById('header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        }
    });
});
