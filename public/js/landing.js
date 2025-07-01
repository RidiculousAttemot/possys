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
    
    // Set up home button to scroll to top
    const homeBtn = document.querySelector('.nav-home');
    if (homeBtn) {
        homeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
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

    // Fixed implementation for navigation links
    // Only select navigation links that have href starting with # and are not login or home
    document.querySelectorAll('.nav-links a[href^="#"]:not(.btn-login):not(.nav-home)').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            // Only process if it's a valid section ID
            if (targetId && targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Account for fixed header height
                    const headerHeight = document.getElementById('header').offsetHeight;
                    const yOffset = -headerHeight - 10; // Add extra padding for better positioning
                    const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    
                    // Use scrollTo with smooth behavior for better experience
                    window.scrollTo({
                        top: y,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (navLinks && navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                    }
                }
            }
        });
    });
});
