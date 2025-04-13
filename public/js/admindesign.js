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
    
    // Add more cubes for a richer background
    const addMoreCubes = () => {
        // Only add more cubes if we have less than 8 total for performance
        const background = document.querySelector('.background');
        if (background) {
            const currentCubes = document.querySelectorAll('.cube').length;
            
            // Limit total number of cubes to 8 for performance
            const cubesToAdd = Math.max(0, 8 - currentCubes);
            
            for (let i = 0; i < cubesToAdd; i++) {
                const cube = document.createElement('div');
                cube.classList.add('cube');
                background.appendChild(cube);
            }
            backgroundEffect();
        }
    };
    
    // Debounce the cube addition for better performance
    setTimeout(addMoreCubes, 1000);
    
    // Animate the logo icon with throttling
    const logoIcon = document.querySelector('.logo .rotating-icon');
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
    
    // Update current date and time
    const updateDateTime = () => {
        const dateTimeElement = document.getElementById('currentDateTime');
        if (dateTimeElement) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            dateTimeElement.textContent = now.toLocaleDateString('en-US', options);
        }
    };
    
    // Update date/time immediately and then every minute
    updateDateTime();
    setInterval(updateDateTime, 60000);
    
    // Navigation functionality
    const navLinks = document.querySelectorAll('.menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(item => {
                item.parentElement.classList.remove('active');
            });
            
            // Add active class to the clicked link
            this.parentElement.classList.add('active');
            
            // Hide all sections
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the corresponding section
            const targetId = this.getAttribute('href').slice(1);
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // Ripple effect for buttons
    const addRippleEffect = (elements) => {
        elements.forEach(element => {
            element.addEventListener('mousedown', function(e) {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    };
    
    // Apply ripple effect to all buttons
    addRippleEffect(document.querySelectorAll('.btn-add, .btn-refresh, .btn-secondary, .btn-view, .btn-edit, .btn-delete'));
    
    // Modal functionality
    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            // Prevent scrolling on the background
            document.body.style.overflow = 'hidden';
        }
    };
    
    const closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            // Re-enable scrolling
            document.body.style.overflow = 'auto';
        }
    };
    
    // Close modal when clicking on the backdrop
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Close modal when clicking the close button
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Event listeners for modal open buttons
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => openModal('addItemModal'));
    }
    
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => openModal('addUserModal'));
    }
    
    // Refresh button animation
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            icon.classList.add('fa-spin');
            
            // Simulate refresh delay (replace with actual data refresh in admin.js)
            setTimeout(() => {
                icon.classList.remove('fa-spin');
            }, 1000);
        });
    }
    
    // Initialize any tooltips or popovers if needed
    // This is a placeholder for actual tooltip initialization
    const initTooltips = () => {
        // Implementation will depend on which tooltip library you're using
        console.log('Tooltips initialized');
    };
    
    initTooltips();
    
    // Logout button confirmation
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add a confirmation before logout
            const confirmLogout = confirm('Are you sure you want to logout?');
            if (confirmLogout) {
                // Perform logout (redirect to login page)
                window.location.href = 'login.html';
            }
        });
    }
});
