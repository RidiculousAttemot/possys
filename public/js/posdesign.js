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
                    <div class="cart-item-price">₱${item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-wrapper">
                        <button class="quantity-btn minus-btn" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity.toLocaleString()}</span>
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
    checkoutModal.className = 'modal';
    
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
                    <div class="payment-method-options">
                        <label class="payment-option">
                            <input type="radio" name="paymentMethod" value="cash" checked>
                            <span class="option-label"><i class="fas fa-money-bill-wave"></i> Cash</span>
                        </label>
                        <label class="payment-option">
                            <input type="radio" name="paymentMethod" value="gcash">
                            <span class="option-label"><i class="fas fa-mobile-alt"></i> GCash</span>
                        </label>
                        <label class="payment-option">
                            <input type="radio" name="paymentMethod" value="card">
                            <span class="option-label"><i class="fas fa-credit-card"></i> Card</span>
                        </label>
                        <label class="payment-option">
                            <input type="radio" name="paymentMethod" value="paymaya">
                            <span class="option-label"><i class="fas fa-wallet"></i> PayMaya</span>
                        </label>
                    </div>
                    
                    <div id="cashPaymentFields" class="payment-details-section">
                        <div class="form-group">
                            <label for="cashAmount"><i class="fas fa-money-bill-wave"></i> Amount Received</label>
                            <input type="number" id="cashAmount" placeholder="Enter amount" min="0" step="0.01">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-coins"></i> Change</label>
                            <input type="text" id="changeAmount" class="change-display" value="₱0.00" readonly disabled>
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
                    
                    <button id="confirmPaymentBtn" class="btn-primary" disabled>
                        <i class="fas fa-check-circle"></i> Complete Transaction
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary cancel-checkout">
                    <i class="fas fa-times-circle"></i> Cancel
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
            const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace('₱', '').replace(/,/g, '')) || 0;
            const changeAmount = cashAmount - totalAmount;
            
            document.getElementById('changeAmount').textContent = changeAmount >= 0 ? 
                `₱${changeAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '₱0.00';
            
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
                    <td class="text-center">${item.quantity.toLocaleString()}</td>
                    <td class="text-right">₱${parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td class="text-right">₱${parseFloat(itemTotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
            `;
        });
        
        checkoutItemsTable.innerHTML = html;
        
        // Update summary
        document.getElementById('subtotalAmount').textContent = `₱${parseFloat(subtotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('totalAmount').textContent = `₱${parseFloat(subtotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        // Reset payment method to cash
        const cashRadio = document.querySelector('input[name="paymentMethod"][value="cash"]');
        if (cashRadio) {
            cashRadio.checked = true;
            
            // Show cash payment fields since cash is default
            const cashPaymentFields = document.getElementById('cashPaymentFields');
            if (cashPaymentFields) {
                cashPaymentFields.style.display = 'block';
            }
            
            // Reset cash amount and change
            document.getElementById('cashAmount').value = '';
            document.getElementById('changeAmount').value = '₱0.00';
            
            // Disable confirm button until valid cash amount is entered
            const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
            if (confirmPaymentBtn) {
                confirmPaymentBtn.disabled = true;
            }
        }
        
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
                <div class="cart-item-price">₱${item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div class="quantity-wrapper">
                <button class="quantity-btn minus-btn" data-id="${item.id}">-</button>
                <span class="quantity-value">${item.quantity.toLocaleString()}</span>
                <button class="quantity-btn plus-btn" data-id="${item.id}">+</button>
            </div>
            <button class="cart-item-delete" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
};

// Setup payment method switching
const paymentMethodSelect = document.getElementById('paymentMethodSelect');
const epaymentOptions = document.getElementById('epaymentOptions');

if (paymentMethodSelect) {
    paymentMethodSelect.addEventListener('change', function() {
        // Show/hide e-payment options based on selection
        if (this.value === 'epayment') {
            epaymentOptions.style.display = 'block';
        } else {
            epaymentOptions.style.display = 'none';
        }
    });
}

// Function to process payment
function processPayment(paymentMethod) {
    // Show loading state
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Get selected payment method
    const paymentMethodSelect = document.getElementById('paymentMethodSelect');
    const selectedPaymentMethod = paymentMethodSelect.value;
    
    // Get e-payment type if applicable
    let paymentTypeForReceipt = selectedPaymentMethod;
    if (selectedPaymentMethod === 'epayment') {
        const epaymentTypeSelect = document.getElementById('epaymentTypeSelect');
        paymentTypeForReceipt = epaymentTypeSelect.value;
    }
    
    // Simulate payment processing (replace with actual API call)
    setTimeout(() => {
        // Close modal
        document.getElementById('checkoutModal').classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Clear cart
        if (window.clearCart) {
            window.clearCart();
        }
        
        // Get payment method name for success message
        let paymentMethodName = 'Cash';
        if (selectedPaymentMethod === 'epayment') {
            const epaymentTypeSelect = document.getElementById('epaymentTypeSelect');
            switch (epaymentTypeSelect.value) {
                case 'gcash': paymentMethodName = 'GCash'; break;
                case 'gotyme': paymentMethodName = 'GoTyme'; break;
                case 'bank': paymentMethodName = 'Bank Transfer'; break;
                case 'paymaya': paymentMethodName = 'PayMaya'; break;
                case 'debit': paymentMethodName = 'Debit Card'; break;
                case 'credit': paymentMethodName = 'Credit Card'; break;
                default: paymentMethodName = 'E-Payment'; break;
            }
        }
        
        // Show success message
        Swal.fire({
            title: 'Payment Successful!',
            text: `Your transaction has been completed successfully using ${paymentMethodName}.`,
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

// Expose the openCheckoutModal function globally
window.openCheckoutModal = function() {
    const cartItems = window.getCartItems ? window.getCartItems() : [];
    
    // ...existing code...
    
    // Reset payment method selection
    const paymentMethodSelect = document.getElementById('paymentMethodSelect');
    if (paymentMethodSelect) {
        paymentMethodSelect.value = 'cash';
    }
    
    // Hide e-payment options
    const epaymentOptions = document.getElementById('epaymentOptions');
    if (epaymentOptions) {
        epaymentOptions.style.display = 'none';
    }
    
    // Reset cash amount and change
    document.getElementById('cashAmount').value = '';
    document.getElementById('changeAmount').textContent = '₱0.00';
    
    // Show the modal
    checkoutModal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
};

// Add this CSS style to override and improve the payment form in checkout modal
const checkoutStyle = document.createElement('style');
checkoutStyle.textContent = `
    /* Better styling for payment inputs */
    #cashAmount, #changeAmount {
        width: 100%;
        padding: 12px 15px;
        border-radius: 8px;
        background-color: var(--dark-accent);
        border: 1px solid var(--border-color);
        color: var(--text-color);
        font-size: 16px;
        transition: var(--transition);
    }
    
    #cashAmount:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
    
    #changeAmount {
        background-color: var(--dark-secondary);
        color: var(--primary-color);
        font-weight: 600;
    }
    
    #confirmPaymentBtn {
        width: 100%;
        padding: 14px;
        border-radius: 8px;
        border: none;
        background: linear-gradient(to right, var(--primary-color), var(--primary-dark));
        color: white;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition);
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
    
    #confirmPaymentBtn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
    }
    
    #confirmPaymentBtn:disabled {
        background: linear-gradient(to right, var(--secondary-dark), var(--secondary-color));
        cursor: not-allowed;
        opacity: 0.7;
    }
    
    .btn-secondary.cancel-checkout {
        width: 100%;
        padding: 12px;
        border-radius: 8px;
        background-color: var(--dark-color);
        color: var(--text-color);
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: var(--transition);
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-top: 10px;
    }
    
    .btn-secondary.cancel-checkout:hover {
        background-color: var(--dark-accent);
        border-color: var(--danger);
        transform: translateY(-2px);
    }
    
    .change-display {
        padding: 12px;
        border-radius: 8px;
        background-color: var(--dark-secondary);
        border: 1px solid var(--border-color);
        color: var(--primary-color);
        font-size: 16px;
        font-weight: 600;
        text-align: left;
    }
`;

document.head.appendChild(checkoutStyle);

// Override createCartItemHTML function to support formatted numbers
window.createCartItemHTML = function(item) {
    const itemTotal = (item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₱${item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div class="cart-quantity-control">
                <button class="cart-quantity-btn cart-minus-btn" data-id="${item.id}">−</button>
                <div class="cart-quantity-value">${item.quantity.toLocaleString()}</div>
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

// Calculate change for cash payments with formatted numbers
const cashAmountInput = document.getElementById('cashAmount');
if (cashAmountInput) {
    cashAmountInput.addEventListener('input', function() {
        const cashAmount = parseFloat(this.value) || 0;
        const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace('₱', '').replace(/,/g, '')) || 0;
        const changeAmount = cashAmount - totalAmount;
        
        document.getElementById('changeAmount').textContent = changeAmount >= 0 ? 
            `₱${changeAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '₱0.00';
        
        // Enable/disable confirm button based on valid cash amount
        const confirmBtn = document.getElementById('confirmPaymentBtn');
        confirmBtn.disabled = cashAmount < totalAmount;
    });
}

// Expose the openCheckoutModal function globally with formatted numbers
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
    
    // Populate checkout items table with formatted numbers
    const checkoutItemsTable = document.getElementById('checkoutItemsTable');
    let html = '';
    let subtotal = 0;
    
    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
            <tr>
                <td>${item.name}</td>
                <td class="text-center">${item.quantity.toLocaleString()}</td>
                <td class="text-right">₱${parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="text-right">₱${parseFloat(itemTotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
        `;
    });
    
    checkoutItemsTable.innerHTML = html;
    
    // Update summary with formatted numbers
    document.getElementById('subtotalAmount').textContent = `₱${parseFloat(subtotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('totalAmount').textContent = `₱${parseFloat(subtotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
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

// Override the createCartItemHTML function to use the new vertical layout with formatted numbers
window.createCartItemHTML = function(item) {
    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₱${item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-wrapper">
                    <button class="quantity-btn minus-btn" data-id="${item.id}">-</button>
                    <span class="quantity-value">${item.quantity.toLocaleString()}</span>
                    <button class="quantity-btn plus-btn" data-id="${item.id}">+</button>
                </div>
                <button class="cart-item-delete" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
};

// Override the createCartItemHTML function to match the updated iPod Shuffle style layout with formatted numbers
window.createCartItemHTML = function(item) {
    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₱${item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div class="quantity-wrapper">
                <button class="quantity-btn minus-btn" data-id="${item.id}">-</button>
                <span class="quantity-value">${item.quantity.toLocaleString()}</span>
                <button class="quantity-btn plus-btn" data-id="${item.id}">+</button>
            </div>
            <button class="cart-item-delete" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
};

// Make sure the checkout button opens the modal
document.addEventListener('DOMContentLoaded', function() {
    // Ensure the checkout button works properly
    const setupCheckoutButton = () => {
        const checkoutBtn = document.querySelector('.btn-checkout');
        if (checkoutBtn) {
            // Remove any existing click event listeners to avoid duplicates
            const newCheckoutBtn = checkoutBtn.cloneNode(true);
            checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);
            
            // Add new click event listener
            newCheckoutBtn.addEventListener('click', function() {
                console.log('Checkout button clicked');
                if (window.openCheckoutModal) {
                    window.openCheckoutModal();
                } else {
                    console.error('openCheckoutModal function not found');
                    // Fallback to direct modal display
                    const checkoutModal = document.getElementById('checkoutModal');
                    if (checkoutModal) {
                        checkoutModal.classList.add('show');
                        document.body.style.overflow = 'hidden';
                    } else {
                        console.error('checkoutModal element not found');
                    }
                }
            });
        } else {
            console.error('Checkout button not found in the DOM');
        }
    };
    
    // Run setup for checkout button
    setupCheckoutButton();
    
    // Make openCheckoutModal globally available and ensure it works properly
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
        
        console.log('Opening checkout modal with items:', cartItems);
        
        // Populate checkout items table with formatted numbers
        const checkoutItemsTable = document.getElementById('checkoutItemsTable');
        if (!checkoutItemsTable) {
            console.error('checkoutItemsTable element not found');
            return;
        }
        
        let html = '';
        let subtotal = 0;
        
        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td class="text-center">${item.quantity.toLocaleString()}</td>
                    <td class="text-right">₱${parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td class="text-right">₱${parseFloat(itemTotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
            `;
        });
        
        checkoutItemsTable.innerHTML = html;
        
        // Update summary with formatted numbers
        const subtotalAmount = document.getElementById('subtotalAmount');
        const totalAmount = document.getElementById('totalAmount');
        
        if (subtotalAmount) {
            subtotalAmount.textContent = `₱${parseFloat(subtotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        } else {
            console.error('subtotalAmount element not found');
        }
        
        if (totalAmount) {
            totalAmount.textContent = `₱${parseFloat(subtotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        } else {
            console.error('totalAmount element not found');
        }
        
        // Reset payment method (if applicable)
        const cashRadio = document.querySelector('input[name="paymentMethod"][value="cash"]');
        if (cashRadio) {
            cashRadio.checked = true;
        }
        
        // Reset cash amount and change
        const cashAmount = document.getElementById('cashAmount');
        const changeAmount = document.getElementById('changeAmount');
        
        if (cashAmount) {
            cashAmount.value = '';
        }
        
        if (changeAmount) {
            changeAmount.value = '₱0.00';
        }
        
        // Show the modal
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            checkoutModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
        } else {
            console.error('checkoutModal element not found');
        }
    };
    
    // Define getCartItems function if it doesn't exist
    if (!window.getCartItems) {
        window.getCartItems = function() {
            // Try to access cart items from pos.js or use localStorage as fallback
            if (window.cartItems && Array.isArray(window.cartItems)) {
                return window.cartItems;
            } else {
                // Fallback to localStorage
                const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
                return storedCart;
            }
        };
    }
});

// Override and ensure the checkout button event handler works
const checkoutBtn = document.getElementById('checkoutBtn');
if (checkoutBtn) {
    // Remove any existing event listeners to prevent duplicates
    const newCheckoutBtn = checkoutBtn.cloneNode(true);
    checkoutBtn.parentNode.replaceChild(newCheckoutBtn, checkoutBtn);
    
    // Add new click event listener
    newCheckoutBtn.addEventListener('click', function() {
        console.log('Checkout button clicked');
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            // Check if cart is empty first
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
            
            // Show modal
            checkoutModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Use openCheckoutModal if available to populate data
            if (window.openCheckoutModal) {
                window.openCheckoutModal();
            }
        } else {
            console.error('Checkout modal not found');
        }
    });
}

// Add this code to handle payment method switching and related UI updates
document.addEventListener('DOMContentLoaded', function() {
    // Setup payment method radio buttons
    const setupPaymentMethodHandlers = () => {
        const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
        const cashPaymentFields = document.getElementById('cashPaymentFields');
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');

        if (paymentMethodRadios.length > 0) {
            paymentMethodRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    if (this.value === 'cash') {
                        // Show cash payment fields and require validation
                        cashPaymentFields.style.display = 'block';
                        confirmPaymentBtn.disabled = true;
                        
                        // Check current cash amount value for validation
                        const cashAmount = parseFloat(document.getElementById('cashAmount').value) || 0;
                        const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace('₱', '').replace(/,/g, '')) || 0;
                        confirmPaymentBtn.disabled = cashAmount < totalAmount;
                    } else {
                        // Hide cash payment fields and enable button immediately for other payment methods
                        cashPaymentFields.style.display = 'none';
                        confirmPaymentBtn.disabled = false;
                    }
                });
            });
        }
    };

    // Call setup function
    setupPaymentMethodHandlers();
});

// Update the cash amount input handler
const cashAmountInput = document.getElementById('cashAmount');
if (cashAmountInput) {
    cashAmountInput.addEventListener('input', function() {
        const cashAmount = parseFloat(this.value) || 0;
        const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace('₱', '').replace(/,/g, '')) || 0;
        const changeAmount = cashAmount - totalAmount;
        
        document.getElementById('changeAmount').value = changeAmount >= 0 ? 
            `₱${changeAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '₱0.00';
        
        // Enable/disable confirm button based on valid cash amount
        const confirmBtn = document.getElementById('confirmPaymentBtn');
        confirmBtn.disabled = cashAmount < totalAmount;
    });
}

// Update the openCheckoutModal function to handle payment methods properly
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
                <td class="text-center">${item.quantity.toLocaleString()}</td>
                <td class="text-right">₱${parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="text-right">₱${parseFloat(itemTotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>
        `;
    });
    
    checkoutItemsTable.innerHTML = html;
    
    // Update summary
    document.getElementById('subtotalAmount').textContent = `₱${parseFloat(subtotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('totalAmount').textContent = `₱${parseFloat(subtotal).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Reset payment method to cash
    const cashRadio = document.querySelector('input[name="paymentMethod"][value="cash"]');
    if (cashRadio) {
        cashRadio.checked = true;
        
        // Show cash payment fields since cash is default
        const cashPaymentFields = document.getElementById('cashPaymentFields');
        if (cashPaymentFields) {
            cashPaymentFields.style.display = 'block';
        }
        
        // Reset cash amount and change
        document.getElementById('cashAmount').value = '';
        document.getElementById('changeAmount').value = '₱0.00';
        
        // Disable confirm button until valid cash amount is entered
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
        if (confirmPaymentBtn) {
            confirmPaymentBtn.disabled = true;
        }
    }
    
    // Show the modal
    checkoutModal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
};

// Update processPayment function to handle different payment methods
function processPayment() {
    // Show loading state
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Get selected payment method
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Get payment details based on method
    let paymentDetails = {
        method: selectedPaymentMethod
    };
    
    // For cash payment, add amount and change
    if (selectedPaymentMethod === 'cash') {
        const cashAmount = parseFloat(document.getElementById('cashAmount').value) || 0;
        const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace('₱', '').replace(/,/g, '')) || 0;
        const changeAmount = cashAmount - totalAmount;
        
        paymentDetails.cashAmount = cashAmount;
        paymentDetails.changeAmount = changeAmount;
    }
    
    // Simulate payment processing
    setTimeout(() => {
        // Close modal
        document.getElementById('checkoutModal').classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Clear cart
        if (window.clearCart) {
            window.clearCart();
        }
        
        // Get payment method name for success message
        let paymentMethodName = 'Cash';
        switch (selectedPaymentMethod) {
            case 'gcash': paymentMethodName = 'GCash'; break;
            case 'card': paymentMethodName = 'Card'; break;
            case 'paymaya': paymentMethodName = 'PayMaya'; break;
        }
        
        // Show success message with payment method
        let successMessage = `Your transaction has been completed successfully using ${paymentMethodName}.`;
        
        // Add change information for cash payments
        if (selectedPaymentMethod === 'cash') {
            successMessage += ` Change: ₱${paymentDetails.changeAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
        
        Swal.fire({
            title: 'Payment Successful!',
            text: successMessage,
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

// Update the confirmPaymentBtn event listener
const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
if (confirmPaymentBtn) {
    // Replace existing listener by cloning the button
    const newConfirmPaymentBtn = confirmPaymentBtn.cloneNode(true);
    confirmPaymentBtn.parentNode.replaceChild(newConfirmPaymentBtn, confirmPaymentBtn);
    
    // Add new event listener
    newConfirmPaymentBtn.addEventListener('click', processPayment);
}
