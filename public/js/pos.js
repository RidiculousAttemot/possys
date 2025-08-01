document.addEventListener('DOMContentLoaded', function() {
    // Authentication check
    const checkAuth = () => {
        const token = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        
        if (!token) {
            // Redirect to login page if no token
            window.location.href = 'login.html';
            return false;
        }
        
        // Check if user is admin - they should be on admin page
        if (userRole === 'admin') {
            window.location.href = 'admin.html';
            return false;
        }
        
        // Set user display name from localStorage
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = localStorage.getItem('userName') || 'Cashier';
        }
        
        return true;
    };
    
    // Check authentication on page load
    if (!checkAuth()) return;
    
    // Global variables
    let allProducts = []; // Will store all products fetched from the database
    let cartItems = []; // Will store items added to cart
    let categories = []; // Will store unique categories
    let currentCategory = 'all'; // Track current category filter
    let searchTerm = ''; // Track current search term
    
    // API base URL - define once at the top
    const API_URL = 'http://localhost:5000/api';
    
    // Function to fetch products from API
    const fetchProducts = async () => {
        try {
            // Show loading state
            const productGrid = document.getElementById('productGrid');
            productGrid.innerHTML = `
                <div class="loading-items">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading items...</p>
                </div>
            `;
            
            // Actual API call to fetch products
            const response = await fetch(`${API_URL}/inventory?timestamp=${Date.now()}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            
            const data = await response.json();
            
            // Transform data to match our expected format
            allProducts = data.map(item => ({
                id: item.item_id,
                name: item.item_name,
                price: parseFloat(item.price),
                stock: parseInt(item.stock_quantity),
                category: item.category,
                description: item.description || 'No description available',
                image: item.image
            }));
            
            // Extract unique categories for the category filter
            extractCategories();
            
            // Display the products (filtered by current category and search term)
            filterAndDisplayProducts();
            
        } catch (error) {
            console.error('Error fetching products:', error);
            
            // Show error state
            const productGrid = document.getElementById('productGrid');
            productGrid.innerHTML = `
                <div class="error-items">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load items. Please try again.</p>
                    <button class="btn-retry" onclick="fetchProducts()">Retry</button>
                </div>
            `;
        }
    };
    
    // Function to extract unique categories
    const extractCategories = () => {
        // Get all unique categories from products
        categories = ['all', ...new Set(allProducts.map(product => product.category))];
        
        // Filter out null, undefined or empty categories
        categories = categories.filter(category => category && category !== '');
        
        // Update category UI
        const categoryList = document.querySelector('.category-list');
        if (categoryList) {
            let categoryHtml = '';
            
            categories.forEach(category => {
                const activeClass = category === currentCategory ? 'active' : '';
                categoryHtml += `
                    <div class="category-item ${activeClass}" data-category="${category}">
                        <span>${category === 'all' ? 'All Items' : category}</span>
                    </div>
                `;
            });
            
            categoryList.innerHTML = categoryHtml;
            
            // Add event listeners to category items
            document.querySelectorAll('.category-item').forEach(item => {
                item.addEventListener('click', function() {
                    const category = this.getAttribute('data-category');
                    currentCategory = category;
                    
                    // Remove active class from all categories
                    document.querySelectorAll('.category-item').forEach(cat => {
                        cat.classList.remove('active');
                    });
                    
                    // Add active class to clicked category
                    this.classList.add('active');
                    
                    // Update display
                    filterAndDisplayProducts();
                });
            });
        }
    };
    
    // Function to filter products by category and search term
    const filterAndDisplayProducts = () => {
        // Filter products by category
        let filteredProducts = allProducts;
        
        if (currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                product.category === currentCategory
            );
        }
        
        // Filter by search term if it exists
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(term) || 
                (product.description && product.description.toLowerCase().includes(term)) ||
                (product.category && product.category.toLowerCase().includes(term))
            );
        }
        
        // Display filtered products
        displayProducts(filteredProducts);
    };
    
    // Function to search products
    const searchProducts = (term) => {
        searchTerm = term;
        filterAndDisplayProducts();
    };
    
    // Function to display products with proper image paths and number formatting
    function displayProducts(products, category = 'all') {
        const productGrid = document.getElementById('productGrid');
        
        // Apply category and search filters
        let filteredProducts = products;
        if (category !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.category === category);
        }
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(term) || 
                (product.description && product.description.toLowerCase().includes(term)) ||
                (product.category && product.category.toLowerCase().includes(term))
            );
        }
        
        // Clear the grid
        productGrid.innerHTML = '';
        
        if (filteredProducts.length === 0) {
            productGrid.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-search"></i>
                    <p>No items found. ${category === 'all' && !searchTerm ? 'Items added by admin will appear here.' : 'Try a different category or search term.'}</p>
                </div>
            `;
            return;
        }
        
        let productsHTML = '';
        
        filteredProducts.forEach(product => {
            const stockStatus = product.stock > 10 ? 'normal' : (product.stock > 0 ? 'low' : 'out-of-stock');
            const stockText = product.stock > 0 ? `${product.stock.toLocaleString()} in stock` : 'Out of stock';
            
            // Debug the image path
            console.log(`Product ${product.name} image path:`, product.image);
            
            // Fix image handling with consistent URL construction
            let imageHtml = '';
            if (product.image && product.image !== 'null' && product.image !== 'undefined') {
                console.log(`Product ${product.name} image path:`, product.image);
                
                // Build correct image URL based on environment
                let imagePath = '';
                
                // For working with Live Server which serves from /public
                if (window.location.href.includes(':5500') || window.location.href.includes('localhost')) {
                    imagePath = window.location.origin + '/public' + product.image;
                } else {
                    // For production deployment
                    imagePath = product.image;
                }
                
                imageHtml = `
                    <div class="item-image">
                        <img src="${imagePath}" alt="${product.name}" class="item-image-content" 
                             onerror="this.onerror=null; this.src='${window.location.origin}/public/assets/images/no-image.png'; console.log('Using fallback image for ${product.name}');" />
                    </div>
                `;
            } else {
                // Default placeholder for items without images
                imageHtml = `
                    <div class="item-image">
                        <div class="item-image-placeholder">
                            <i class="fas fa-motorcycle"></i>
                            <span>No image</span>
                        </div>
                    </div>
                `;
            }
            
            // Create product card HTML with formatted prices
            productsHTML += `
                <div class="item-card" data-id="${product.id}" style="cursor: pointer;">
                    ${imageHtml}
                    <div class="item-details">
                        <h3 class="item-name">${product.name}</h3>
                        <p class="item-category">${product.category || 'Uncategorized'}</p>
                        <p class="item-price">₱${product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        <p class="item-stock ${stockStatus}-stock">${stockText}</p>
                    </div>
                </div>
            `;
        });
        
        productGrid.innerHTML = productsHTML;
        
        // Add event listeners to the product cards
        addProductEventListeners();
    };
    
    // Function to add event listeners to product buttons
    const addProductEventListeners = () => {
        // Make entire card clickable for adding to cart or viewing details
        document.querySelectorAll('.item-card').forEach(card => {
            card.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const product = allProducts.find(p => p.id === productId);
                if (product && product.stock > 0) {
                    addToCart(productId);
                    
                    // Add animation to show item was added
                    this.classList.add('item-added-animation');
                    setTimeout(() => {
                        this.classList.remove('item-added-animation');
                    }, 500);
                } else if (product) {
                    // Enhanced out-of-stock alert with gradient styling and proper close functionality
                    Swal.fire({
                        title: '<div class="out-of-stock-title"><i class="fas fa-times-circle"></i> Out of Stock</div>',
                        html: `
                            <div class="out-of-stock-content">
                                <p>${product.name} is currently out of stock.</p>
                                <div class="item-status-info">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <span>This item is temporarily unavailable</span>
                                </div>
                            </div>
                        `,
                        icon: null,
                        confirmButtonColor: '#3498db',
                        background: '#141414',
                        color: '#f5f5f5',
                        showCloseButton: true,
                        allowOutsideClick: true,
                        customClass: {
                            popup: 'out-of-stock-popup',
                            title: 'out-of-stock-title',
                            htmlContainer: 'out-of-stock-content',
                            confirmButton: 'out-of-stock-button',
                            closeButton: 'out-of-stock-close-button'
                        },
                        buttonsStyling: true
                    });
                }
            });
            
            // Add context menu (right-click) for details
            card.addEventListener('contextmenu', function(e) {
                e.preventDefault(); // Prevent default browser context menu
                const productId = parseInt(this.getAttribute('data-id'));
                showProductDetails(productId);
            });
        });
    };
    
    // Function to add product to cart (ensure it uses cartItems)
    const addToCart = (productId) => {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;

        // Check if product is already in cart
        const existingItem = cartItems.find(item => item.id === productId);

        if (existingItem) {
            // Increment quantity if it won't exceed stock
            if (existingItem.quantity < product.stock) {
                existingItem.quantity += 1;
            } else {
                Swal.fire({
                    title: '<div class="stock-limit-title"><i class="fas fa-exclamation-triangle"></i> Stock Limit Reached</div>',
                    html: `
                        <div class="stock-limit-content">
                            <p>You've reached the maximum available stock for this item.</p>
                            <div class="item-stock-info">
                                <div class="item-name">${product.name}</div>
                                <div class="stock-quantity">Available: ${product.stock} units</div>
                            </div>
                        </div>
                    `,
                    icon: null,
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5',
                    customClass: {
                        popup: 'stock-limit-popup',
                        title: 'stock-limit-title',
                        htmlContainer: 'stock-limit-content',
                        confirmButton: 'stock-limit-button'
                    }
                });
                return;
            }
        } else {
            // Add new item to cart
            cartItems.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                stock: product.stock // Store stock for quantity checks
            });
        }

        // Save to localStorage (optional but good practice)
        localStorage.setItem('cartItems', JSON.stringify(cartItems));

        // Update cart display
        updateCart();
    };

    // Function to update cart display with proper number formatting
    const updateCart = () => {
        const cartContainer = document.getElementById('cartItems');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const emptyCartMessage = document.getElementById('emptyCart'); // Get reference to empty cart message

        // Load from localStorage if cartItems is empty (e.g., on page load)
        if (cartItems.length === 0) {
            const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
            if (storedCart.length > 0) {
                cartItems = storedCart;
            }
        }

        if (cartItems.length === 0) {
            if (cartContainer) {
                // Clear container and show empty cart message
                cartContainer.innerHTML = `
                    <div class="empty-cart" id="emptyCart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                        <p>Add products to start billing</p>
                    </div>
                `;
            }
            checkoutBtn.disabled = true;
            
            // Reset total to zero with comma formatting
            const totalAmount = document.getElementById('totalAmount');
            if (totalAmount) {
                totalAmount.textContent = '0.00';
            }
            
            // Reset cart count badge
            const cartCountElement = document.getElementById('cartCount');
            if (cartCountElement) {
                cartCountElement.textContent = '0';
                cartCountElement.style.display = 'none';
            }
        } else {
            if (emptyCartMessage) emptyCartMessage.style.display = 'none'; // Hide empty message
            let cartHTML = '';
            let subtotal = 0;

            cartItems.forEach(item => {
                // Use the createCartItemHTML from posdesign.js if available
                if (window.createCartItemHTML) {
                    cartHTML += window.createCartItemHTML(item);
                } else {
                    // Fallback basic HTML (should not be needed if posdesign.js loads first)
                    cartHTML += `<div>${item.name} - ${item.quantity} x ₱${item.price.toFixed(2)}</div>`;
                }
                subtotal += item.price * item.quantity;
            });

            if (cartContainer) {
                cartContainer.innerHTML = cartHTML;
                // Re-attach event listeners after updating innerHTML
                addCartActionListeners();
            }

            // Enable checkout button
            checkoutBtn.disabled = false;

            // Calculate totals
            const tax = subtotal * 0.0012; // Changed from 0.5 to 0.0012 (0.12%);
            const total = subtotal + tax;

            // Update only the total amount in the cart summary with comma formatting
            document.getElementById('totalAmount').textContent = total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

            // Update cart counter badge
            const totalItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);
            const cartCountElement = document.getElementById('cartCount');
            if (cartCountElement) {
                cartCountElement.textContent = totalItemsCount;
                cartCountElement.style.display = totalItemsCount > 0 ? 'inline-block' : 'none'; // Or 'flex' depending on styling
            }
        }
    };

    // Function to remove item from cart (ensure it uses cartItems)
    const removeFromCart = (productId) => {
        const itemIndex = cartItems.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            cartItems.splice(itemIndex, 1);
            localStorage.setItem('cartItems', JSON.stringify(cartItems)); // Update localStorage
            updateCart(); // Update display
        }
    };

    // Function to update quantity (ensure it uses cartItems)
    const updateCartItemQuantity = (productId, change) => {
        const itemIndex = cartItems.findIndex(item => item.id === parseInt(productId));

        if (itemIndex !== -1) {
            const product = allProducts.find(p => p.id === cartItems[itemIndex].id) || cartItems[itemIndex]; // Use stored stock if available
            const newQuantity = cartItems[itemIndex].quantity + change;

            if (newQuantity <= 0) {
                // Remove item if quantity is 0 or less
                removeFromCart(productId);
            } else if (newQuantity > product.stock) {
                // Prevent exceeding stock with improved modal
                Swal.fire({
                    title: '<div class="stock-limit-title"><i class="fas fa-exclamation-triangle"></i> Stock Limit Reached</div>',
                    html: `
                        <div class="stock-limit-content">
                            <p>You've reached the maximum available stock for this item.</p>
                            <div class="item-stock-info">
                                <div class="item-name">${cartItems[itemIndex].name}</div>
                                <div class="stock-quantity">Available: ${product.stock} units</div>
                            </div>
                        </div>
                    `,
                    icon: null,
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5',
                    showCloseButton: true,
                    allowOutsideClick: true,
                    customClass: {
                        popup: 'stock-limit-popup',
                        title: 'stock-limit-title',
                        htmlContainer: 'stock-limit-content',
                        confirmButton: 'stock-limit-button',
                        closeButton: 'stock-limit-close-button'
                    },
                    buttonsStyling: true
                });
            } else {
                // Update quantity
                cartItems[itemIndex].quantity = newQuantity;
                localStorage.setItem('cartItems', JSON.stringify(cartItems)); // Update localStorage
                updateCart(); // Update display
            }
        }
    };

    // Function to add event listeners to cart buttons (quantity/delete)
    const addCartActionListeners = () => {
        document.querySelectorAll('.cart-item .plus-btn').forEach(button => {
            // Remove existing listener before adding new one to prevent duplicates
            button.replaceWith(button.cloneNode(true));
        });
        document.querySelectorAll('.cart-item .minus-btn').forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });
        document.querySelectorAll('.cart-item .cart-item-delete').forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });

        // Add new listeners
        document.querySelectorAll('.cart-item .plus-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                updateCartItemQuantity(itemId, 1);
            });
        });

        document.querySelectorAll('.cart-item .minus-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                updateCartItemQuantity(itemId, -1);
            });
        });

        document.querySelectorAll('.cart-item .cart-item-delete').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                removeFromCart(parseInt(itemId));
            });
        });
    };

    // Function to show product details with formatted numbers
    const showProductDetails = (productId) => {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        
        const modalContent = document.querySelector('.item-details-content');
        const stockStatus = product.stock > 10 ? 'normal' : (product.stock > 0 ? 'low' : 'out-of-stock');
        const stockText = product.stock > 0 ? `${product.stock.toLocaleString()} in stock` : 'Out of stock';
        const disabledStatus = product.stock <= 0 ? 'disabled' : '';
        
        modalContent.innerHTML = `
            <div class="item-details-image">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.name}" class="detail-image">` : 
                    `<div class="item-placeholder-large">
                        <i class="fas fa-motorcycle" style="font-size: 48px;"></i>
                        <p>No image available</p>
                    </div>`
                }
                ${product.stock <= 0 ? 
                    `<div class="out-of-stock-overlay">
                        <div class="out-of-stock-badge">
                            <i class="fas fa-times-circle"></i>
                            <span>OUT OF STOCK</span>
                        </div>
                    </div>` : 
                    ''
                }
            </div>
            <h2>${product.name}</h2>
            <div class="item-details-info">
                <div class="item-details-row">
                    <span class="item-details-label">Category:</span>
                    <span class="item-details-value">${product.category}</span>
                </div>
                <div class="item-details-row">
                    <span class="item-details-label">Price:</span>
                    <span class="item-price-large">₱${product.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div class="item-details-row">
                    <span class="item-details-label">Stock:</span>
                    <span class="item-details-value ${stockStatus}-stock">${stockText}</span>
                </div>
                <div class="item-details-row">
                    <span class="item-details-label">Description:</span>
                    <span class="item-details-value">${product.description || 'No description available.'}</span>
                </div>
            </div>
            ${product.stock <= 0 ?
                `<button class="btn-out-of-stock" disabled>
                    <i class="fas fa-exclamation-circle"></i> Out of Stock
                </button>` :
                `<button class="btn-add-to-cart-large" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>`
            }
        `;
        
        // Open the modal
        const modal = document.getElementById('itemDetailsModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Add event listener to the add to cart button
        const addButton = modalContent.querySelector('.btn-add-to-cart-large');
        if (!addButton.disabled) {
            addButton.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                addToCart(productId);
                
                // Add animation
                this.classList.add('item-added-animation');
                setTimeout(() => {
                    this.classList.remove('item-added-animation');
                }, 500);
            });
        }
    };
    
    // Function to update checkout modal with formatted numbers
    const updateCheckoutModal = () => {
        const checkoutItems = document.getElementById('checkoutItems');
        let checkoutHTML = '';
        let subtotal = 0;
        
        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            checkoutHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>₱${item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td>${item.quantity.toLocaleString()}</td>
                    <td>₱${itemTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
            `;
        });
        
        checkoutItems.innerHTML = checkoutHTML;
        
        // Update summary values with formatted numbers
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;
        
        document.getElementById('checkout-subtotal').textContent = subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        document.getElementById('checkout-tax').textContent = tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        document.getElementById('amountDue').textContent = total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        
        // Reset discount-related elements - hide them
        document.getElementById('discount-row').style.display = 'none';
        document.getElementById('checkout-discount').textContent = '0.00';

        // Reset payment fields - create a new input element to avoid any lingering issues
        const amountTenderedContainer = document.querySelector('.currency-input-wrapper');
        if (amountTenderedContainer) {
            const oldInput = document.getElementById('amountTendered');
            const newInput = document.createElement('input');
            
            // Copy all attributes from the old input
            newInput.type = "number";
            newInput.id = "amountTendered";
            newInput.className = "currency-input";
            newInput.placeholder = "0.00";
            newInput.step = "0.01";
            newInput.min = "0";
            
            // Replace the old input with the new one
            if (oldInput && oldInput.parentNode) {
                oldInput.parentNode.replaceChild(newInput, oldInput);
            }
            
            // Add event listener to the new input element
            newInput.addEventListener('input', calculateChange);
        }
        
        document.getElementById('change').value = '₱0.00';
        document.getElementById('confirmPaymentBtn').disabled = true;

        // Reset payment method to cash (default)
        const cashRadio = document.querySelector('input[name="payment"][value="cash"]');
        if (cashRadio) {
            cashRadio.checked = true;
        }
        
        // Show cash payment fields
        const cashPaymentFields = document.getElementById('cashPaymentFields');
        if (cashPaymentFields) {
            cashPaymentFields.style.display = 'flex';
        }
        
        // Reset button state
        const confirmBtn = document.getElementById('confirmPaymentBtn');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Payment';
        }
    };
    
    // Function to handle checkout
    const handleCheckout = () => {
        // Update checkout modal with current cart items
        updateCheckoutModal();
        
        // Show checkout modal
        const modal = document.getElementById('checkoutModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus on the amount tendered input after a short delay to ensure the modal is visible
        setTimeout(() => {
            const amountTenderedInput = document.getElementById('amountTendered');
            if (amountTenderedInput) {
                amountTenderedInput.value = '';  // Ensure it's clear
                amountTenderedInput.focus();
            }
        }, 300);
    };
    
    // Function to complete transaction
    const completeTransaction = async () => {
        try {
            // Disable confirm button to prevent double submission
            const confirmBtn = document.getElementById('confirmPaymentBtn');
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Get transaction details
            const subtotal = parseFloat(document.getElementById('checkout-subtotal').textContent.replace(/,/g, ''));
            const tax = parseFloat(document.getElementById('checkout-tax').textContent.replace(/,/g, ''));
            const discountAmount = parseFloat(document.getElementById('checkout-discount').textContent.replace(/,/g, '') || '0');
            const total = parseFloat(document.getElementById('amountDue').textContent.replace(/,/g, ''));
            const amountTendered = parseFloat(document.getElementById('amountTendered').value);
            const change = amountTendered - total;
            
            // Get payment method details
            const paymentMethodSelect = document.getElementById('paymentMethodSelect');
            let paymentMethod = document.querySelector('input[name="payment"]:checked').value;
            
            // Get e-payment type if applicable
            if (paymentMethod === 'epayment') {
                const epaymentTypeSelect = document.getElementById('epaymentTypeSelect');
                if (epaymentTypeSelect) {
                    paymentMethod = epaymentTypeSelect.value;
                }
            }
            
            // Create a deep copy of cartItems to ensure data integrity
            const itemsForTransaction = cartItems.map(item => ({
                item_id: item.id,
                name: item.name, // Add name for receipt
                quantity: item.quantity,
                price: item.price
            }));
            
            // Keep a copy of cart items for receipt printing before clearing the cart
            const cartItemsForReceipt = JSON.parse(JSON.stringify(cartItems));
            
            // Build transaction object
            const transaction = {
                user_id: localStorage.getItem('userId'),
                total_amount: total,
                payment_method: paymentMethod,
                items: itemsForTransaction
            };
            
            console.log('Sending transaction to server:', transaction);
            
            // Send transaction to server
            const response = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(transaction)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Transaction failed');
            }
            
            const responseData = await response.json();
            console.log('Transaction response:', responseData);
            
            // Add item information to response data for receipt
            responseData.items = itemsForTransaction;
            
            const transactionId = responseData.transaction_id || 'N/A';
            const transactionDate = new Date().toLocaleString();
            
            // Get customer-facing receipt name based on payment method 
            const paymentMethodNames = {
                'cash': 'Cash',
                'card': 'Card',
                'gcash': 'GCash',
                'paymaya': 'PayMaya',
                'ewallet': 'E-Wallet',
                'banktransfer': 'Bank Transfer'
            };
            
            const paymentMethodName = paymentMethodNames[paymentMethod] || 'Other';
            
            // Close checkout modal first to avoid UI issues
            const modal = document.getElementById('checkoutModal');
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
            
            // Reset the button state even if we're going to show a success modal
            // This prevents the button from staying in processing state if something interrupts the flow
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Payment';
            
            // Format items for receipt
            const itemList = cartItemsForReceipt.map(item => {
                return `
                    <tr>
                        <td>${item.name}</td>
                        <td class="text-right">${item.quantity.toLocaleString()}</td>
                        <td class="text-right">₱${item.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td class="text-right">₱${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    </tr>
                `;
            }).join('');
            
            // Create custom transaction complete modal with improved UI
            Swal.fire({
                title: '<div class="transaction-success-title"><i class="fas fa-check-circle success-icon pulse"></i>Transaction Complete!</div>',
                html: `
                    <div class="transaction-success-container">
                        <div class="transaction-receipt-card">
                            <div class="transaction-header">
                                <div class="transaction-id">Transaction #${transactionId}</div>
                                <div class="transaction-date">${transactionDate}</div>
                            </div>
                            
                            <div class="transaction-payment-info">
                                <div class="payment-method">
                                    <i class="${getPaymentIcon(paymentMethod)}"></i>
                                    <span>${paymentMethodName}</span>
                                </div>
                                
                                <div class="transaction-amount">
                                    <div class="amount-label">Total Paid</div>
                                    <div class="amount-value">₱${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                </div>
                                
                                ${paymentMethod === 'cash' ? `
                                    <div class="payment-details">
                                        <div class="payment-detail">
                                            <span>Amount Tendered:</span>
                                            <span>₱${amountTendered.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                        </div>
                                        <div class="payment-detail">
                                            <span>Change:</span>
                                            <span>₱${change.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="transaction-items">
                                <div class="items-header">Items Purchased</div>
                                <div class="items-table-container">
                                    <table class="items-table">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th class="text-right">Qty</th>
                                                <th class="text-right">Price</th>
                                                <th class="text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${itemList}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <div class="receipt-actions">
                            <button class="btn-print-receipt">
                                <i class="fas fa-print"></i> Print Receipt
                            </button>
                        </div>
                    </div>
                `,
                showConfirmButton: true,
                confirmButtonText: 'Done',
                confirmButtonColor: '#3498db',
                background: '#141414',
                width: '500px',
                padding: '1rem',
                customClass: {
                    popup: 'transaction-success-popup',
                    title: 'transaction-success-title-container',
                    confirmButton: 'transaction-confirm-button',
                    htmlContainer: 'transaction-success-html-container'
                },
                showClass: {
                    popup: 'animate__animated animate__fadeInUp animate__faster'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutDown animate__faster'
                },
                didOpen: () => {
                    // Add event listener for print receipt button
                    document.querySelector('.btn-print-receipt').addEventListener('click', function() {
                        // Use the saved copy of cart items for receipt printing
                        printReceipt(responseData, cartItemsForReceipt, total, amountTendered, change, paymentMethodName);
                    });
                }
            });
            
            // Clear cart - make sure to reset the array AND localStorage
            cartItems = [];
            localStorage.removeItem('cartItems');
            
            // Reset UI elements
            updateCart();
            
            // Refresh product list to update stock
            fetchProducts();
            
        } catch (error) {
            console.error('Error completing transaction:', error);
            
            // Show error message
            Swal.fire({
                title: 'Error',
                text: error.message || 'Failed to complete transaction. Please try again.',
                icon: 'error',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
            
            // Reset button
            const confirmBtn = document.getElementById('confirmPaymentBtn');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Payment';
        }
    };
    
    // Helper function to get payment icon based on payment method
    function getPaymentIcon(paymentMethod) {
        const iconMap = {
            'cash': 'fas fa-money-bill-wave',
            'card': 'fas fa-credit-card',
            'gcash': 'fas fa-mobile-alt',
            'paymaya': 'fas fa-wallet',
            'ewallet': 'fas fa-mobile-alt',
            'banktransfer': 'fas fa-university'
        };
        
        return iconMap[paymentMethod] || 'fas fa-dollar-sign';
    }
    
    // Function to print receipt
    function printReceipt(transaction, items, total, amountTendered, change, paymentMethodName) {
        const receiptDate = new Date().toLocaleString();
        const receiptNumber = generateReceiptNumber();
        
        // If items array is empty or undefined, try to extract it from the transaction data
        if (!items || items.length === 0) {
            console.log('No items provided to printReceipt, attempting to extract from transaction data');
            console.log('Transaction data:', transaction);
            
            if (transaction && transaction.items && Array.isArray(transaction.items)) {
                items = transaction.items;
                console.log('Using items from transaction data:', items);
            } else {
                console.error('No items available for receipt');
                items = [];
            }
        }
        
        // Calculate subtotal directly from items to ensure accuracy
        const subtotal = items.reduce((sum, item) => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            const itemTotal = price * quantity;
            console.log(`Item: ${item.name}, Price: ${price}, Qty: ${quantity}, Total: ${itemTotal}`);
            return sum + itemTotal;
        }, 0);
        
        console.log('Calculated subtotal:', subtotal);
        
        // Calculate tax
        const tax = subtotal * TAX_RATE;
        console.log('Calculated tax:', tax);
        
        // Calculate total if not provided
        if (!total || total === 0) {
            total = subtotal + tax;
        }
        console.log('Final total:', total);
        
        // Format items for receipt
        const receiptItems = items.map(item => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            const itemTotal = price * quantity;
            
            return `
                <tr>
                    <td style="text-align: left; padding: 3px 5px;">${item.name || 'Unknown Item'}</td>
                    <td style="text-align: center; padding: 3px 5px;">${quantity}</td>
                    <td style="text-align: right; padding: 3px 5px;">₱${price.toFixed(2)}</td>
                    <td style="text-align: right; padding: 3px 5px;">₱${itemTotal.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt #${receiptNumber}</title>
                    <style>
                        body {
                            font-family: 'Courier New', monospace;
                            font-size: 12px;
                            margin: 0;
                            padding: 20px;
                            color: #000;
                            max-width: 300px;
                            margin: 0 auto;
                        }
                        .receipt-header {
                            text-align: center;
                            margin-bottom: 10px;
                            padding-bottom: 10px;
                            border-bottom: 1px dashed #000;
                        }
                        .receipt-header h1 {
                            font-size: 18px;
                            margin: 0;
                        }
                        .receipt-header p {
                            margin: 4px 0;
                            font-size: 12px;
                        }
                        .transaction-info {
                            margin-bottom: 10px;
                            font-size: 12px;
                        }
                        .transaction-info p {
                            margin: 3px 0;
                        }
                        .receipt-items {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 10px 0;
                            font-size: 11px;
                        }
                        .receipt-items th {
                            text-align: left;
                            padding: 3px 5px;
                            border-bottom: 1px solid #000;
                            font-weight: bold;
                        }
                        .receipt-items td {
                            padding: 3px 5px;
                        }
                        .receipt-totals {
                            margin-top: 10px;
                            text-align: right;
                            font-size: 12px;
                            border-top: 1px dashed #000;
                            padding-top: 10px;
                        }
                        .receipt-totals .row {
                            display: flex;
                            justify-content: space-between;
                            margin: 3px 0;
                        }
                        .receipt-total {
                            font-weight: bold;
                            font-size: 13px;
                            margin: 5px 0;
                        }
                        .payment-info {
                            margin-top: 10px;
                            text-align: left;
                            font-size: 12px;
                        }
                        .payment-info .row {
                            display: flex;
                            justify-content: space-between;
                            margin: 3px 0;
                        }
                        .receipt-footer {
                            text-align: center;
                            margin-top: 15px;
                            border-top: 1px dashed #000;
                            padding-top: 10px;
                            font-size: 11px;
                        }
                        @media print {
                            body {
                                width: 80mm; /* Standard thermal receipt width */
                                margin: 0;
                                padding: 5px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-header">
                        <h1>MotorTech</h1>
                        <p>Parts & Accessories Shop</p>
                        <p>123 Main Street, Taguig City</p>
                        <p>Tel: (02) 8123-4567</p>
                        <p>VAT Reg #: 123-456-789-000</p>
                    </div>
                    
                    <div class="transaction-info">
                        <p><strong>Receipt #:</strong> ${receiptNumber}</p>
                        <p><strong>Date:</strong> ${receiptDate}</p>
                        <p><strong>Transaction ID:</strong> ${transaction.transaction_id || "N/A"}</p>
                        <p><strong>Cashier:</strong> ${localStorage.getItem('userName') || 'Staff'}</p>
                    </div>
                    
                    <table class="receipt-items">
                        <thead>
                            <tr>
                                <th style="text-align: left; width: 40%;">Item</th>
                                <th style="text-align: center; width: 15%;">Qty</th>
                                <th style="text-align: right; width: 20%;">Price</th>
                                <th style="text-align: right; width: 25%;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${receiptItems}
                        </tbody>
                    </table>
                    
                    <div class="receipt-totals">
                        <div class="row">
                            <span>Subtotal:</span>
                            <span>₱${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="row">
                            <span>VAT (${(TAX_RATE * 100).toFixed(0)}%):</span>
                            <span>₱${tax.toFixed(2)}</span>
                        </div>
                        <div class="row receipt-total">
                            <span>TOTAL:</span>
                            <span>₱${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="payment-info">
                        <p><strong>Payment Method:</strong> ${paymentMethodName}</p>
                        ${paymentMethodName === 'Cash' ? `
                            <div class="row">
                                <span>Amount Tendered:</span>
                                <span>₱${amountTendered.toFixed(2)}</span>
                            </div>
                            <div class="row">
                                <span>Change:</span>
                                <span>₱${change.toFixed(2)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="receipt-footer">
                        <p>Thank you for shopping at MotorTech Motorsport!</p>
                        <p>This serves as your official receipt.</p>
                        <p>Come back again!</p>
                    </div>
                </body>
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
    }
    
    // Function to show transaction history
    const showTransactionHistory = async () => {
        try {
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = `
                <div class="loading-items">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading transaction history...</p>
                </div>
            `;
            
            // Show history modal
            const historyModal = document.getElementById('historyModal');
            historyModal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Fetch transaction history from server
            const userId = localStorage.getItem('userId');
            const response = await fetch(`${API_URL}/transactions/user/${userId}?timestamp=${Date.now()}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch transaction history');
            }
            
            const transactions = await response.json();
            
            if (transactions.length === 0) {
                historyList.innerHTML = `
                    <div class="no-history">
                        <i class="fas fa-info-circle"></i>
                        <p>No transaction history found.</p>
                    </div>
                `;
                return;
            }
            
            // Build history HTML
            let historyHTML = '';
            
            transactions.forEach(transaction => {
                const date = new Date(transaction.transaction_date);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                historyHTML += `
                    <div class="history-item" data-id="${transaction.transaction_id}">
                        <div class="history-header">
                            <div>
                                <span class="transaction-id">#${transaction.transaction_id}</span>
                                <span class="transaction-date">${formattedDate}</span>
                            </div>
                            <div class="transaction-amount">₱${parseFloat(transaction.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        </div>
                        <button class="btn-view-transaction" data-id="${transaction.transaction_id}">
                            View Details
                        </button>
                    </div>
                `;
            });
            
            historyList.innerHTML = historyHTML;
            
            // Add event listeners to view buttons
            document.querySelectorAll('.btn-view-transaction').forEach(button => {
                button.addEventListener('click', function() {
                    const transactionId = this.getAttribute('data-id');
                    viewTransactionDetails(transactionId);
                });
            });
            
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = `
                <div class="error-history">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load transaction history. Please try again.</p>
                    <button class="btn-retry" onclick="showTransactionHistory()">Retry</button>
                </div>
            `;
        }
    };
    
    // Function to view transaction details with formatted numbers
    const viewTransactionDetails = async (transactionId) => {
        try {
            // Fetch transaction details from server
            const response = await fetch(`${API_URL}/transactions/${transactionId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch transaction details');
            }
            
            const transaction = await response.json();
            
            // Format date
            const date = new Date(transaction.transaction_date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Show transaction details in a SweetAlert with formatted numbers
            Swal.fire({
                title: `Transaction #${transaction.transaction_id}`,
                html: `
                <div class="transaction-details">
                    <div class="transaction-details-header">
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        <p><strong>Cashier:</strong> ${transaction.cashier_name}</p>
                    </div>
                    
                    <table class="transaction-items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transaction.items.map(item => `
                                <tr>
                                    <td>${item.item_name}</td>
                                    <td>₱${parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                    <td>${item.quantity.toLocaleString()}</td>
                                    <td>₱${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="transaction-details-summary">
                        <div class="summary-row">
                            <span>Total:</span>
                            <span>₱${transaction.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                    </div>
                </div>
            `,
                showCloseButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Print Receipt',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5',
                width: '600px',
                customClass: {
                    container: 'transaction-modal-container'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // In a real app, this would print the receipt
                    Swal.fire({
                        title: 'Printing Receipt',
                        text: 'The receipt is being printed...',
                        icon: 'info',
                        timer: 1500,
                        showConfirmButton: false,
                        background: '#141414',
                        color: '#f5f5f5'
                    });
                }
            });
            
        } catch (error) {
            console.error('Error fetching transaction details:', error);
            
            Swal.fire({
                title: 'Error',
                text: 'Failed to load transaction details. Please try again.',
                icon: 'error',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
        }
    };
    
    // Function to calculate change with formatted numbers
    const calculateChange = () => {
        const amountDue = parseFloat(document.getElementById('amountDue').textContent.replace(/,/g, ''));
        const amountTendered = parseFloat(document.getElementById('amountTendered').value) || 0;
        
        // Only calculate change if tendered amount is sufficient
        const change = amountTendered >= amountDue ? (amountTendered - amountDue) : 0;
        const changeElement = document.getElementById('change');
        
        changeElement.value = `₱${change.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        // Add highlight animation when change value updates
        changeElement.classList.remove('highlight-change');
        void changeElement.offsetWidth; // Trigger reflow to restart animation
        changeElement.classList.add('highlight-change');
        
        // Enable/disable confirm button based on whether enough money was tendered
        const confirmBtn = document.getElementById('confirmPaymentBtn');
        confirmBtn.disabled = amountTendered < amountDue;
    };
    
    // Function to handle logout with enhanced modal
    const handleLogout = () => {
        Swal.fire({
            title: '<div class="logout-title"><i class="fas fa-sign-out-alt"></i> Logout Confirmation</div>',
            html: `
                <div class="logout-content">
                    <p>Are you sure you want to log out from the system?</p>
                    <div class="logout-user-info">
                        <i class="fas fa-user-circle"></i>
                        <span>${localStorage.getItem('userName') || 'User'}</span>
                    </div>
                </div>
            `,
            icon: null,
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-sign-out-alt"></i> Yes, Logout',
            cancelButtonText: '<i class="fas fa-times"></i> Cancel',
            confirmButtonColor: '#3498db',
            cancelButtonColor: '#2c3e50',
            background: '#141414',
            color: '#f5f5f5',
            width: '400px', // Fixed width for logout modal
            customClass: {
                container: 'fixed-size-modal',
                title: 'logout-modal-title',
                htmlContainer: 'logout-modal-content',
                confirmButton: 'logout-confirm-button',
                cancelButton: 'logout-cancel-button',
                popup: 'logout-modal-popup'
            },
            buttonsStyling: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Show a brief loading state
                Swal.fire({
                    title: 'Logging Out',
                    html: '<i class="fas fa-circle-notch fa-spin"></i>',
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    timer: 800,
                    background: '#141414',
                    color: '#f5f5f5',
                    didOpen: () => {
                        // Clear all authentication data
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userName');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userId');
                    }
                }).then(() => {
                    // Redirect to login page
                    window.location.href = 'login.html';
                });
            }
        });
    };

    // Set up the page when DOM is loaded
    const setupPage = async () => {
        // Set current date/time
        const currentDateTimeDisplay = document.getElementById('currentDateTime');
        if (currentDateTimeDisplay) {
            const updateDateTime = () => {
                const now = new Date();
                currentDateTimeDisplay.textContent = now.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            };
            
            updateDateTime();
            setInterval(updateDateTime, 60000); // Update every minute
        }
        
        // Setup logout button
        const logoutBtn = document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
        
        // Setup search input
        const searchInput = document.getElementById('searchItems');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                searchProducts(this.value);
            });
        }
        
        // Setup cart UI
        const checkoutSection = document.querySelector('.checkout');
        if (checkoutSection) {
            checkoutSection.innerHTML = `
                <h2>Shopping Cart</h2>
                <div class="cart-items" id="cartItems">
                    <div class="empty-cart" id="emptyCart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                        <p>Add products to start billing</p>
                    </div>
                </div>
                
                <div class="cart-summary">
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>₱<span id="totalAmount">0.00</span></span>
                    </div>
                </div>
                
                <button class="btn-checkout" id="checkoutBtn" disabled>Checkout</button>
                <button class="btn-history" id="historyBtn" onclick="window.TransactionHistory?.showTransactionHistory()">Transaction History</button>
            `;
        }
        
        // Setup checkout modal
        const checkoutModal = document.getElementById('checkoutModal');
        if (checkoutModal) {
            checkoutModal.querySelector('.modal-content').innerHTML = `
                <span class="close" id="closeCheckout">&times;</span>
                <h2>Complete Transaction</h2>
                
                <table class="checkout-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody id="checkoutItems">
                        <!-- Checkout items will be inserted here by JavaScript -->
                    </tbody>
                </table>
                
                <!-- Discount Options -->
                <div class="discount-options">
                    <h3>Apply Discount</h3>
                    <div class="discount-types">
                        <label class="discount-option">
                            <input type="checkbox" name="discountType" value="senior" id="seniorDiscount">
                            <span class="checkbox-custom"></span>
                            <span>Senior Citizen (5%)</span>
                        </label>
                        <label class="discount-option">
                            <input type="checkbox" name="discountType" value="pwd" id="pwdDiscount">
                            <span class="checkbox-custom"></span>
                            <span>PWD (2%)</span>
                        </label>
                        <label class="discount-option">
                            <input type="checkbox" name="discountType" value="loyalty" id="loyaltyDiscount">
                            <span class="checkbox-custom"></span>
                            <span>Loyalty (3%)</span>
                        </label>
                    </div>
                    
                    <div id="discountIdContainer" class="discount-id-container" style="display: none;">
                        <label for="discountIdNumber">ID Number:</label>
                        <input type="text" id="discountIdNumber" placeholder="Enter ID number">
                    </div>
                </div>
                
                <!-- Payment Summary -->
                <div class="payment-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>₱<span id="checkout-subtotal">0.00</span></span>
                    </div>
                    <div class="summary-row">
                        <span>Tax (12%):</span>
                        <span>₱<span id="checkout-tax">0.00</span></span>
                    </div>
                    <div class="summary-row" id="discount-row" style="display: none;">
                        <span>Discount:</span>
                        <span>₱<span id="checkout-discount">0.00</span></span>
                    </div>
                    <div class="summary-row total-final">
                        <span>Total Due:</span>
                        <span>₱<span id="amountDue">0.00</span></span>
                    </div>
                </div>
                
                <!-- Payment Method Selection -->
                <h3>Payment Method</h3>
                <div class="payment-options">
                    <label>
                        <input type="radio" name="payment" value="cash" checked>
                        <i class="fas fa-money-bill-wave"></i>
                        <span>Cash</span>
                    </label>
                    <label>
                        <input type="radio" name="payment" value="ewallet">
                        <i class="fas fa-mobile-alt"></i>
                        <span>E-Wallet</span>
                    </label>
                    <label>
                        <input type="radio" name="payment" value="card">
                        <i class="fas fa-credit-card"></i>
                        <span>Card</span>
                    </label>
                    <label>
                        <input type="radio" name="payment" value="banktransfer">
                        <i class="fas fa-university"></i>
                        <span>Bank Transfer</span>
                    </label>
                </div>
                
                <!-- Cash Payment Fields (only shown for cash payment) -->
                <div id="cashPaymentFields" class="payment-input">
                    <div class="cash-payment-header">
                        <div class="cash-payment-title">
                            <i class="fas fa-money-bill-wave"></i> Cash Payment
                        </div>
                    </div>
                    <div class="cash-payment-subtitle">
                        Enter the amount received from customer
                    </div>
                    
                    <div class="form-group">
                        <label for="amountTendered">
                            <i class="fas fa-hand-holding-usd"></i> Amount Tendered:
                        </label>
                        <div class="currency-input-wrapper">
                            <input type="number" id="amountTendered" class="currency-input" placeholder="0.00" step="0.01" min="0">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="change">
                            <i class="fas fa-coins"></i> Change:
                        </label>
                        <input type="text" id="change" value="₱0.00" readonly>
                    </div>
                </div>
                
                <button class="btn-confirm-payment" id="confirmPaymentBtn" disabled>Complete Payment</button>
            `;
            
            // Add event listener for amount tendered input
            const amountTenderedInput = document.getElementById('amountTendered');
            if (amountTenderedInput) {
                // Remove any existing listeners first to prevent duplicates
                const newAmountTenderedInput = amountTenderedInput.cloneNode(true);
                amountTenderedInput.parentNode.replaceChild(newAmountTenderedInput, amountTenderedInput);
                
                // Add the new event listener
                newAmountTenderedInput.addEventListener('input', calculateChange);
                
                // Add focus event to help with mobile devices
                newAmountTenderedInput.addEventListener('focus', function() {
                    // On some mobile devices, this helps ensure the keyboard appears
                    this.blur();
                    this.focus();
                });
            }
            
            // Add event listener for confirm payment button
            const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
            if (confirmPaymentBtn) {
                // Remove any existing listeners first to prevent duplicates
                const newConfirmPaymentBtn = confirmPaymentBtn.cloneNode(true);
                confirmPaymentBtn.parentNode.replaceChild(newConfirmPaymentBtn, confirmPaymentBtn);
                
                // Add the new event listener
                newConfirmPaymentBtn.addEventListener('click', completeTransaction);
            }
        }
        
        // Setup history modal
        const historyModal = document.getElementById('historyModal');
        if (historyModal) {
            historyModal.querySelector('.modal-content').innerHTML = `
                <span class="close" id="closeHistory">&times;</span>
                <h2>Transaction History</h2>
                <div class="history-list" id="historyList">
                    <!-- Transaction history will be inserted here by JavaScript -->
                    <div class="loading-items">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading transaction history...</p>
                    </div>
                </div>
            `;
        }
        
        // Setup item details modal
        const itemDetailsModal = document.getElementById('itemDetailsModal');
        if (itemDetailsModal) {
            itemDetailsModal.querySelector('.modal-content').innerHTML = `
                <span class="close" id="closeItemDetails">&times;</span>
                <div class="item-details-content">
                    <!-- Item details will be populated dynamically -->
                </div>
            `;
        }
        
        // Fetch and display products
        await fetchProducts();
        
        // Add event listeners to buttons
        
        // Close buttons for modals
        document.querySelectorAll('.close').forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('show');
                    document.body.style.overflow = 'auto';
                }
            });
        });
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', handleCheckout);
        }
        
        // History button
        const historyBtn = document.getElementById('historyBtn');
        if (historyBtn) {
            historyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('History button clicked from pos.js handler');
                if (window.TransactionHistory && window.TransactionHistory.showTransactionHistory) {
                    window.TransactionHistory.showTransactionHistory();
                } else {
                    console.error('TransactionHistory module not loaded');
                    // Try to load and initialize it on the fly
                    const script = document.createElement('script');
                    script.src = 'js/transactionHistory.js';
                    script.onload = function() {
                        if (window.TransactionHistory) {
                            window.TransactionHistory.init();
                            window.TransactionHistory.showTransactionHistory();
                        }
                    };
                    document.body.appendChild(script);
                }
            });
        }

        // Payment method radio buttons - improve handling to focus the input field
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            // Remove existing listeners to prevent duplicates
            const newRadio = radio.cloneNode(true);
            radio.parentNode.replaceChild(newRadio, radio);
            
            // Add new listener with improved functionality
            newRadio.addEventListener('change', function() {
                const cashPaymentFields = document.getElementById('cashPaymentFields');
                const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
                const amountTenderedInput = document.getElementById('amountTendered');
                
                if (this.value === 'cash') {
                    // Show cash payment fields
                    cashPaymentFields.style.display = 'flex';
                    
                    // Disable confirm button until valid amount is entered
                    confirmPaymentBtn.disabled = true;
                    
                    // Check if there's already a valid amount
                    const amountTendered = parseFloat(amountTenderedInput.value) || 0;
                    const amountDue = parseFloat(document.getElementById('amountDue').textContent.replace(/,/g, ''));
                    
                    // Enable button if amount is valid
                    confirmPaymentBtn.disabled = amountTendered < amountDue;
                    
                    // Focus the input field after a short delay to ensure UI is updated
                    setTimeout(() => {
                        if (amountTenderedInput) {
                            amountTenderedInput.focus();
                        }
                    }, 100);
                } else {
                    // Hide cash payment fields for non-cash methods
                    cashPaymentFields.style.display = 'none';
                    
                    // Enable button immediately (since payment is exact)
                    confirmPaymentBtn.disabled = false;
                }
            });
        });
    };
    
    // Initialize the page
    setupPage();
    
    // Payment method switching
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            // Hide all payment details
            document.getElementById('cashDetails').classList.remove('active');
            document.getElementById('cardDetails').classList.remove('active');
            document.getElementById('ewalletDetails').classList.remove('active');
            
            // Show the selected payment details
            document.getElementById(`${this.value}Details`).classList.add('active');
        });
    });
    
    // Handle cash amount input for change calculation
    document.getElementById('cashAmount').addEventListener('input', function() {
        const cashAmount = parseFloat(this.value) || 0;
        const totalAmount = parseFloat(document.getElementById('modalTotal').textContent.replace('₱', '')) || 0;
        
        let change = cashAmount - totalAmount;
        change = change > 0 ? change : 0;
        
        document.getElementById('changeAmount').value = `₱${change.toFixed(2)}`;
        
        // Enable/disable complete payment button based on sufficient cash
        const completePaymentBtn = document.getElementById('completePaymentBtn');
        if (cashAmount >= totalAmount) {
            completePaymentBtn.disabled = false;
        } else {
            completePaymentBtn.disabled = true;
        }
    });
    
    // Format the cart item template for the new design
    function formatCartItem(item) {
        return `
            <div class="cart-item" data-id="${item.id}">
                <button class="cart-item-delete" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
                <div class="cart-item-header">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₱${parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div class="cart-item-footer">
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <div class="quantity-value">${item.quantity.toLocaleString()}</div>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="cart-item-subtotal">₱${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
            </div>
        `;
    }
    
    // Update the complete payment function to handle different payment methods
    function completePayment() {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const printReceipt = document.getElementById('printReceipt').checked;
        const emailReceipt = document.getElementById('emailReceipt').checked;
        
        let paymentDetails = {};
        
        // Collect payment details based on payment method
        if (paymentMethod === 'cash') {
            const cashAmount = parseFloat(document.getElementById('cashAmount').value) || 0;
            const changeAmount = parseFloat(document.getElementById('changeAmount').value.replace('₱', '').replace(/,/g, '')) || 0;
            
            paymentDetails = {
                method: 'cash',
                cashAmount,
                changeAmount
            };
        } else if (paymentMethod === 'card') {
            paymentDetails = {
                method: 'card',
                cardNumber: document.getElementById('cardNumber')?.value || '',
                cardName: document.getElementById('cardName')?.value || '',
                cardExpiry: document.getElementById('cardExpiry')?.value || ''
            };
        } else if (paymentMethod === 'ewallet') {
            paymentDetails = {
                method: 'ewallet',
                ewalletNumber: document.getElementById('ewalletNumber')?.value || '',
                referenceNumber: document.getElementById('ewalletReference')?.value || ''
            };
        } else if (paymentMethod === 'banktransfer') {
            paymentDetails = {
                method: 'banktransfer',
                bankAccount: document.getElementById('bankAccount')?.value || '',
                referenceNumber: document.getElementById('bankReference')?.value || ''
            };
        }
        
        // Add receipt options
        paymentDetails.printReceipt = printReceipt;
        paymentDetails.emailReceipt = emailReceipt;
        
        // Use the correct cart data
        // Important fix - use cartItems (global array) instead of cart
        // First, try to use the cartItems global array if it exists and has items
        if (window.cartItems && window.cartItems.length > 0) {
            paymentDetails.items = [...window.cartItems]; // Make a copy to avoid reference issues
        } 
        // If cartItems isn't available, fall back to the cart array
        else if (cart && cart.length > 0) {
            paymentDetails.items = [...cart]; // Make a copy to avoid reference issues
        }
        // If both are empty, check localStorage
        else {
            const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
            paymentDetails.items = storedCart;
        }
        
        console.log("Items for receipt:", paymentDetails.items);
        
        // Calculate receipt totals from items to ensure consistency
        if (paymentDetails.items && paymentDetails.items.length > 0) {
            paymentDetails.subtotal = paymentDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            paymentDetails.tax = paymentDetails.subtotal * 0.12;
            paymentDetails.total = paymentDetails.subtotal + paymentDetails.tax;
        } else {
            console.error("No items found for receipt");
            // Fallback to values from the UI if available
            paymentDetails.subtotal = parseFloat(document.getElementById('subtotalAmount')?.textContent?.replace('₱', '')?.replace(/,/g, '') || '0');
            paymentDetails.tax = parseFloat(document.getElementById('checkout-tax')?.textContent?.replace(/,/g, '') || '0');
            paymentDetails.total = parseFloat(document.getElementById('totalAmount')?.textContent?.replace('₱', '')?.replace(/,/g, '') || '0');
        }
        
        // Generate and print receipt if needed
        if (printReceipt) {
            generateAndPrintReceipt(paymentDetails);
        }
    }
    
    // Generate and print receipt function with proper item handling
    function generateAndPrintReceipt(paymentDetails) {
        // Create the receipt window
        const receiptWindow = window.open('', '_blank', 'width=400,height=600');
        
        // Debug logging to verify we have items
        console.log("Receipt generation - Items:", paymentDetails.items);
        console.log("Receipt generation - Subtotal:", paymentDetails.subtotal);
        
        // Ensure we have items
        if (!paymentDetails.items || paymentDetails.items.length === 0) {
            console.error("No items available for receipt");
            paymentDetails.items = [];
        }

        // Format items for receipt
        const itemsHTML = paymentDetails.items.map(item => {
            const itemTotal = (item.price * item.quantity);
            return `
                <tr>
                    <td style="text-align: left; padding: 3px 5px;">${item.name}</td>
                    <td style="text-align: center; padding: 3px 5px;">${item.quantity}</td>
                    <td style="text-align: right; padding: 3px 5px;">₱${parseFloat(item.price).toFixed(2)}</td>
                    <td style="text-align: right; padding: 3px 5px;">₱${itemTotal.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
        
        // Calculate totals
        const subtotal = paymentDetails.subtotal || 0;
        const tax = paymentDetails.tax || 0;
        const total = paymentDetails.total || 0;
        
        // Get payment method display name
        const paymentMethodNames = {
            'cash': 'Cash',
            'card': 'Card',
            'ewallet': 'E-Wallet',
            'gcash': 'GCash',
            'paymaya': 'PayMaya',
            'banktransfer': 'Bank Transfer'
        };
        const paymentMethodName = paymentMethodNames[paymentDetails.method] || paymentDetails.method;
        
        // Generate receipt HTML
        receiptWindow.document.write(`
            <html>
                <head>
                    <title>Receipt</title>
                    <style>
                        body {
                            font-family: 'Courier New', monospace;
                            font-size: 12px;
                            margin: 0;
                            padding: 20px;
                            color: #000;
                            max-width: 350px;
                            margin: 0 auto;
                        }
                        .receipt-header {
                            text-align: center;
                            margin-bottom: 10px;
                            padding-bottom: 10px;
                            border-bottom: 1px dashed #000;
                        }
                        .receipt-header h1 {
                            font-size: 18px;
                            margin: 0;
                        }
                        .receipt-header p {
                            margin: 4px 0;
                            font-size: 12px;
                        }
                        .transaction-info {
                            margin-bottom: 10px;
                            font-size: 12px;
                        }
                        .transaction-info p {
                            margin: 3px 0;
                        }
                        .receipt-items {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 10px 0;
                            font-size: 11px;
                        }
                        .receipt-items th {
                            text-align: left;
                            padding: 3px 5px;
                            border-bottom: 1px solid #000;
                            font-weight: bold;
                        }
                        .receipt-items td {
                            padding: 3px 5px;
                        }
                        .receipt-totals {
                            margin-top: 10px;
                            text-align: right;
                            font-size: 12px;
                            border-top: 1px dashed #000;
                            padding-top: 10px;
                        }
                        .receipt-totals .row {
                            display: flex;
                            justify-content: space-between;
                            margin: 3px 0;
                        }
                        .receipt-total {
                            font-weight: bold;
                            font-size: 13px;
                            margin: 5px 0;
                        }
                        .payment-info {
                            margin-top: 10px;
                            text-align: left;
                            font-size: 12px;
                        }
                        .payment-info .row {
                            display: flex;
                            justify-content: space-between;
                            margin: 3px 0;
                        }
                        .receipt-footer {
                            text-align: center;
                            margin-top: 15px;
                            border-top: 1px dashed #000;
                            padding-top: 10px;
                            font-size: 11px;
                        }
                        @media print {
                            body {
                                width: 80mm; /* Standard thermal receipt width */
                                margin: 0;
                                padding: 5px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-header">
                        <h1>MotorTech Motorsport</h1>
                        <p>Parts & Accessories Shop</p>
                        <p>123 Main Street, Taguig City</p>
                        <p>Tel: (02) 8123-4567</p>
                        <p>VAT Reg #: 123-456-789-000</p>
                    </div>
                    
                    <div class="transaction-info">
                        <p><strong>Receipt #:</strong> ${generateReceiptNumber()}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>Cashier:</strong> ${localStorage.getItem('userName') || 'Staff'}</p>
                    </div>
                    
                    <table class="receipt-items">
                        <thead>
                            <tr>
                                <th style="text-align: left; width: 40%;">Item</th>
                                <th style="text-align: center; width: 15%;">Qty</th>
                                <th style="text-align: right; width: 20%;">Price</th>
                                <th style="text-align: right; width: 25%;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                    
                    <div class="receipt-totals">
                        <div class="row">
                            <span>Subtotal:</span>
                            <span>₱${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="row">
                            <span>VAT (12%):</span>
                            <span>₱${tax.toFixed(2)}</span>
                        </div>
                        <div class="row receipt-total">
                            <span>TOTAL:</span>
                            <span>₱${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="payment-info">
                        <p><strong>Payment Method:</strong> ${paymentMethodName}</p>
                        ${paymentDetails.method === 'cash' ? `
                            <div class="row">
                                <span>Amount Tendered:</span>
                                <span>₱${paymentDetails.cashAmount.toFixed(2)}</span>
                            </div>
                            <div class="row">
                                <span>Change:</span>
                                <span>₱${paymentDetails.changeAmount.toFixed(2)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="receipt-footer">
                        <p>Thank you for shopping at MotorTech Motorsport!</p>
                        <p>Items purchased cannot be returned.</p>
                        <p>This serves as your official receipt.</p>
                        <p>Come back again!</p>
                    </div>
                </body>
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </html>
        `);
        receiptWindow.document.close();
        receiptWindow.focus();
    }
    
    // Generate a receipt number
    function generateReceiptNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        return `RT${year}${month}${day}-${random}`;
    }
});

// Cart functionality with real-time price updates
let cart = [];
const TAX_RATE = 0.12; // 12% tax rate (corrected from 0.0012)

// Function to add item to cart with real-time price updates
function addToCart(itemId, itemName, itemPrice) {
    // Check if item already in cart
    const existingItemIndex = cart.findIndex(item => item.id === itemId);
    
    if (existingItemIndex !== -1) {
        // Item already in cart, increment quantity
        cart[existingItemIndex].quantity++;
        
        // Update the UI for this specific item
        updateCartItemUI(cart[existingItemIndex]);
    } else {
        // Add new item to cart
        const newItem = {
            id: itemId,
            name: itemName,
            price: itemPrice,
            quantity: 1
        };
        cart.push(newItem);
        
        // Add new item to UI
        addCartItemToUI(newItem);
    }
    
    // Update cart count and totals
    updateCartTotals();
    
    // Animate the item card
    animateItemAddedToCart(itemId);
}

// Function to update the UI for a specific cart item
function updateCartItemUI(item) {
    const cartItemElement = document.querySelector(`.cart-item[data-id="${item.id}"]`);
    if (cartItemElement) {
        // Update quantity display
        const quantityElement = cartItemElement.querySelector('.quantity-value');
        if (quantityElement) {
            quantityElement.textContent = item.quantity.toLocaleString();
        }
        
        // Update subtotal if it exists in the UI
        const subtotalElement = cartItemElement.querySelector('.cart-item-subtotal');
        if (subtotalElement) {
            subtotalElement.textContent = `₱${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
    }
}

// Function to add a new cart item to the UI with formatted numbers
function addCartItemToUI(item) {
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.querySelector('.empty-cart');
    
    // Hide empty cart message
    if (emptyCart) {
        emptyCart.style.display = 'none';
    }
    
    // Create new cart item element with POS-style layout
    const cartItemElement = document.createElement('div');
    cartItemElement.className = 'cart-item';
    cartItemElement.dataset.id = item.id;
    
    // Calculate subtotal for this item with formatted numbers
    const subtotal = (item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    // New layout based on standard POS design with formatted numbers
    cartItemElement.innerHTML = `
        <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">₱${parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
        <div class="cart-item-controls">
            <div class="quantity-control">
                <button class="quantity-btn minus-btn" onclick="updateQuantity(${item.id}, -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="text" class="quantity-value" value="${item.quantity.toLocaleString()}" readonly>
                <button class="quantity-btn plus-btn" onclick="updateQuantity(${item.id}, 1)">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="cart-item-subtotal">₱${subtotal}</div>
            <button class="cart-item-delete" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `;
    
    cartItems.appendChild(cartItemElement);
    
    // Update checkout button state
    document.getElementById('checkoutBtn').disabled = false;
}

// Function to update the UI for a specific cart item with formatted numbers
function updateCartItemUI(item) {
    const cartItemElement = document.querySelector(`.cart-item[data-id="${item.id}"]`);
    if (cartItemElement) {
        // Update quantity display
        const quantityInput = cartItemElement.querySelector('.quantity-value');
        if (quantityInput) {
            quantityInput.value = item.quantity.toLocaleString();
        }
        
        // Update subtotal display with formatted numbers
        const subtotalElement = cartItemElement.querySelector('.cart-item-subtotal');
        if (subtotalElement) {
            subtotalElement.textContent = `₱${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
    }
}

// Function to update item quantity
function updateQuantity(itemId, change) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    // Update quantity
    cart[itemIndex].quantity += change;
    
    // Remove item if quantity becomes 0
    if (cart[itemIndex].quantity <= 0) {
        removeFromCart(itemId);
        return;
    }
    
    // Update UI
    updateCartItemUI(cart[itemIndex]);
    
    // Update totals
    updateCartTotals();
}

// Function to remove item from cart
function removeFromCart(itemId) {
    // Find and remove the item from the cart array
    cart = cart.filter(item => item.id !== itemId);
    
    // Remove the item from the UI with animation
    const cartItemElement = document.querySelector(`.cart-item[data-id="${itemId}"]`);
    if (cartItemElement) {
        cartItemElement.classList.add('removing');
        
        // Animation before removal
        setTimeout(() => {
            cartItemElement.remove();
            
            // Show empty cart message if cart is empty
            if (cart.length === 0) {
                const cartItems = document.getElementById('cartItems');
                
                // Create the empty cart message directly
                cartItems.innerHTML = `
                    <div class="empty-cart" id="emptyCart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                        <p>Add products to start billing</p>
                    </div>
                `;
                
                // Disable checkout button
                const checkoutBtn = document.getElementById('checkoutBtn');
                if (checkoutBtn) {
                    checkoutBtn.disabled = true;
                }
                
                // Reset total to zero immediately when cart is empty
                const totalAmount = document.getElementById('totalAmount');
                if (totalAmount) {
                    totalAmount.textContent = '0.00';
                }
            }
        }, 300);
    }
    
    // Update cart totals immediately
    if (cart.length === 0) {
        // If cart is empty, explicitly set all totals to zero
        resetCartTotals();
    } else {
        // If there are still items, calculate the new totals
        updateCartTotals();
    }
}

// New function to explicitly reset cart totals to zero with formatted numbers
function resetCartTotals() {
    // Reset total in cart summary
    const totalAmount = document.getElementById('totalAmount');
    if (totalAmount) {
        totalAmount.textContent = '0.00';
    }
    
    // Reset cart count badge
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = '0';
        cartCountElement.style.display = 'none';
    }
    
    // Also reset checkout modal totals if they exist
    const modalSubtotal = document.getElementById('modalSubtotal');
    const modalTax = document.getElementById('modalTax');
    const modalTotal = document.getElementById('modalTotal');
    
    if (modalSubtotal) modalSubtotal.textContent = '0.00';
    if (modalTax) modalTax.textContent = '0.00';
    if (modalTotal) modalTotal.textContent = '0.00';
}

// Update the existing updateCartTotals function to format numbers with commas
function updateCartTotals() {
    // If cart is empty, reset totals to zero and exit
    if (cart.length === 0) {
        resetCartTotals();
        return;
    }
    
    // Original logic for calculating totals when cart has items
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const total = calculateTotal();
    
    // Update cart counter
    const totalItems = cart.reduce((count, item) => count + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Update the total amount in the cart summary with formatted numbers
    const totalAmount = document.getElementById('totalAmount');
    if (totalAmount) {
        totalAmount.textContent = total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
    
    // Also update checkout modal totals if it exists and is open with formatted numbers
    const modalSubtotal = document.getElementById('modalSubtotal');
    const modalTax = document.getElementById('modalTax'); 
    const modalTotal = document.getElementById('modalTotal');
    
    if (modalSubtotal) modalSubtotal.textContent = subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    if (modalTax) modalTax.textContent = tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    if (modalTotal) modalTotal.textContent = total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// Animation for adding item to cart
function animateItemAddedToCart(itemId) {
    const itemCard = document.querySelector(`.item-card[data-id="${itemId}"]`);
    if (itemCard) {
        itemCard.classList.add('item-added-animation');
        setTimeout(() => {
            itemCard.classList.remove('item-added-animation');
        }, 500);
    }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    // Clear any existing cart data
    cart = [];
    
    // Initialize cart UI with empty cart message
    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        cartItems.innerHTML = `
            <div class="empty-cart" id="emptyCart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <p>Add products to start billing</p>
            </div>
        `;
    }
    
    // Initialize totals to zero
    resetCartTotals();
    
    // Set checkout button to disabled initially
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
    }
    
    // Add animation class for removing items
    const style = document.createElement('style');
    style.textContent = `
        @keyframes removeItem {
            0% { opacity: 1; transform: translateX(0); }
            100% { opacity: 0; transform: translateX(40px); }
        }
        .cart-item.removing {
            animation: removeItem 0.3s ease forwards;
        }
    `;
    document.head.appendChild(style);
});

// Function to view item details in a modal
function openItemDetailsModal(itemId) {
    // Get modal references
    const modal = document.getElementById('itemDetailsModal');
    const modalItemName = document.getElementById('modalItemName');
    const modalItemCategory = document.getElementById('modalItemCategory');
    const modalItemPrice = document.getElementById('modalItemPrice');
    const modalItemDescription = document.getElementById('modalItemDescription');
    const modalItemStock = document.getElementById('modalItemStock');
    const modalItemId = document.getElementById('modalItemId');
    const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
    const modalImage = document.getElementById('modalItemImage');
    const modalPlaceholder = document.getElementById('itemPlaceholderLarge');
    const notAvailableOverlay = document.getElementById('notAvailableOverlay');
    
    // Show loading state
    modalItemName.textContent = 'Loading...';
    modalItemCategory.textContent = '';
    modalItemPrice.textContent = '';
    modalItemDescription.textContent = 'Loading item details...';
    modalItemStock.textContent = 'Checking...';
    modalImage.style.display = 'none';
    modalPlaceholder.style.display = 'flex';
    notAvailableOverlay.style.display = 'none';
    
    // Open the modal immediately to show loading state
    modal.classList.add('show');
    
    // Fetch item details
    fetch(`http://localhost:5000/api/inventory/${itemId}`)
        .then(response => response.json())
        .then(item => {
            console.log('Item details:', item);
            
            // Populate modal with item details and formatted numbers
            modalItemName.textContent = item.item_name || 'Unknown Item';
            modalItemCategory.textContent = item.category || 'Uncategorized';
            modalItemPrice.textContent = `₱${parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            modalItemDescription.textContent = item.description || 'No description available for this product.';
            modalItemId.textContent = item.item_id || '-';
            
            // Handle stock status display with formatted numbers
            const stockQty = parseInt(item.stock_quantity);
            if (stockQty <= 0) {
                modalItemStock.textContent = 'Out of Stock';
                modalItemStock.className = 'meta-value out-of-stock';
                modalAddToCartBtn.disabled = true;
                notAvailableOverlay.style.display = 'flex';
            } else if (stockQty < 10) {
                modalItemStock.textContent = `Low Stock (${stockQty.toLocaleString()})`;
                modalItemStock.className = 'meta-value low-stock';
                modalAddToCartBtn.disabled = false;
            } else {
                modalItemStock.textContent = `In Stock (${stockQty.toLocaleString()})`;
                modalItemStock.className = 'meta-value stock';
                modalAddToCartBtn.disabled = false;
            }
            
            // Handle image display - using same logic as product cards
            if (item.image && item.image !== 'null' && item.image !== 'undefined') {
                // Construct proper image path based on environment
                let imagePath = '';
                if (window.location.href.includes(':5500') || window.location.href.includes('localhost')) {
                    imagePath = window.location.origin + '/public' + item.image;
                } else {
                    imagePath = item.image;
                }
                
                console.log('Setting modal image path:', imagePath);
                
                // Set image source and show it when loaded
                modalImage.src = imagePath;
                modalImage.onload = function() {
                    modalImage.style.display = 'block';
                    modalPlaceholder.style.display = 'none';
                };
                modalImage.onerror = function() {
                    console.error('Failed to load image:', imagePath);
                    modalImage.style.display = 'none';
                    modalPlaceholder.style.display = 'flex';
                };
            } else {
                // No image available
                modalImage.style.display = 'none';
                modalPlaceholder.style.display = 'flex';
            }
            
            // Set up Add to Cart button
            modalAddToCartBtn.onclick = function() {
                if (stockQty > 0) {
                    addToCart(item.item_id, item.item_name, item.price);
                    closeModal('itemDetailsModal');
                    
                    // Show success message
                    Swal.fire({
                        title: 'Added to Cart!',
                        text: `${item.item_name} has been added to your cart.`,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                        background: '#141414',
                        color: '#f5f5f5'
                    });
                }
            };
        })
        .catch(error => {
            console.error('Error fetching item details:', error);
            
            // Show error in modal
            modalItemName.textContent = 'Error Loading Item';
            modalItemDescription.textContent = 'There was an error loading this item. Please try again.';
            modalItemCategory.textContent = 'Error';
            modalItemPrice.textContent = '';
            modalItemStock.textContent = 'Unknown';
            modalItemStock.className = 'meta-value';
            modalImage.style.display = 'none';
            modalPlaceholder.style.display = 'flex';
            modalAddToCartBtn.disabled = true;
        });
}

// Function to close any modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when the X is clicked
    document.querySelectorAll('.modal .close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
        });
    });
    
    // Close modal when clicking outside the modal content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
    
    // Setup event delegation for View Details buttons
    document.addEventListener('click', function(e) {
        // Find if a View Details button or its child was clicked
        const button = e.target.closest('.btn-view-details');
        if (button) {
            const itemId = button.getAttribute('data-id');
            if (itemId) {
                openItemDetailsModal(itemId);
            }
        }
    });
});

// Function to create cart item HTML with formatted numbers
function createCartItemHTML(item) {
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
}
