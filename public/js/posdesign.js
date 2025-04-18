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
    
    // Category selection
    const categoryButtons = document.querySelectorAll('.category-item');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to the clicked button
            this.classList.add('active');
            
            // Display loading state
            const productGrid = document.getElementById('productGrid');
            if (productGrid) {
                productGrid.innerHTML = `
                    <div class="loading-items">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading items...</p>
                    </div>
                `;
            }
        });
    });
    
    // Search input animation
    const searchInput = document.getElementById('searchItems');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.boxShadow = '0 0 0 2px rgba(52, 152, 219, 0.3)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.style.boxShadow = 'none';
        });
    }
    
    // Modal functionality
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close');
    
    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };
    
    const closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    };
    
    // Close modals when clicking on X
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Close modals when clicking outside content
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Button event listeners
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            openModal('checkoutModal');
        });
    }
    
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            openModal('historyModal');
        });
    }
    
    // Confirm payment button state
    const amountTenderedInput = document.getElementById('amountTendered');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    
    if (amountTenderedInput && confirmPaymentBtn) {
        amountTenderedInput.addEventListener('input', function() {
            const amountDue = parseFloat(document.getElementById('amountDue').textContent);
            const amountTendered = parseFloat(this.value);
            
            if (!isNaN(amountTendered) && amountTendered >= amountDue) {
                confirmPaymentBtn.disabled = false;
                
                // Calculate change
                const change = amountTendered - amountDue;
                document.getElementById('change').value = `₱${change.toFixed(2)}`;
            } else {
                confirmPaymentBtn.disabled = true;
                document.getElementById('change').value = `₱0.00`;
            }
        });
    }
    
    // Discount checkboxes
    const discountCheckboxes = document.querySelectorAll('.discount-option input[type="checkbox"]');
    const discountIdContainer = document.getElementById('discountIdContainer');
    
    if (discountCheckboxes && discountIdContainer) {
        discountCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                // Uncheck other checkboxes
                discountCheckboxes.forEach(cb => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });
                
                // Show/hide ID input if a discount is selected
                const anyChecked = Array.from(discountCheckboxes).some(cb => cb.checked);
                discountIdContainer.style.display = anyChecked ? 'block' : 'none';
                
                // Show/hide discount row in summary
                document.getElementById('discount-row').style.display = anyChecked ? 'flex' : 'none';
            });
        });
    }
    
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
    
    // Apply ripple effect to buttons
    addRippleEffect(document.querySelectorAll('.btn-checkout, .btn-history, .btn-confirm-payment, .category-item'));
    
    // Connection status indicator
    const connectionStatus = document.querySelector('.connection-status');
    
    // Simulate connection status check
    const checkConnectionStatus = () => {
        // In a real app, this would check connection to the server
        const online = Math.random() > 0.1; // 90% chance of being online for demo
        
        if (connectionStatus) {
            connectionStatus.className = 'connection-status';
            connectionStatus.classList.add(online ? 'online' : 'offline');
            
            connectionStatus.innerHTML = online ? 
                '<i class="fas fa-wifi"></i><span>Connected</span>' : 
                '<i class="fas fa-exclamation-triangle"></i><span>Offline</span>';
        }
    };
    
    // Check connection status periodically
    checkConnectionStatus();
    setInterval(checkConnectionStatus, 30000);
    
    // Logout button
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            Swal.fire({
                title: 'Logout Confirmation',
                text: 'Are you sure you want to logout?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3498db',
                cancelButtonColor: '#e74c3c',
                confirmButtonText: 'Yes, Logout',
                cancelButtonText: 'Cancel',
                background: '#141414',
                color: '#f5f5f5'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Clear auth token
                    localStorage.removeItem('authToken');
                    
                    // Redirect to login page
                    window.location.href = 'login.html';
                }
            });
        });
    }
});
