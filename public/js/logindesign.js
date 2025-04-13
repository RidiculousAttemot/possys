document.addEventListener('DOMContentLoaded', function() {
    // Performance optimized background elements
    const backgroundEffect = () => {
        const cubes = document.querySelectorAll('.cube');
        cubes.forEach(cube => {
            // Random position
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            
            // Random size - limit max size for better performance
            const size = Math.random() * 60 + 30;
            
            // Random rotation
            const rotation = Math.random() * 360;
            
            // Slower animations for better performance (30-45s)
            const duration = Math.random() * 15 + 30;
            
            // Apply styles with hardware acceleration
            cube.style.left = `${x}vw`;
            cube.style.top = `${y}vh`;
            cube.style.width = `${size}px`;
            cube.style.height = `${size}px`;
            cube.style.transform = `rotate(${rotation}deg) translateZ(0)`;
            cube.style.animationDuration = `${duration}s`;
            
            // Reduce blur effects for better performance
            const blur = Math.random() > 0.7 ? 1 : 0;
            cube.style.filter = `blur(${blur}px)`;
        });
    };
    
    // Initialize background animation
    backgroundEffect();
    
    // Limit the number of background elements for performance
    const addMoreCubes = () => {
        // Only add more cubes if we have less than 8 total for performance
        const background = document.querySelector('.background');
        const currentCubes = document.querySelectorAll('.cube').length;
        
        // Limit total number of cubes to 8 for performance
        const cubesToAdd = Math.max(0, 8 - currentCubes);
        
        for (let i = 0; i < cubesToAdd; i++) {
            const cube = document.createElement('div');
            cube.classList.add('cube');
            background.appendChild(cube);
        }
        backgroundEffect();
    };
    
    // Debounce the cube addition for better performance
    setTimeout(addMoreCubes, 1000);
    
    // Optimize input animations
    const inputFields = document.querySelectorAll('.input-group input');
    
    inputFields.forEach(input => {
        input.addEventListener('focus', function() {
            requestAnimationFrame(() => {
                this.parentElement.classList.add('focused');
            });
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                requestAnimationFrame(() => {
                    this.parentElement.classList.remove('focused');
                });
            }
        });
        
        // Check if input has value on load
        if (input.value !== '') {
            this.parentElement.classList.add('focused');
        }
    });
    
    // Password visibility toggle - fixed and optimized
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('#password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default behavior
            
            // Toggle password visibility
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle the icon class
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Logo animation - optimized with throttling
    const logoIcon = document.querySelector('.logo-icon');
    if (logoIcon) {
        let rotation = 0;
        let lastTimestamp = 0;
        
        const animateLogo = (timestamp) => {
            // Throttle to 30fps for better performance
            if (timestamp - lastTimestamp > 33) {
                rotation += 0.5;
                logoIcon.style.transform = `rotate(${rotation}deg) translateZ(0)`;
                lastTimestamp = timestamp;
            }
            requestAnimationFrame(animateLogo);
        };
        
        requestAnimationFrame(animateLogo);
    }
    
    // Form submission optimization
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.querySelector('.btn-login');
    
    if (loginForm && loginButton) {
        loginForm.addEventListener('submit', function() {
            // Disable the button to prevent multiple submissions
            loginButton.disabled = true;
            
            requestAnimationFrame(() => {
                loginButton.classList.add('processing');
            });
        });
    }
    
    // Optimize button hover animations
    if (loginButton) {
        const btnIcon = loginButton.querySelector('.btn-icon');
        if (btnIcon) {
            loginButton.addEventListener('mouseover', function() {
                requestAnimationFrame(() => {
                    btnIcon.style.transform = 'translateX(4px) translateZ(0)';
                });
            });
            
            loginButton.addEventListener('mouseout', function() {
                requestAnimationFrame(() => {
                    btnIcon.style.transform = 'translateX(0) translateZ(0)';
                });
            });
        }
    }
    
    // Mock "remember me" functionality
    const rememberCheckbox = document.getElementById('rememberMe');
    if (rememberCheckbox) {
        // Check if username was saved previously
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            document.getElementById('username').value = savedUsername;
            document.getElementById('username').parentElement.classList.add('focused');
            rememberCheckbox.checked = true;
        }
        
        rememberCheckbox.addEventListener('change', function() {
            if (this.checked) {
                const username = document.getElementById('username').value;
                if (username) {
                    localStorage.setItem('rememberedUsername', username);
                }
            } else {
                localStorage.removeItem('rememberedUsername');
            }
        });
    }
    
    // Password reset modal - optimized
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simplified modal for better performance
            Swal.fire({
                title: 'Password Reset',
                text: 'Please contact your system administrator to reset your password.',
                icon: 'info',
                confirmButtonText: 'OK',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5',
                width: '360px',
                showClass: {
                    popup: 'animate__animated animate__fadeIn animate__faster'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOut animate__faster'
                },
                customClass: {
                    popup: 'custom-modal-popup',
                    confirmButton: 'custom-modal-button'
                },
                buttonsStyling: false
            });
        });
    }
    
    // Add subtle parallax glow effect to login box
    const loginBox = document.querySelector('.login-box');
    if (loginBox) {
        // More efficient event handling with throttling
        let lastMoveTime = 0;
        const moveThreshold = 16; // ~60fps
        
        document.addEventListener('mousemove', function(e) {
            const now = Date.now();
            
            // Only update if enough time has passed (throttling)
            if (now - lastMoveTime >= moveThreshold) {
                lastMoveTime = now;
                
                // Only do this on devices that likely have good performance
                if (window.innerWidth >= 768) {
                    // Get cursor position relative to center of screen
                    const xPos = (e.clientX / window.innerWidth - 0.5) * 7; // Reduced from 10 to 7 for smoother movement
                    const yPos = (e.clientY / window.innerHeight - 0.5) * 7;
                    
                    // Apply subtle shadow shift with hardware acceleration
                    requestAnimationFrame(() => {
                        loginBox.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.7),
                                                  ${xPos}px ${yPos}px 25px rgba(52, 152, 219, 0.15)`;
                    });
                }
            }
        });
    }
    
    // Add subtle text animation for the form title
    const formTitle = document.querySelector('.form-title');
    if (formTitle) {
        // Create a span for each letter to animate them individually
        const text = formTitle.textContent;
        let newHtml = '';
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i] === ' ' ? '&nbsp;' : text[i];
            const delay = i * 0.03; // Add a slight delay between each letter
            newHtml += `<span style="animation-delay: ${delay}s">${char}</span>`;
        }
        
        formTitle.innerHTML = newHtml;
        formTitle.classList.add('animated-text');
    }
    
    // Add focus animation to input fields
    inputFields.forEach(input => {
        // Create and add focus effect element to each input group
        const inputGroup = input.parentElement;
        const focusEffect = document.createElement('span');
        focusEffect.classList.add('focus-effect');
        inputGroup.appendChild(focusEffect);
        
        input.addEventListener('focus', function() {
            requestAnimationFrame(() => {
                inputGroup.classList.add('with-effect');
            });
        });
        
        input.addEventListener('blur', function() {
            requestAnimationFrame(() => {
                inputGroup.classList.remove('with-effect');
            });
        });
    });
    
    // Enhance login button with ripple effect
    if (loginButton) {
        loginButton.addEventListener('mousedown', function(e) {
            // Get position of click relative to button
            const rect = loginButton.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Create ripple element
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            loginButton.appendChild(ripple);
            
            // Remove ripple after animation completes
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
});

// Lazy load the animation library for better performance
window.addEventListener('load', function() {
    const animateCSSLink = document.createElement('link');
    animateCSSLink.rel = 'stylesheet';
    animateCSSLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
    document.head.appendChild(animateCSSLink);
});
