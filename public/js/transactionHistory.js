// Transaction History Module
const TransactionHistory = (() => {
    // API base URL
    const API_URL = 'http://localhost:5000/api';
    const TAX_RATE = 0.12; // 12% tax rate

    // Add CSS styles for the transaction history UI
    const addTransactionHistoryStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            /* Transaction History Modal */
            .transaction-history-popup {
                max-width: 900px !important;
                max-height: 80vh;
            }
            
            .transaction-history-container {
                max-height: 60vh;
                overflow-y: auto;
                padding: 0;
                border-radius: 10px;
                color: #f5f5f5;
            }
            
            .transaction-history-header {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 0.8fr;
                padding: 12px;
                background-color: #1c1c1c;
                border-bottom: 1px solid #333;
                position: sticky;
                top: 0;
                font-weight: bold;
                z-index: 10;
            }
            
            .transaction-header-item {
                padding: 5px;
                text-align: left;
                color: #3498db;
            }
            
            .transaction-history-list {
                overflow-y: auto;
            }
            
            .transaction-history-item {
                display: grid;
                grid-template-columns: 2fr 1fr 1fr 0.8fr;
                padding: 15px 12px;
                border-bottom: 1px solid #333;
                align-items: center;
                transition: background-color 0.2s;
            }
            
            .transaction-history-item:hover {
                background-color: #1a1a1a;
            }
            
            .transaction-date {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .transaction-date-value {
                font-weight: 500;
            }
            
            .transaction-payment-method {
                font-size: 12px;
                color: #999;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .transaction-id {
                font-family: monospace;
                color: #999;
            }
            
            .transaction-amount {
                font-weight: 600;
                color: #3498db;
            }
            
            .transaction-actions {
                text-align: right;
            }
            
            .btn-view-transaction {
                background-color: transparent;
                border: 1px solid #3498db;
                color: #3498db;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-view-transaction:hover {
                background-color: #3498db;
                color: white;
            }
            
            /* Empty State */
            .no-transactions {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                color: #999;
                text-align: center;
            }
            
            .no-transactions i {
                font-size: 48px;
                margin-bottom: 15px;
                color: #333;
            }
            
            /* Error State */
            .error-history {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                color: #e74c3c;
                text-align: center;
            }
            
            .error-history i {
                font-size: 48px;
                margin-bottom: 15px;
            }
            
            .btn-retry {
                background-color: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
                margin-top: 15px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-retry:hover {
                background-color: #2980b9;
                transform: translateY(-2px);
            }
            
            /* Loading State */
            .loading-history {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                color: #999;
                text-align: center;
            }
            
            .loading-history i {
                font-size: 36px;
                margin-bottom: 15px;
                color: #3498db;
            }
            
            /* Transaction Details Modal */
            .transaction-details-container {
                display: flex;
                flex-direction: column;
                gap: 20px;
                max-height: 70vh;
                overflow-y: auto;
                padding: 0;
            }
            
            .transaction-details-header {
                background-color: #1c1c1c;
                padding: 15px;
                border-radius: 8px;
            }
            
            .transaction-details-info {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .transaction-info-item {
                display: flex;
                flex-direction: column;
                flex: 1;
                min-width: 150px;
            }
            
            .info-label {
                color: #999;
                font-size: 12px;
            }
            
            .info-value {
                font-weight: 500;
                margin-top: 4px;
            }
            
            .transaction-details-content {
                background-color: #1c1c1c;
                padding: 15px;
                border-radius: 8px;
            }
            
            .transaction-items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
            }
            
            .transaction-items-table th, 
            .transaction-items-table td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #333;
            }
            
            .transaction-items-table th {
                color: #3498db;
                font-weight: normal;
                font-size: 13px;
            }
            
            .text-right {
                text-align: right;
            }
            
            .text-center {
                text-align: center;
            }
            
            .transaction-details-summary {
                display: flex;
                flex-direction: column;
                gap: 8px;
                padding-top: 15px;
                border-top: 1px solid #333;
                margin-top: 10px;
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                font-size: 14px;
            }
            
            .total-row {
                font-weight: bold;
                font-size: 16px;
                color: #3498db;
                padding-top: 5px;
                margin-top: 5px;
                border-top: 1px solid #333;
            }
            
            .transaction-details-actions {
                display: flex;
                justify-content: flex-end;
                padding: 10px 0;
            }
            
            .btn-print-transaction {
                background-color: #27ae60;
                border: none;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            
            .btn-print-transaction:hover {
                background-color: #2ecc71;
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    };

    // Helper function to get payment icon based on payment method
    const getPaymentIcon = (paymentMethod) => {
        const iconMap = {
            'cash': 'fas fa-money-bill-wave',
            'card': 'fas fa-credit-card',
            'gcash': 'fas fa-mobile-alt',
            'paymaya': 'fas fa-wallet',
            'ewallet': 'fas fa-mobile-alt',
            'banktransfer': 'fas fa-university'
        };
        
        return iconMap[paymentMethod] || 'fas fa-dollar-sign';
    };

    // Function to show transaction history
    const showTransactionHistory = async () => {
        console.log("TransactionHistory.showTransactionHistory called");
        
        // Check if SweetAlert is defined
        if (typeof Swal === 'undefined') {
            console.error("SweetAlert is not defined. Make sure to include SweetAlert2 library.");
            alert("Error loading transaction history. Check console for details.");
            return;
        }
        
        try {
            // Show loading state in SweetAlert
            Swal.fire({
                title: 'Loading Transaction History',
                html: '<div class="loading-history"><i class="fas fa-spinner fa-spin"></i><p>Loading your transaction history...</p></div>',
                showConfirmButton: false,
                allowOutsideClick: false,
                background: '#141414',
                color: '#f5f5f5',
                customClass: {
                    popup: 'transaction-history-popup'
                }
            });
            
            // Get user ID from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                console.error("User ID not found in localStorage");
                Swal.fire({
                    title: 'Error',
                    text: 'User information not found. Please log in again.',
                    icon: 'error',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5'
                });
                return;
            }
            
            // Fetch transaction history from server
            let response;
            let transactions;
            let endpoint;
            
            try {
                console.log(`Trying first endpoint: ${API_URL}/transactions/user/${userId}`);
                endpoint = `${API_URL}/transactions/user/${userId}?timestamp=${Date.now()}`;
                response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`First endpoint failed: ${response.status} ${response.statusText}`);
                }
                
                transactions = await response.json();
            } catch (firstEndpointError) {
                console.log("First endpoint failed, trying alternative endpoint");
                
                // If first endpoint fails, try /transactions endpoint
                try {
                    console.log(`Trying second endpoint: ${API_URL}/transactions`);
                    endpoint = `${API_URL}/transactions?timestamp=${Date.now()}`;
                    response = await fetch(endpoint, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Second endpoint failed: ${response.status} ${response.statusText}`);
                    }
                    
                    // Filter transactions by user ID if we get all transactions
                    const allTransactions = await response.json();
                    transactions = Array.isArray(allTransactions) ? 
                        allTransactions.filter(t => t.user_id == userId) : [];
                } catch (secondEndpointError) {
                    // If both fail, create dummy transactions for development/testing
                    console.error("Both endpoints failed, using dummy data:", secondEndpointError);
                    
                    // Show error with more helpful information about the API endpoints
                    throw new Error(`Failed to fetch transaction history: API endpoints not available.
                        Tried: 
                        1. ${API_URL}/transactions/user/${userId}
                        2. ${API_URL}/transactions
                        
                        Please ensure the API server is running and these endpoints are implemented.`);
                }
            }
            
            if (!transactions || transactions.length === 0) {
                Swal.fire({
                    title: 'No Transactions Found',
                    html: `
                        <div class="no-transactions">
                            <i class="fas fa-receipt"></i>
                            <p>You haven't made any transactions yet.</p>
                            <p>Completed transactions will appear here.</p>
                        </div>
                    `,
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5'
                });
                return;
            }
            
            // Sort transactions by date (newest first)
            transactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
            
            // Build transaction history HTML
            let historyHTML = `
                <div class="transaction-history-container">
                    <div class="transaction-history-header">
                        <div class="transaction-header-item">Date & Payment Method</div>
                        <div class="transaction-header-item">Transaction ID</div>
                        <div class="transaction-header-item">Amount</div>
                        <div class="transaction-header-item">Actions</div>
                    </div>
                    <div class="transaction-history-list">
            `;
            
            transactions.forEach(transaction => {
                const date = new Date(transaction.transaction_date);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                const paymentMethod = transaction.payment_method || 'Unknown';
                const paymentIcon = getPaymentIcon(paymentMethod);
                
                historyHTML += `
                    <div class="transaction-history-item">
                        <div class="transaction-date">
                            <div class="transaction-date-value">${formattedDate}</div>
                            <div class="transaction-payment-method">
                                <i class="${paymentIcon}"></i> ${paymentMethod}
                            </div>
                        </div>
                        <div class="transaction-id">#${transaction.transaction_id}</div>
                        <div class="transaction-amount">₱${parseFloat(transaction.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div class="transaction-actions">
                            <button class="btn-view-transaction" data-id="${transaction.transaction_id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                `;
            });
            
            historyHTML += `
                    </div>
                </div>
            `;
            
            // Show transaction history in SweetAlert
            Swal.fire({
                title: 'Transaction History',
                html: historyHTML,
                showConfirmButton: true,
                confirmButtonText: 'Close',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5',
                width: '80%',
                customClass: {
                    popup: 'transaction-history-popup',
                    confirmButton: 'transaction-history-button'
                },
                didOpen: () => {
                    // Add event listeners to view buttons
                    document.querySelectorAll('.btn-view-transaction').forEach(button => {
                        button.addEventListener('click', function() {
                            const transactionId = this.getAttribute('data-id');
                            viewTransactionDetails(transactionId);
                        });
                    });
                }
            });
            
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            
            // Create a more helpful error message
            let errorMessage = '';
            
            if (error.message.includes('404')) {
                errorMessage = `The transaction history feature is not available. The server endpoint returned a 404 Not Found error.
                This typically means the API endpoint hasn't been implemented on the server side yet.`;
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = `Could not connect to the server. Please check your internet connection or the server may be down.`;
            } else {
                errorMessage = error.message || 'Please try again later.';
            }
            
            Swal.fire({
                title: 'Error',
                html: `
                    <div class="error-history">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Failed to load transaction history.</p>
                        <p>${errorMessage}</p>
                        <p style="font-size: 12px; margin-top: 15px;">For development/testing, you can use mock data.</p>
                        <button id="useMockDataBtn" class="btn-secondary" style="margin-top: 10px;">
                            <i class="fas fa-database"></i> Use Mock Data
                        </button>
                    </div>
                `,
                confirmButtonText: 'Try Again',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5',
                didOpen: () => {
                    // Add listener for mock data button
                    document.getElementById('useMockDataBtn').addEventListener('click', function() {
                        showMockTransactionHistory();
                        Swal.close();
                    });
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    showTransactionHistory();
                }
            });
        }
    };

    // Function to show mock transaction history data for development/testing
    const showMockTransactionHistory = () => {
        console.log("Using mock transaction history data");
        
        // Create mock transactions
        const mockTransactions = [
            {
                transaction_id: "T10001",
                transaction_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
                payment_method: "cash",
                total_amount: 2500.50,
                cashier_name: "John Doe",
                items: [
                    { item_id: 1, item_name: "Motorcycle Oil Filter", price: 350.00, quantity: 2 },
                    { item_id: 2, item_name: "Brake Pads", price: 1800.50, quantity: 1 }
                ]
            },
            {
                transaction_id: "T10002",
                transaction_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
                payment_method: "card",
                total_amount: 5299.99,
                cashier_name: "Jane Smith",
                items: [
                    { item_id: 3, item_name: "Performance Exhaust System", price: 5299.99, quantity: 1 }
                ]
            },
            {
                transaction_id: "T10003",
                transaction_date: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
                payment_method: "gcash",
                total_amount: 750.00,
                cashier_name: "John Doe",
                items: [
                    { item_id: 4, item_name: "Engine Oil (1L)", price: 250.00, quantity: 3 }
                ]
            }
        ];
        
        // Build transaction history HTML
        let historyHTML = `
            <div class="transaction-history-container">
                <div class="transaction-history-header">
                    <div class="transaction-header-item">Date & Payment Method</div>
                    <div class="transaction-header-item">Transaction ID</div>
                    <div class="transaction-header-item">Amount</div>
                    <div class="transaction-header-item">Actions</div>
                </div>
                <div class="transaction-history-list">
        `;
        
        mockTransactions.forEach(transaction => {
            const date = new Date(transaction.transaction_date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const paymentMethod = transaction.payment_method || 'Unknown';
            const paymentIcon = getPaymentIcon(paymentMethod);
            
            historyHTML += `
                <div class="transaction-history-item">
                    <div class="transaction-date">
                        <div class="transaction-date-value">${formattedDate}</div>
                        <div class="transaction-payment-method">
                            <i class="${paymentIcon}"></i> ${paymentMethod}
                        </div>
                    </div>
                    <div class="transaction-id">#${transaction.transaction_id}</div>
                    <div class="transaction-amount">₱${parseFloat(transaction.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div class="transaction-actions">
                        <button class="btn-view-transaction" data-id="${transaction.transaction_id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </div>
            `;
        });
        
        historyHTML += `
                </div>
            </div>
        `;
        
        // Show transaction history in SweetAlert
        Swal.fire({
            title: 'Transaction History (Mock Data)',
            html: historyHTML,
            showConfirmButton: true,
            confirmButtonText: 'Close',
            confirmButtonColor: '#3498db',
            background: '#141414',
            color: '#f5f5f5',
            width: '80%',
            customClass: {
                popup: 'transaction-history-popup',
                confirmButton: 'transaction-history-button'
            },
            didOpen: () => {
                // Add event listeners to view buttons
                document.querySelectorAll('.btn-view-transaction').forEach(button => {
                    button.addEventListener('click', function() {
                        const transactionId = this.getAttribute('data-id');
                        viewMockTransactionDetails(transactionId);
                    });
                });
            }
        });
    };

    // Function to view transaction details
    const viewTransactionDetails = async (transactionId) => {
        try {
            // Show loading state
            Swal.fire({
                title: 'Loading Transaction Details',
                html: '<div class="loading-history"><i class="fas fa-spinner fa-spin"></i><p>Loading transaction details...</p></div>',
                showConfirmButton: false,
                allowOutsideClick: false,
                background: '#141414',
                color: '#f5f5f5'
            });
            
            // Fetch transaction details from server
            let response;
            
            try {
                // Try first endpoint
                const endpoint1 = `${API_URL}/transactions/${transactionId}`;
                console.log(`Trying to fetch transaction details from: ${endpoint1}`);
                response = await fetch(endpoint1, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed with status: ${response.status}`);
                }
            } catch (error) {
                console.log(`First endpoint failed: ${error.message}, trying alternative`);
                
                // Try second endpoint if first fails
                const endpoint2 = `${API_URL}/transactions/detail/${transactionId}`;
                console.log(`Trying to fetch transaction details from: ${endpoint2}`);
                response = await fetch(endpoint2, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`All endpoints failed with status: ${response.status}`);
                }
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
            
            // Get payment icon
            const paymentIcon = getPaymentIcon(transaction.payment_method);
            
            // Calculate subtotal
            let subtotal = 0;
            if (transaction.items && transaction.items.length > 0) {
                transaction.items.forEach(item => {
                    subtotal += (item.price * item.quantity);
                });
            }
            
            // Calculate tax
            const tax = subtotal * TAX_RATE;
            
            // Show transaction details in a SweetAlert with formatted numbers
            Swal.fire({
                title: `Transaction #${transaction.transaction_id}`,
                html: `
                    <div class="transaction-details-container">
                        <div class="transaction-details-header">
                            <div class="transaction-details-info">
                                <div class="transaction-info-item">
                                    <span class="info-label">Date & Time</span>
                                    <span class="info-value">${formattedDate}</span>
                                </div>
                                <div class="transaction-info-item">
                                    <span class="info-label">Cashier</span>
                                    <span class="info-value">${transaction.cashier_name || 'N/A'}</span>
                                </div>
                                <div class="transaction-info-item">
                                    <span class="info-label">Payment Method</span>
                                    <span class="info-value">
                                        <i class="${paymentIcon}"></i> ${transaction.payment_method || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="transaction-details-content">
                            <table class="transaction-items-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Price</th>
                                        <th class="text-center">Qty</th>
                                        <th class="text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${transaction.items.map(item => `
                                        <tr>
                                            <td>${item.item_name || 'Unknown Item'}</td>
                                            <td>₱${parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                            <td class="text-center">${item.quantity.toLocaleString()}</td>
                                            <td class="text-right">₱${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            
                            <div class="transaction-details-summary">
                                <div class="summary-row">
                                    <span>Subtotal:</span>
                                    <span>₱${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                                <div class="summary-row">
                                    <span>Tax (${(TAX_RATE * 100).toFixed(0)}%):</span>
                                    <span>₱${tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                                <div class="summary-row total-row">
                                    <span>Total:</span>
                                    <span>₱${parseFloat(transaction.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="transaction-details-actions">
                            <button id="printTransactionReceipt" class="btn-print-transaction">
                                <i class="fas fa-print"></i> Print Receipt
                            </button>
                        </div>
                    </div>
                `,
                showCloseButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Close',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5',
                width: '700px',
                customClass: {
                    popup: 'transaction-details-popup',
                    confirmButton: 'transaction-details-button'
                },
                didOpen: () => {
                    // Add event listener for print receipt button
                    const printButton = document.getElementById('printTransactionReceipt');
                    if (printButton) {
                        printButton.addEventListener('click', function() {
                            // This will print the receipt for the current transaction
                            printTransactionReceipt(transaction);
                        });
                    }
                }
            });
            
        } catch (error) {
            console.error('Error fetching transaction details:', error);
            
            let errorMessage = '';
            
            if (error.message.includes('404')) {
                errorMessage = `The transaction details feature is not available.
                   The server endpoint returned a 404 Not Found error.`;
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = `Could not connect to the server. Please check your internet connection or the server may be down.`;
            } else {
                errorMessage = error.message || 'Please try again later.';
            }
            
            Swal.fire({
                title: 'Error',
                html: `
                    <div class="error-history">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Failed to load transaction details.</p>
                        <p>${errorMessage}</p>
                        <button id="viewMockDetailsBtn" class="btn-secondary" style="margin-top: 15px;">
                            <i class="fas fa-database"></i> View Mock Details
                        </button>
                    </div>
                `,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5',
                didOpen: () => {
                    // Add listener for mock data button
                    document.getElementById('viewMockDetailsBtn')?.addEventListener('click', function() {
                        viewMockTransactionDetails(transactionId);
                        Swal.close();
                    });
                }
            });
        }
    };

    // Function to view mock transaction details for development/testing
    const viewMockTransactionDetails = (transactionId) => {
        console.log(`Showing mock transaction details for: ${transactionId}`);
        
        // Find the mock transaction based on ID
        const mockTransactions = {
            "T10001": {
                transaction_id: "T10001",
                transaction_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
                payment_method: "cash",
                total_amount: 2500.50,
                cashier_name: "John Doe",
                items: [
                    { item_id: 1, item_name: "Motorcycle Oil Filter", price: 350.00, quantity: 2 },
                    { item_id: 2, item_name: "Brake Pads", price: 1800.50, quantity: 1 }
                ]
            },
            "T10002": {
                transaction_id: "T10002",
                transaction_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
                payment_method: "card",
                total_amount: 5299.99,
                cashier_name: "Jane Smith",
                items: [
                    { item_id: 3, item_name: "Performance Exhaust System", price: 5299.99, quantity: 1 }
                ]
            },
            "T10003": {
                transaction_id: "T10003",
                transaction_date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                payment_method: "gcash",
                total_amount: 750.00,
                cashier_name: "John Doe",
                items: [
                    { item_id: 4, item_name: "Engine Oil (1L)", price: 250.00, quantity: 3 }
                ]
            }
        };
        
        const transaction = mockTransactions[transactionId] || {
            transaction_id: transactionId,
            transaction_date: new Date().toISOString(),
            payment_method: "unknown",
            total_amount: 999.99,
            cashier_name: "Mock Cashier",
            items: [
                { item_id: 999, item_name: "Mock Product", price: 999.99, quantity: 1 }
            ]
        };
        
        // Format date
        const date = new Date(transaction.transaction_date);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Get payment icon
        const paymentIcon = getPaymentIcon(transaction.payment_method);
        
        // Calculate subtotal
        let subtotal = 0;
        if (transaction.items && transaction.items.length > 0) {
            transaction.items.forEach(item => {
                subtotal += (item.price * item.quantity);
            });
        }
        
        // Calculate tax
        const tax = subtotal * TAX_RATE;
        
        // Show transaction details in a SweetAlert with formatted numbers
        Swal.fire({
            title: `Transaction #${transaction.transaction_id} (Mock Data)`,
            html: `
                <div class="transaction-details-container">
                    <div class="transaction-details-header">
                        <div class="transaction-details-info">
                            <div class="transaction-info-item">
                                <span class="info-label">Date & Time</span>
                                <span class="info-value">${formattedDate}</span>
                            </div>
                            <div class="transaction-info-item">
                                <span class="info-label">Cashier</span>
                                <span class="info-value">${transaction.cashier_name || 'N/A'}</span>
                            </div>
                            <div class="transaction-info-item">
                                <span class="info-label">Payment Method</span>
                                <span class="info-value">
                                    <i class="${paymentIcon}"></i> ${transaction.payment_method || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="transaction-details-content">
                        <table class="transaction-items-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price</th>
                                    <th class="text-center">Qty</th>
                                    <th class="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transaction.items.map(item => `
                                    <tr>
                                        <td>${item.item_name || 'Unknown Item'}</td>
                                        <td>₱${parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td class="text-center">${item.quantity.toLocaleString()}</td>
                                        <td class="text-right">₱${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div class="transaction-details-summary">
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span>₱${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                            <div class="summary-row">
                                <span>Tax (${(TAX_RATE * 100).toFixed(0)}%):</span>
                                <span>₱${tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                            <div class="summary-row total-row">
                                <span>Total:</span>
                                <span>₱${parseFloat(transaction.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="transaction-details-actions">
                        <button id="printTransactionReceipt" class="btn-print-transaction">
                            <i class="fas fa-print"></i> Print Receipt
                        </button>
                    </div>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Close',
            confirmButtonColor: '#3498db',
            background: '#141414',
            color: '#f5f5f5',
            width: '700px',
            customClass: {
                popup: 'transaction-details-popup',
                confirmButton: 'transaction-details-button'
            },
            didOpen: () => {
                // Add event listener for print receipt button
                const printButton = document.getElementById('printTransactionReceipt');
                if (printButton) {
                    printButton.addEventListener('click', function() {
                        // This will print the receipt for the current transaction
                        printTransactionReceipt(transaction);
                    });
                }
            }
        });
    };

    // Function to print transaction receipt
    const printTransactionReceipt = (transaction) => {
        const receiptDate = new Date().toLocaleString();
        const receiptNumber = generateReceiptNumber();
        
        // Format items for receipt
        const items = transaction.items || [];
        const itemsHTML = items.map(item => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            const itemTotal = price * quantity;
            
            return `
                <tr>
                    <td style="text-align: left; padding: 3px 5px;">${item.item_name || 'Unknown Item'}</td>
                    <td style="text-align: center; padding: 3px 5px;">${quantity}</td>
                    <td style="text-align: right; padding: 3px 5px;">₱${price.toFixed(2)}</td>
                    <td style="text-align: right; padding: 3px 5px;">₱${itemTotal.toFixed(2)}</td>
                </tr>
            `;
        }).join('');
        
        // Calculate subtotal directly from items to ensure accuracy
        const subtotal = items.reduce((sum, item) => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            return sum + (price * quantity);
        }, 0);
        
        // Calculate tax
        const tax = subtotal * TAX_RATE;
        
        // Get total amount
        const total = parseFloat(transaction.total_amount);
        
        // Get payment method display name
        const paymentMethodNames = {
            'cash': 'Cash',
            'card': 'Card',
            'gcash': 'GCash',
            'paymaya': 'PayMaya',
            'ewallet': 'E-Wallet',
            'banktransfer': 'Bank Transfer'
        };
        const paymentMethodName = paymentMethodNames[transaction.payment_method] || 'Other';
        
        // Open print window and write the receipt content
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt #${receiptNumber} (Transaction #${transaction.transaction_id})</title>
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
                        <p><strong>Original Transaction Date:</strong> ${new Date(transaction.transaction_date).toLocaleString()}</p>
                        <p><strong>Print Date:</strong> ${receiptDate}</p>
                        <p><strong>Transaction ID:</strong> ${transaction.transaction_id}</p>
                        <p><strong>Cashier:</strong> ${transaction.cashier_name || localStorage.getItem('userName') || 'Staff'}</p>
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
                    </div>
                    
                    <div class="receipt-footer">
                        <p>Thank you for shopping at MotorTech Motorsport!</p>
                        <p>This is a reprint of your receipt.</p>
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
    };

    // Generate a receipt number
    const generateReceiptNumber = () => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        return `RT${year}${month}${day}-${random}`;
    };

    // Initialize the module - specifically target the history button
    const init = () => {
        console.log("TransactionHistory.init called");
        
        // Add the CSS styles for the transaction history UI
        addTransactionHistoryStyles();
        
        // Add direct event listener to the historyBtn
        const setupHistoryButton = () => {
            const historyBtn = document.getElementById('historyBtn');
            
            if (historyBtn) {
                console.log("Found history button, attaching event listener");
                
                // Remove any existing click event listeners to prevent duplicates
                historyBtn.removeEventListener('click', showTransactionHistory);
                
                // Add a new click event listener
                historyBtn.addEventListener('click', function(e) {
                    console.log("History button clicked");
                    e.preventDefault();
                    showTransactionHistory();
                });
                
                // Also add onclick attribute directly to the button as a fallback
                historyBtn.setAttribute('onclick', "TransactionHistory.showTransactionHistory()");
                
                console.log("History button should now be working");
            } else {
                console.log("History button not found yet, will try again in 1 second");
                // Try again in 1 second - the button might not be in the DOM yet
                setTimeout(setupHistoryButton, 1000);
            }
        };
        
        // Start the process of setting up the history button
        setupHistoryButton();
        
        // Also add event listener to document for potential dynamic button creation
        document.addEventListener('DOMNodeInserted', function(e) {
            if (e.target.id === 'historyBtn' || (e.target.querySelector && e.target.querySelector('#historyBtn'))) {
                console.log("History button was dynamically added to the DOM");
                setupHistoryButton();
            }
        });
    };

    // Public API - explicitly make showTransactionHistory available globally
    return {
        init,
        showTransactionHistory,
        viewTransactionDetails,
        showMockTransactionHistory, // New method for mock data
        viewMockTransactionDetails  // New method for mock data
    };
})();

// Initialize the transaction history module when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded - initializing TransactionHistory module");
    TransactionHistory.init();
});

// Make the showTransactionHistory function globally accessible for direct HTML onclick calls
window.TransactionHistory = TransactionHistory;
