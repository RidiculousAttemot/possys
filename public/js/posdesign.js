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
                    // Clear all auth tokens and user info
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    
                    // Force redirect to login page
                    window.location.replace('login.html');
                }
            });
        });
    }

    // Override createCartItemHTML function for the new layout
    window.createCartItemHTML = function(item) {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-quantity-control">
                    <button class="cart-quantity-btn cart-minus-btn" data-id="${item.id}">−</button>
                    <div class="cart-quantity-value">${item.quantity}</div>
                    <button class="cart-quantity-btn cart-plus-btn" data-id="${item.id}">+</button>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-total">₱${itemTotal}</div>
                    <button class="cart-item-delete" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    };

    // Function to update cart items display (ensure it uses the correct cart variable)
    window.displayCartItems = function() {
        const cartItemsContainer = document.getElementById('cartItems');
        const emptyCartMessage = document.getElementById('emptyCart');
        
        // Access the cartItems array from pos.js
        const cartItems = window.cartItems || []; 
        
        if (cartItems.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'flex';
            if (cartItemsContainer) cartItemsContainer.innerHTML = ''; // Clear container
            // Ensure the empty message is displayed correctly if the container was previously filled
            if (cartItemsContainer && emptyCartMessage) {
                 cartItemsContainer.appendChild(emptyCartMessage);
            }
            return;
        }
        
        // Hide empty cart message if it exists and cart is not empty
        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        
        // Generate HTML for cart items
        let cartHTML = '';
        cartItems.forEach(item => {
            // Ensure createCartItemHTML is available
            if (window.createCartItemHTML) {
                cartHTML += window.createCartItemHTML(item);
            } else {
                // Basic fallback if function isn't loaded (shouldn't happen)
                cartHTML += `<div>Error loading item: ${item.name}</div>`;
                console.error("createCartItemHTML function not found!");
            }
        });
        
        // Update the cart container
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = cartHTML;
        }
    };

    // Make sure we update event listeners for the new cart item structure
    window.addCartEventListeners = function() {
        // Handle minus button clicks
        document.querySelectorAll('.cart-minus-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                // This will call the updateCartItemQuantity function from pos.js
                window.updateCartItemQuantity(itemId, -1);
            });
        });

        // Handle plus button clicks
        document.querySelectorAll('.cart-plus-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                window.updateCartItemQuantity(itemId, 1);
            });
        });

        // Handle delete button clicks
        document.querySelectorAll('.cart-item-delete').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                window.removeFromCart(itemId);
            });
        });
    };
    
    // Apply CSS styles for the new cart item layout
 const styleElement = document.createElement('style');
styleElement.textContent = `
    /* Compact Cart Item Layout */
    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--dark-secondary);
        border-radius: 6px;
        padding: 8px 12px;
        margin-bottom: 8px;
        border: 1px solid var(--border-color);
        transition: var(--transition);
        min-height: 40px;
    }
    
    .cart-item:hover {
        border-color: var(--primary-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    /* Left Section - Product Info */
    .cart-item-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
        padding-right: 12px;
        flex: 1;
    }
    
    .cart-item-name {
        font-weight: 500;
        color: var(--text-color);
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .cart-item-price {
        color: var(--text-dark);
        font-size: 11px;
        margin-top: 2px;
    }
    
    /* Middle Section - Quantity Control */
    .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .quantity-btn {
        border: none;
        background-color: var(--dark-accent);
        color: var(--text-color);
        width: 24px;
        height: 24px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 12px;
        padding: 0;
        transition: var(--transition);
    }
    
    .quantity-btn:hover {
        background-color: var(--primary-color);
        color: white;
    }
    
    .quantity-value {
        width: 24px;
        text-align: center;
        font-size: 12px;
        font-weight: 500;
        color: var(--text-color);
    }
    
    /* Right Section - Delete Button */
    .cart-item-delete {
        background: none;
        border: none;
        color: var(--text-dark);
        cursor: pointer;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition);
        font-size: 12px;
        padding: 0;
    }
    
    .cart-item-delete:hover {
        color: var(--danger);
    }
`;
    document.head.appendChild(styleElement);

    // Expose cart variable globally if needed (ensure it uses cartItems from pos.js)
    // This might not be necessary if pos.js manages the cartItems array
    // if (!window.cartItems) {
    //     window.cartItems = []; // Or reference the one from pos.js if possible
    // }

    // Apply custom CSS styles for compact cart item layout with column direction
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Compact Cart Item Layout */
        .cart-item {
            display: flex;
            flex-direction: column;
            background-color: var(--dark-secondary);
            border-radius: 6px;
            padding: 10px 12px;
            margin-bottom: 8px;
            border: 1px solid var(--border-color);
            transition: var(--transition);
            min-height: 40px;
            
        }
        
        .cart-item:hover {
            border-color: var(--primary-color);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        /* Left Section - Product Info */
        .cart-item-info {
            display: flex;
            flex-direction: column;
            width: 100%;
            margin-bottom: 8px;
        }
        
        .cart-item-name {
            font-weight: 500;
            color: var(--text-color);
            font-size: 13px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .cart-item-price {
            color: var(--text-dark);
            font-size: 11px;
            margin-top: 2px;
        }
        
        /* Bottom Section - Controls */
        .cart-item-controls {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
        }
        
        .quantity-btn {
            border: none;
            background-color: var(--dark-accent);
            color: var(--text-color);
            width: 24px;
            height: 24px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px;
            padding: 0;
            transition: var(--transition);
        }
        
        .quantity-btn:hover {
            background-color: var(--primary-color);
            color: white;
        }
        
        .quantity-value {
            width: 24px;
            text-align: center;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-color);
        }
        
        /* Quantity controls wrapper */
        .quantity-wrapper {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        /* Right Section - Delete Button */
        .cart-item-delete {
            background: none;
            border: none;
            color: var(--text-dark);
            cursor: pointer;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: var(--transition);
            font-size: 12px;
            padding: 0;
        }
        
        .cart-item-delete:hover {
            color: var (--danger);
        }
    `;
    document.head.appendChild(styleElement);
    
    // Override the createCartItemHTML function to use the new vertical layout
    window.createCartItemHTML = function(item) {
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-wrapper">
                        <button class="quantity-btn minus-btn" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn plus-btn" data-id="${item.id}">+</button>
                    </div>
                    <button class="cart-item-delete" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    };
    
    // Setup event delegation for cart item controls
    document.addEventListener('click', function(e) {
        // Handle minus button
        if (e.target.classList.contains('minus-btn')) {
            const itemId = e.target.getAttribute('data-id');
            if (window.updateCartItemQuantity) {
                window.updateCartItemQuantity(itemId, -1);
            }
        }
        
        // Handle plus button
        if (e.target.classList.contains('plus-btn')) {
            const itemId = e.target.getAttribute('data-id');
            if (window.updateCartItemQuantity) {
                window.updateCartItemQuantity(itemId, 1);
            }
        }
        
        // Handle delete button
        if (e.target.classList.contains('cart-item-delete') || 
            (e.target.parentElement && e.target.parentElement.classList.contains('cart-item-delete'))) {
            const itemId = e.target.getAttribute('data-id') || e.target.parentElement.getAttribute('data-id');
            if (window.removeFromCart) {
                window.removeFromCart(itemId);
            }
        }
    });

    // Create and append the full-page checkout modal to the document body
    const checkoutModal = document.createElement('div');
    checkoutModal.id = 'checkoutModal';
    checkoutModal.className = 'fullpage-modal';
    
    checkoutModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-shopping-cart"></i> Complete Your Purchase</h2>
                <button class="close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="checkout-items-section">
                    <h3>Order Summary</h3>
                    <div class="checkout-items">
                        <table class="checkout-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody id="checkoutItemsTable">
                                <!-- Cart items will be loaded here dynamically -->
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="payment-summary">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span id="subtotalAmount">₱0.00</span>
                        </div>
                        <div class="summary-row discount-row" id="discountRow" style="display: none;">
                            <span>Discount:</span>
                            <span id="discountAmount">₱0.00</span>
                        </div>
                        <div class="summary-row total-final">
                            <span>Total:</span>
                            <span id="totalAmount">₱0.00</span>
                        </div>
                    </div>
                </div>
                
                <div class="checkout-payment-section">
                    <h3>Payment Method</h3>
                    <div class="payment-options">
                        <div class="payment-option">
                            <input type="radio" id="paymentCash" name="paymentMethod" value="cash" checked>
                            <label for="paymentCash">
                                <i class="fas fa-money-bill-wave"></i>
                                <span>Cash</span>
                            </label>
                        </div>
                        <div class="payment-option">
                            <input type="radio" id="paymentCard" name="paymentMethod" value="card">
                            <label for="paymentCard">
                                <i class="fas fa-credit-card"></i>
                                <span>Card</span>
                            </label>
                        </div>
                        <div class="payment-option">
                            <input type="radio" id="paymentGcash" name="paymentMethod" value="gcash">
                            <label for="paymentGcash">
                                <i class="fas fa-mobile-alt"></i>
                                <span>GCash</span>
                            </label>
                        </div>
                    </div>
                    
                    <div id="cashDetails" class="payment-details-section">
                        <div class="payment-input-group">
                            <div class="form-group">
                                <label for="cashAmount">Amount Received</label>
                                <input type="number" id="cashAmount" placeholder="Enter amount" min="0" step="0.01">
                            </div>
                        </div>
                        <div class="payment-input-group">
                            <div class="form-group">
                                <label>Change</label>
                                <div id="changeAmount" class="change-display">₱0.00</div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="cardDetails" class="payment-details-section" style="display: none;">
                        <div class="payment-input-group">
                            <div class="form-group">
                                <label for="cardNumber">Card Number</label>
                                <input type="text" id="cardNumber" placeholder="•••• •••• •••• ••••">
                            </div>
                        </div>
                        <div class="payment-input-group">
                            <div class="form-group">
                                <label for="cardName">Cardholder Name</label>
                                <input type="text" id="cardName" placeholder="Name on card">
                            </div>
                        </div>
                        <div class="payment-input-group">
                            <div class="form-group">
                                <label for="cardExpiry">Expiry Date</label>
                                <input type="text" id="cardExpiry" placeholder="MM/YY">
                            </div>
                            <div class="form-group">
                                <label for="cardCvv">CVV</label>
                                <input type="password" id="cardCvv" placeholder="•••">
                            </div>
                        </div>
                    </div>
                    
                    <div id="gcashDetails" class="payment-details-section" style="display: none;">
                        <div class="payment-input-group">
                            <div class="form-group">
                                <label for="gcashNumber">GCash Number</label>
                                <input type="text" id="gcashNumber" placeholder="09XX XXX XXXX">
                            </div>
                        </div>
                        <div class="payment-input-group">
                            <div class="form-group">
                                <label for="gcashReference">Reference Number</label>
                                <input type="text" id="gcashReference" placeholder="Enter reference number">
                            </div>
                        </div>
                    </div>
                    
                    <div class="receipt-options">
                        <h3>Receipt Options</h3>
                        <div class="receipt-option">
                            <input type="checkbox" id="printReceipt" checked>
                            <label for="printReceipt">Print receipt</label>
                        </div>
                        <div class="receipt-option">
                            <input type="checkbox" id="emailReceipt">
                            <label for="emailReceipt">Email receipt</label>
                        </div>
                    </div>
                    
                    <button id="confirmPaymentBtn" class="btn-confirm-payment">
                        <i class="fas fa-check-circle"></i> Complete Transaction
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary cancel-checkout">Cancel</button>
                <button class="btn-apply-discount">
                    <i class="fas fa-tag"></i> Apply Discount
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(checkoutModal);
    
    // Setup modal functionality
    const closeBtn = checkoutModal.querySelector('.close');
    const cancelBtn = checkoutModal.querySelector('.cancel-checkout');
    
    closeBtn.addEventListener('click', function() {
        checkoutModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    });
    
    cancelBtn.addEventListener('click', function() {
        checkoutModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    });
    
    // Setup payment method switching
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            // Hide all payment details sections
            document.querySelectorAll('.payment-details-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show the selected payment details section
            const selectedMethod = this.value;
            document.getElementById(`${selectedMethod}Details`).style.display = 'block';
        });
    });
    
    // Calculate change for cash payments
    const cashAmountInput = document.getElementById('cashAmount');
    if (cashAmountInput) {
        cashAmountInput.addEventListener('input', function() {
            const cashAmount = parseFloat(this.value) || 0;
            const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace('₱', '')) || 0;
            const changeAmount = cashAmount - totalAmount;
            
            document.getElementById('changeAmount').textContent = changeAmount >= 0 ? 
                `₱${changeAmount.toFixed(2)}` : '₱0.00';
            
            // Enable/disable confirm button based on valid cash amount
            const confirmBtn = document.getElementById('confirmPaymentBtn');
            confirmBtn.disabled = cashAmount < totalAmount;
        });
    }
    
    // Make checkout button open the modal
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            openCheckoutModal();
        });
    }
    
    // Expose the openCheckoutModal function globally
    window.openCheckoutModal = function() {
        const cartItems = window.getCartItems ? window.getCartItems() : [];
        
        if (cartItems.length === 0) {
            Swal.fire({
                title: 'Empty Cart',
                text: 'Please add items to your cart before checkout',
                icon: 'warning',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
            return;
        }
        
        // Populate checkout items table
        const checkoutItemsTable = document.getElementById('checkoutItemsTable');
        let html = '';
        let subtotal = 0;
        
        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">₱${parseFloat(item.price).toFixed(2)}</td>
                    <td class="text-right">₱${parseFloat(itemTotal).toFixed(2)}</td>
                </tr>
            `;
        });
        
        checkoutItemsTable.innerHTML = html;
        
        // Update summary
        document.getElementById('subtotalAmount').textContent = `₱${parseFloat(subtotal).toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `₱${parseFloat(subtotal).toFixed(2)}`;
        
        // Reset payment method
        document.getElementById('paymentCash').checked = true;
        document.getElementById('cashDetails').style.display = 'block';
        document.getElementById('cardDetails').style.display = 'none';
        document.getElementById('gcashDetails').style.display = 'none';
        
        // Reset cash amount and change
        document.getElementById('cashAmount').value = '';
        document.getElementById('changeAmount').textContent = '₱0.00';
        
        // Show the modal
        checkoutModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
    };
    
    // Handle the confirm payment button
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', function() {
            // Get selected payment method
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            
            // Validate payment details based on method
            let isValid = true;
            let errorMessage = '';
            
            if (paymentMethod === 'cash') {
                const cashAmount = parseFloat(document.getElementById('cashAmount').value) || 0;
                const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace('₱', '')) || 0;
                
                if (cashAmount < totalAmount) {
                    isValid = false;
                    errorMessage = 'Cash amount must be greater than or equal to the total amount';
                }
            } else if (paymentMethod === 'card') {
                const cardNumber = document.getElementById('cardNumber').value;
                const cardName = document.getElementById('cardName').value;
                const cardExpiry = document.getElementById('cardExpiry').value;
                const cardCvv = document.getElementById('cardCvv').value;
                
                if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
                    isValid = false;
                    errorMessage = 'Please fill in all card details';
                }
            } else if (paymentMethod === 'gcash') {
                const gcashNumber = document.getElementById('gcashNumber').value;
                const gcashReference = document.getElementById('gcashReference').value;
                
                if (!gcashNumber || !gcashReference) {
                    isValid = false;
                    errorMessage = 'Please fill in all GCash details';
                }
            }
            
            if (!isValid) {
                Swal.fire({
                    title: 'Invalid Payment',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5'
                });
                return;
            }
            
            // Process payment
            processPayment(paymentMethod);
        });
    }
    
    // Function to process payment
    function processPayment(paymentMethod) {
        // Show loading state
        const confirmBtn = document.getElementById('confirmPaymentBtn');
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Simulate payment processing (replace with actual API call)
        setTimeout(() => {
            // Close modal
            document.getElementById('checkoutModal').classList.remove('show');
            document.body.style.overflow = 'auto';
            
            // Clear cart
            if (window.clearCart) {
                window.clearCart();
            }
            
            // Show success message
            Swal.fire({
                title: 'Payment Successful!',
                text: 'Your transaction has been completed successfully.',
                icon: 'success',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
            
            // Reset button state
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Complete Transaction';
            
        }, 1500); // Simulate a 1.5 second payment process
    }
});

// Override the createCartItemHTML function to match the updated iPod Shuffle style layout
window.createCartItemHTML = function(item) {
    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₱${item.price.toFixed(2)}</div>
            </div>
            <div class="quantity-wrapper">
                <button class="quantity-btn minus-btn" data-id="${item.id}">-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn plus-btn" data-id="${item.id}">+</button>
            </div>
            <button class="cart-item-delete" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
};
