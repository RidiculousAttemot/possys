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
            
            // In a real implementation, fetch from API endpoint
            // const response = await fetch('http://localhost:5000/api/products');
            // const data = await response.json();
            // allProducts = data;
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Simulate empty state for testing
            allProducts = [];
            
            // Display products or empty state
            displayProducts(allProducts);
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
    
    // Function to display products
    const displayProducts = (products) => {
        const productGrid = document.getElementById('productGrid');
        
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-search"></i>
                    <p>No items found. Items added by admin will appear here.</p>
                </div>
            `;
            return;
        }
        
        let productsHTML = '';
        
        products.forEach(product => {
            const stockStatus = product.stock > 10 ? 'normal' : (product.stock > 0 ? 'low' : 'out-of-stock');
            const stockText = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
            const disabledStatus = product.stock <= 0 ? 'disabled' : '';
            
            productsHTML += `
                <div class="item-card">
                    <div class="item-image">
                        <span class="item-category">${product.category}</span>
                        ${product.image ? 
                            `<img src="${product.image}" alt="${product.name}" class="item-image-content">` : 
                            `<div class="item-image-placeholder">
                                <i class="fas fa-motorcycle"></i>
                                <span>${product.category}</span>
                            </div>`
                        }
                    </div>
                    <div class="item-details">
                        <h3 class="item-name">${product.name}</h3>
                        <p class="item-price">₱${product.price.toFixed(2)}</p>
                        <p class="item-stock ${stockStatus}-stock">${stockText}</p>
                        <div class="item-actions">
                            <button class="btn-add-to-cart" data-id="${product.id}" ${disabledStatus}>
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="btn-view-details" data-id="${product.id}">
                                <i class="fas fa-search"></i> View Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        productGrid.innerHTML = productsHTML;
        
        // Add event listeners to the new buttons
        addProductEventListeners();
    };
    
    // Function to add event listeners to product buttons
    const addProductEventListeners = () => {
        // Add to cart buttons
        document.querySelectorAll('.btn-add-to-cart').forEach(button => {
            if (!button.disabled) {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    addToCart(productId);
                    
                    // Add animation to show item was added
                    this.classList.add('item-added-animation');
                    setTimeout(() => {
                        this.classList.remove('item-added-animation');
                    }, 500);
                });
            }
        });
        
        // View details buttons
        document.querySelectorAll('.btn-view-details').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                showProductDetails(productId);
            });
        });
    };
    
    // Function to add product to cart
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
                    title: 'Stock Limit Reached',
                    text: `You've reached the maximum available stock for ${product.name}.`,
                    icon: 'warning',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5'
                });
                return;
            }
        } else {
            // Add new item to cart
            cartItems.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        
        // Update cart display
        updateCart();
    };
    
    // Function to update cart display
    const updateCart = () => {
        const cartContainer = document.getElementById('cartItems');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (cartItems.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <p>Add products to start billing</p>
                </div>
            `;
            checkoutBtn.disabled = true;
        } else {
            let cartHTML = '';
            let subtotal = 0;
            
            cartItems.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                cartHTML += `
                    <div class="cart-item">
                        <div>
                            <div>${item.name}</div>
                            <div class="item-price">₱${item.price.toFixed(2)} × <span class="item-quantity">${item.quantity}</span></div>
                        </div>
                        <div>
                            <span>₱${itemTotal.toFixed(2)}</span>
                            <button class="btn-remove" data-id="${item.id}">×</button>
                        </div>
                    </div>
                `;
            });
            
            cartContainer.innerHTML = cartHTML;
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.btn-remove').forEach(button => {
                button.addEventListener('click', function() {
                    const itemId = parseInt(this.getAttribute('data-id'));
                    removeFromCart(itemId);
                });
            });
            
            // Enable checkout button
            checkoutBtn.disabled = false;
            
            // Update summary values
            const tax = subtotal * 0.12;
            const total = subtotal + tax;
            
            document.getElementById('subtotal').textContent = subtotal.toFixed(2);
            document.getElementById('tax').textContent = tax.toFixed(2);
            document.getElementById('total').textContent = total.toFixed(2);
        }
    };
    
    // Function to remove item from cart
    const removeFromCart = (productId) => {
        // Find the item in the cart
        const itemIndex = cartItems.findIndex(item => item.id === productId);
        
        if (itemIndex > -1) {
            // Remove the item from cart
            cartItems.splice(itemIndex, 1);
            
            // Update cart display
            updateCart();
        }
    };
    
    // Function to show product details
    const showProductDetails = (productId) => {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return;
        
        const modalContent = document.querySelector('.item-details-content');
        const stockStatus = product.stock > 10 ? 'normal' : (product.stock > 0 ? 'low' : 'out-of-stock');
        const stockText = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
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
            </div>
            <h2>${product.name}</h2>
            <div class="item-details-info">
                <div class="item-details-row">
                    <span class="item-details-label">Category:</span>
                    <span class="item-details-value">${product.category}</span>
                </div>
                <div class="item-details-row">
                    <span class="item-details-label">Price:</span>
                    <span class="item-price-large">₱${product.price.toFixed(2)}</span>
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
            <button class="btn-add-to-cart-large" data-id="${product.id}" ${disabledStatus}>
                <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
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
    
    // Function to update checkout modal
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
                    <td>₱${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>₱${itemTotal.toFixed(2)}</td>
                </tr>
            `;
        });
        
        checkoutItems.innerHTML = checkoutHTML;
        
        // Update summary values
        const tax = subtotal * 0.12;
        const total = subtotal + tax;
        
        document.getElementById('checkout-subtotal').textContent = subtotal.toFixed(2);
        document.getElementById('checkout-tax').textContent = tax.toFixed(2);
        document.getElementById('amountDue').textContent = total.toFixed(2);
        
        // Reset discount
        document.querySelectorAll('.discount-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.getElementById('discountIdContainer').style.display = 'none';
        document.getElementById('discount-row').style.display = 'none';
        document.getElementById('checkout-discount').textContent = '0.00';
        
        // Reset payment fields
        document.getElementById('amountTendered').value = '';
        document.getElementById('change').value = '₱0.00';
        document.getElementById('confirmPaymentBtn').disabled = true;
    };
    
    // Function to handle checkout
    const handleCheckout = () => {
        // Update checkout modal with current cart items
        updateCheckoutModal();
        
        // Show checkout modal
        const modal = document.getElementById('checkoutModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };
    
    // Function to complete transaction
    const completeTransaction = async () => {
        try {
            // Disable confirm button to prevent double submission
            const confirmBtn = document.getElementById('confirmPaymentBtn');
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            
            // Get transaction details
            const subtotal = parseFloat(document.getElementById('checkout-subtotal').textContent);
            const tax = parseFloat(document.getElementById('checkout-tax').textContent);
            const discountAmount = parseFloat(document.getElementById('checkout-discount').textContent || '0');
            const total = parseFloat(document.getElementById('amountDue').textContent);
            const amountTendered = parseFloat(document.getElementById('amountTendered').value);
            const change = amountTendered - total;
            
            // Get selected payment method
            const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
            
            // Get selected discount type
            let discountType = null;
            let discountId = null;
            document.querySelectorAll('.discount-option input[type="checkbox"]').forEach(checkbox => {
                if (checkbox.checked) {
                    discountType = checkbox.value;
                }
            });
            
            if (discountType) {
                discountId = document.getElementById('discountIdNumber').value;
            }
            
            // Create transaction object
            const transaction = {
                items: cartItems,
                subtotal,
                tax,
                discountType,
                discountId,
                discountAmount,
                total,
                paymentMethod,
                amountTendered,
                change,
                date: new Date().toISOString()
            };
            
            // In a real app, send to server
            // const response = await fetch('http://localhost:5000/api/transactions', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            //     },
            //     body: JSON.stringify(transaction)
            // });
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Show success message
            Swal.fire({
                title: 'Transaction Complete!',
                text: `Total: ₱${total.toFixed(2)}, Change: ₱${change.toFixed(2)}`,
                icon: 'success',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
            
            // Close modal
            const modal = document.getElementById('checkoutModal');
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
            
            // Clear cart
            cartItems = [];
            updateCart();
            
            // Refresh product list to update stock
            fetchProducts();
        } catch (error) {
            console.error('Error completing transaction:', error);
            
            // Show error message
            Swal.fire({
                title: 'Error',
                text: 'Failed to complete transaction. Please try again.',
                icon: 'error',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
            
            // Re-enable button
            const confirmBtn = document.getElementById('confirmPaymentBtn');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = 'Complete Payment';
        }
    };
    
    // Function to load transaction history
    const loadTransactionHistory = async () => {
        try {
            // Show loading state
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = `
                <div class="loading-items">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading transaction history...</p>
                </div>
            `;
            
            // In a real app, you would fetch from your API
            // const response = await fetch('http://localhost:5000/api/transactions', {
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            //     }
            // });
            // const transactions = await response.json();
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Simulate empty history
            const transactions = [];
            
            if (transactions.length === 0) {
                historyList.innerHTML = `
                    <div class="no-transactions">
                        <i class="fas fa-receipt"></i>
                        <p>No transactions found.</p>
                    </div>
                `;
                return;
            }
            
            let historyHTML = '';
            
            transactions.forEach(transaction => {
                const date = new Date(transaction.date);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                historyHTML += `
                    <div class="history-item">
                        <div class="transaction-info">
                            <div class="transaction-id">${transaction.id}</div>
                            <div class="transaction-date">${formattedDate}</div>
                            <div class="transaction-total">₱${transaction.total.toFixed(2)}</div>
                        </div>
                        <button class="btn-view-transaction" data-id="${transaction.id}">View Details</button>
                    </div>
                `;
            });
            
            historyList.innerHTML = historyHTML;
            
            // Add event listeners to view buttons
            document.querySelectorAll('.btn-view-transaction').forEach(button => {
                button.addEventListener('click', function() {
                    const transactionId = this.getAttribute('data-id');
                    const transaction = transactions.find(t => t.id === transactionId);
                    
                    if (transaction) {
                        viewTransactionDetails(transaction);
                    }
                });
            });
        } catch (error) {
            console.error('Error loading transaction history:', error);
            
            // Show error state
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = `
                <div class="error-items">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load transaction history. Please try again.</p>
                    <button class="btn-retry" onclick="loadTransactionHistory()">Retry</button>
                </div>
            `;
        }
    };
    
    // Function to view transaction details
    const viewTransactionDetails = (transaction) => {
        // Create a new modal for transaction details
        Swal.fire({
            title: `Transaction ${transaction.id}`,
            html: `
                <div class="transaction-details-modal">
                    <div class="transaction-details-info">
                        <p><strong>Date:</strong> ${new Date(transaction.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                    </div>
                    
                    <h3>Items</h3>
                    <table class="transaction-details-table">
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
                                    <td>${item.name}</td>
                                    <td>₱${item.price.toFixed(2)}</td>
                                    <td>${item.quantity}</td>
                                    <td>₱${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="transaction-details-summary">
                        <div class="summary-row">
                            <span>Total:</span>
                            <span>₱${transaction.total.toFixed(2)}</span>
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
    };
    
    // Filter products by category
    const filterByCategory = (category) => {
        const filtered = category === 'all' ? 
            allProducts : 
            allProducts.filter(product => product.category === category);
        
        displayProducts(filtered);
    };
    
    // Search products by name
    const searchProducts = (query) => {
        if (!query.trim()) {
            displayProducts(allProducts);
            return;
        }
        
        const searchTerm = query.toLowerCase();
        const filtered = allProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.category.toLowerCase().includes(searchTerm)
        );
        
        displayProducts(filtered);
    };
    
    // Setup categories dynamically
    const setupCategories = () => {
        const categoryList = document.querySelector('.category-list');
        if (categoryList) {
            // Add "All Items" category which should always be present
            categoryList.innerHTML = `
                <button class="category-item active" data-category="all">All Items</button>
            `;
            
            // In a real implementation, you would get unique categories from your products
            // const uniqueCategories = [...new Set(allProducts.map(product => product.category))];
            
            // For demo, add placeholder categories
            const placeholderCategories = [
                'Engine Parts', 'Brake Systems', 'Suspension', 
                'Oils & Lubricants', 'Electrical', 'Exhaust Systems', 
                'Accessories', 'Maintenance'
            ];
            
            placeholderCategories.forEach(category => {
                const categoryBtn = document.createElement('button');
                categoryBtn.className = 'category-item';
                categoryBtn.setAttribute('data-category', category);
                categoryBtn.textContent = category;
                categoryList.appendChild(categoryBtn);
            });
            
            // Add event listeners to category buttons
            document.querySelectorAll('.category-item').forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons
                    document.querySelectorAll('.category-item').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Filter products by category
                    const category = this.getAttribute('data-category');
                    filterByCategory(category);
                });
            });
        }
    };
    
    // Init function to set up event listeners and load initial data
    const init = async () => {
        // Setup categories
        setupCategories();
        
        // Setup search functionality
        const searchInput = document.getElementById('searchItems');
        if (searchInput) {
            // Add search placeholder to the UI
            const searchContainer = document.createElement('div');
            searchContainer.className = 'search-container';
            searchContainer.innerHTML = `
                <i class="fas fa-search"></i>
                <input type="text" id="searchItems" placeholder="Search items...">
            `;
            
            // Add search container to the items section title
            const itemsTitle = document.querySelector('.items h2');
            if (itemsTitle) {
                itemsTitle.innerHTML = 'Items';
                itemsTitle.appendChild(searchContainer);
            }
            
            // Add event listener for search input
            document.getElementById('searchItems').addEventListener('input', function() {
                searchProducts(this.value);
            });
        }
        
        // Setup cart UI
        const checkoutSection = document.querySelector('.checkout');
        if (checkoutSection) {
            checkoutSection.innerHTML = `
                <h2>Shopping Cart</h2>
                <div class="cart-items" id="cartItems">
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                        <p>Add products to start billing</p>
                    </div>
                </div>
                
                <div class="cart-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>₱<span id="subtotal">0.00</span></span>
                    </div>
                    <div class="summary-row">
                        <span>Tax (12%):</span>
                        <span>₱<span id="tax">0.00</span></span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span>₱<span id="total">0.00</span></span>
                    </div>
                </div>
                
                <button class="btn-checkout" id="checkoutBtn" disabled>Checkout</button>
                <button class="btn-history" id="historyBtn">Transaction History</button>
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
                
                <!-- Payment Method -->
                <div class="payment-options">
                    <label>
                        <input type="radio" name="payment" value="cash" checked>
                        <i class="fas fa-money-bill-wave"></i>
                        <span>Cash</span>
                    </label>
                    <label>
                        <input type="radio" name="payment" value="card">
                        <i class="fas fa-credit-card"></i>
                        <span>Card</span>
                    </label>
                    <label>
                        <input type="radio" name="payment" value="gcash">
                        <i class="fas fa-mobile-alt"></i>
                        <span>GCash</span>
                    </label>
                </div>
                
                <!-- Payment Input -->
                <div class="payment-input">
                    <div>
                        <label for="amountTendered">Amount Tendered:</label>
                        <input type="number" id="amountTendered" placeholder="Enter amount" step="0.01" min="0">
                    </div>
                    <div>
                        <label for="change">Change:</label>
                        <input type="text" id="change" value="₱0.00" readonly>
                    </div>
                </div>
                
                <button class="btn-confirm-payment" id="confirmPaymentBtn" disabled>Complete Payment</button>
            `;
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
        
        // Confirm payment button
        const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
        if (confirmPaymentBtn) {
            confirmPaymentBtn.addEventListener('click', completeTransaction);
        }
        
        // History button
        const historyBtn = document.getElementById('historyBtn');
        if (historyBtn) {
            historyBtn.addEventListener('click', function() {
                loadTransactionHistory();
                const modal = document.getElementById('historyModal');
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
        }
        
        // Amount tendered input
        const amountTenderedInput = document.getElementById('amountTendered');
        if (amountTenderedInput) {
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
        document.querySelectorAll('.discount-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                // Uncheck other checkboxes
                document.querySelectorAll('.discount-option input[type="checkbox"]').forEach(cb => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });
                
                // Show/hide ID input if a discount is selected
                const anyChecked = Array.from(document.querySelectorAll('.discount-option input[type="checkbox"]')).some(cb => cb.checked);
                document.getElementById('discountIdContainer').style.display = anyChecked ? 'block' : 'none';
                
                // Show/hide discount row in summary
                document.getElementById('discount-row').style.display = anyChecked ? 'flex' : 'none';
                
                // Calculate and apply discount
                if (anyChecked) {
                    const subtotal = parseFloat(document.getElementById('checkout-subtotal').textContent);
                    let discountPercent = 0;
                    
                    if (this.value === 'senior') discountPercent = 0.05;
                    else if (this.value === 'pwd') discountPercent = 0.02;
                    else if (this.value === 'loyalty') discountPercent = 0.03;
                    
                    const discountAmount = subtotal * discountPercent;
                    const tax = parseFloat(document.getElementById('checkout-tax').textContent);
                    const total = subtotal + tax - discountAmount;
                    
                    document.getElementById('checkout-discount').textContent = discountAmount.toFixed(2);
                    document.getElementById('amountDue').textContent = total.toFixed(2);
                } else {
                    const subtotal = parseFloat(document.getElementById('checkout-subtotal').textContent);
                    const tax = parseFloat(document.getElementById('checkout-tax').textContent);
                    const total = subtotal + tax;
                    
                    document.getElementById('checkout-discount').textContent = '0.00';
                    document.getElementById('amountDue').textContent = total.toFixed(2);
                }
                
                // Reset amount tendered
                document.getElementById('amountTendered').value = '';
                document.getElementById('change').value = '₱0.00';
                document.getElementById('confirmPaymentBtn').disabled = true;
            });
        });
        
        // Add modal close behavior when clicking outside modal content
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('show');
                    document.body.style.overflow = 'auto';
                }
            });
        });
    };
    
    // Initialize the app
    init();
});
