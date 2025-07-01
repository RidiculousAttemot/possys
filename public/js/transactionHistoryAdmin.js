/**
 * Transaction History Admin Module
 * Provides advanced transaction management functionality for administrators
 */
const TransactionHistoryAdmin = (() => {
    // Internal state variables
    let initialized = false;
    let transactionHistory = [];
    let originalTransactionData = null;
    let editedTransactionData = null;
    const API_URL = 'http://localhost:5000/api';
    const TAX_RATE = 0.12; // 12% tax rate

    // Function to view transaction details with edit capabilities
    const viewTransactionDetails = async (transactionId) => {
        try {
            // Show loading indicator
            Swal.fire({
                title: 'Loading Details',
                html: `<div class="loading-history">
                    <i class="fas fa-file-invoice-dollar fa-spin"></i>
                    <p>Loading transaction details...</p>
                </div>`,
                showConfirmButton: false,
                allowOutsideClick: false,
                background: '#141414',
                color: '#f5f5f5'
            });

            // Fetch transaction from the server
            const response = await fetch(`${API_URL}/transactions/${transactionId}?timestamp=${Date.now()}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch transaction details: ${response.status}`);
            }
            const transaction = await response.json();

            // Store original transaction data for reference
            originalTransactionData = JSON.parse(JSON.stringify(transaction));
            // Initialize edited data as a copy of original
            editedTransactionData = JSON.parse(JSON.stringify(transaction));

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

            // Show transaction details with print and edit buttons
            Swal.fire({
                title: `Transaction #${transaction.transaction_id}`,
                html: `<div class="transaction-details-container">
                    <div class="transaction-details-header">
                        <div class="transaction-details-info">
                            <div class="transaction-info-item">
                                <span class="info-label">Date & Time</span>
                                <span class="info-value"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                            </div>
                            <div class="transaction-info-item">
                                <span class="info-label">Cashier</span>
                                <span class="info-value"><i class="far fa-user"></i> ${transaction.cashier_name || 'N/A'}</span>
                            </div>
                            <div class="transaction-info-item">
                                <span class="info-label">Payment Method</span>
                                <span class="info-value"><i class="${paymentIcon}"></i> ${transaction.payment_method || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="transaction-details-content" id="transaction-details-content">
                        <table class="transaction-items-table" id="transactionItemsTable">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price</th>
                                    <th class="text-center">Qty</th>
                                    <th class="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transaction.items.map((item, index) => `<tr data-index="${index}" class="${item.status === 'returned' ? 'item-returned' : ''}">
                                    <td style="${item.status === 'returned' ? 'text-decoration: line-through;' : ''}">${item.item_name || 'Unknown Item'} ${item.status === 'returned' ? '<span class="item-status-badge returned-badge">returned</span>' : ''}</td>
                                    <td style="${item.status === 'returned' ? 'text-decoration: line-through;' : ''}">₱${parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                    <td class="text-center" style="${item.status === 'returned' ? 'text-decoration: line-through;' : ''}">${item.quantity.toLocaleString()}</td>
                                    <td class="text-right" style="${item.status === 'returned' ? 'text-decoration: line-through;' : ''}">₱${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                </tr>`).join('')}
                            </tbody>
                        </table>
                        <div class="transaction-details-summary" id="transaction-summary">
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span id="subtotal-value">₱${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                            <div class="summary-row">
                                <span>Tax (${(TAX_RATE * 100).toFixed(0)}%):</span>
                                <span id="tax-value">₱${tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                            <div class="summary-row total-row">
                                <span>Total:</span>
                                <span id="total-value">₱${parseFloat(transaction.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                        </div>
                    </div>
                    <div class="transaction-details-actions">
                        <button id="printReceiptBtn" class="btn-print-transaction">
                            <i class="fas fa-print"></i> Print Receipt
                        </button>
                    </div>
                </div>`,
                showCloseButton: true,
                showConfirmButton: false, 
                width: '500px',
                background: '#141414',
                color: '#f5f5f5',
                customClass: {
                    popup: 'transaction-details-popup',
                    confirmButton: 'transaction-details-button',
                    closeButton: 'transaction-close-button'
                },
                didOpen: (popup) => {
                    // Setup Print button - always print the current state of data
                    document.getElementById('printReceiptBtn').addEventListener('click', function() {
                        printTransactionReceipt(editedTransactionData);
                    });

                    // Add custom CSS to make modal more balanced with even spacing
                    const styleElement = document.createElement('style');
                    styleElement.innerHTML = `
                        .transaction-details-popup {
                            max-width: 500px !important;
                            width: 500px !important;
                            margin: 1rem auto !important;
                            display: flex !important;
                            flex-direction: column !important;
                        }
                        .transaction-details-container {
                            display: flex !important;
                            flex-direction: column !important;
                            gap: 10px !important;
                            padding: 15px !important;
                            max-height: 70vh !important;
                        }
                        .transaction-details-header {
                            padding: 10px !important;
                            margin-bottom: 5px !important;
                            border-radius: 8px !important;
                        }
                        .transaction-details-info {
                            display: grid !important;
                            grid-template-columns: 1fr 1fr 1fr !important;
                            gap: 10px !important;
                        }
                        .transaction-info-item {
                            padding: 8px !important;
                            min-width: auto !important;
                            flex: 1 !important;
                            text-align: center !important;
                        }
                        .info-label {
                            font-size: 12px !important;
                            margin-bottom: 5px !important;
                        }
                        .info-value {
                            font-size: 13px !important;
                            margin-top: 0 !important;
                            justify-content: center !important;
                        }
                        .transaction-details-content {
                            padding: 12px !important;
                            border-radius: 8px !important;
                        }
                        .transaction-items-table {
                            width: 100% !important;
                            table-layout: fixed !important;
                        }
                        .transaction-items-table th, 
                        .transaction-items-table td {
                            padding: 8px !important;
                            font-size: 12px !important;
                        }
                        .transaction-details-summary {
                            padding: 10px !important;
                            margin-top: 10px !important;
                            gap: 5px !important;
                        }
                        .summary-row {
                            font-size: 12px !important;
                            padding: 3px 0 !important;
                        }
                        .total-row {
                            font-size: 14px !important;
                            padding-top: 5px !important;
                        }
                        .transaction-details-actions {
                            display: flex !important;
                            justify-content: center !important;
                            gap: 8px !important;
                            padding: 10px 5px 5px !important;
                        }
                        .btn-print-transaction, .btn-edit-transaction {
                            padding: 8px 12px !important;
                            font-size: 12px !important;
                            min-width: 110px !important;
                            text-align: center !important;
                            justify-content: center !important;
                        }
                        .swal2-title {
                            font-size: 16px !important;
                            padding: 10px !important;
                            text-align: center !important;
                        }
                        .swal2-html-container {
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .editable-row input {
                            width: 100%;
                            padding: 4px;
                            font-size: 12px;
                            background: rgba(255,255,255,0.1);
                            border: 1px solid rgba(255,255,255,0.2);
                            color: #f5f5f5;
                            border-radius: 3px;
                        }
                        .item-void {
                            text-decoration: line-through;
                            color: #ff6b6b;
                        }
                        .item-returned {
                            text-decoration: line-through;
                            color: #ffa600;
                        }
                        .item-status-badge {
                            display: inline-block;
                            padding: 2px 5px;
                            border-radius: 3px;
                            font-size: 9px;
                            margin-left: 3px;
                            text-transform: uppercase;
                        }
                        .void-badge {
                            background: #ff6b6b;
                            color: white;
                        }
                        .returned-badge {
                            background: #ffa600;
                            color: white;
                        }
                    `;
                    document.head.appendChild(styleElement);

                    // Fix close button behavior and positioning for consistent spacing
                    const closeButton = popup.querySelector('.swal2-close');
                    if (closeButton) {
                        closeButton.style.position = 'absolute';
                        closeButton.style.top = '5px'; 
                        closeButton.style.right = '10px';
                        closeButton.style.zIndex = '10';
                        closeButton.style.width = '28px';
                        closeButton.style.height = '28px';
                        closeButton.style.display = 'flex';
                        closeButton.style.alignItems = 'center';
                        closeButton.style.justifyContent = 'center';
                    }
                    
                    // Fix title spacing
                    const titleElement = popup.querySelector('.swal2-title');
                    if (titleElement) {
                        titleElement.style.paddingRight = '30px'; 
                        titleElement.style.margin = '5px 0';
                        titleElement.style.fontSize = '16px';
                    }
                }
            });

        } catch (error) {
            console.error('Error viewing transaction details:', error);
            Swal.fire({
                title: 'Error',
                text: `Failed to load transaction details: ${error.message}`,
                icon: 'error',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
        }
    };

    // Function to enable editing of transaction items
    const enableTransactionEdit = (transaction) => {
        const table = document.getElementById('transactionItemsTable');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        // Create new tbody with editable rows
        const newTbody = document.createElement('tbody');
        
        transaction.items.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.className = 'editable-row';
            tr.dataset.index = index;
            
            // Item name cell
            const nameCell = document.createElement('td');
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'edit-input';
            nameInput.value = item.item_name || 'Unknown Item';
            nameInput.dataset.field = 'item_name';
            nameInput.dataset.index = index;
            nameCell.appendChild(nameInput);
            
            // Item status controls
            const statusDiv = document.createElement('div');
            statusDiv.style.marginTop = '5px';
            
            // Return checkbox
            const returnLabel = document.createElement('label');
            returnLabel.style.fontSize = '11px';
            returnLabel.style.display = 'flex';
            returnLabel.style.alignItems = 'center';
            
            const returnCheck = document.createElement('input');
            returnCheck.type = 'checkbox';
            returnCheck.className = 'return-checkbox';
            returnCheck.checked = item.status === 'returned';
            returnCheck.dataset.index = index;
            returnCheck.style.marginRight = '4px';
            
            returnLabel.appendChild(returnCheck);
            returnLabel.appendChild(document.createTextNode(' Return Item'));
            
            // Add event listeners for the return checkbox
            returnCheck.addEventListener('change', function() {
                if (this.checked) {
                    editedTransactionData.items[index].status = 'returned';
                } else {
                    editedTransactionData.items[index].status = null;
                }
                
                // Update item styles
                updateItemStyles(tr, nameInput, returnCheck.checked ? 'returned' : null);
                
                // Recalculate totals
                recalculateTransactionTotals();
            });
            
            statusDiv.appendChild(returnLabel);
            nameCell.appendChild(statusDiv);
            
            // Price cell
            const priceCell = document.createElement('td');
            const priceInput = document.createElement('input');
            priceInput.type = 'number';
            priceInput.className = 'edit-input';
            priceInput.value = parseFloat(item.price).toFixed(2);
            priceInput.min = '0';
            priceInput.step = '0.01';
            priceInput.dataset.field = 'price';
            priceInput.dataset.index = index;
            priceCell.appendChild(priceInput);
            
            // Quantity cell
            const qtyCell = document.createElement('td');
            qtyCell.className = 'text-center';
            const qtyInput = document.createElement('input');
            qtyInput.type = 'number';
            qtyInput.className = 'edit-input';
            qtyInput.value = item.quantity;
            qtyInput.min = '1';
            qtyInput.dataset.field = 'quantity';
            qtyInput.dataset.index = index;
            qtyCell.appendChild(qtyInput);
            
            // Total cell (calculated)
            const totalCell = document.createElement('td');
            totalCell.className = 'text-right';
            totalCell.textContent = `₱${(item.price * item.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            totalCell.dataset.total = item.price * item.quantity;
            
            // Add event listeners to update total on input change
            [priceInput, qtyInput].forEach(input => {
                input.addEventListener('input', function() {
                    const idx = parseInt(this.dataset.index);
                    const price = parseFloat(priceInput.value) || 0;
                    const qty = parseInt(qtyInput.value) || 0;
                    const total = price * qty;
                    
                    totalCell.textContent = `₱${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                    totalCell.dataset.total = total;
                    
                    // Update edited transaction data
                    editedTransactionData.items[idx].price = price;
                    editedTransactionData.items[idx].quantity = qty;
                    
                    // Recalculate totals
                    recalculateTransactionTotals();
                });
            });
            
            // Apply initial styles if item has a status
            if (item.status) {
                updateItemStyles(tr, nameInput, item.status);
            }
            
            // Add cells to row
            tr.appendChild(nameCell);
            tr.appendChild(priceCell);
            tr.appendChild(qtyCell);
            tr.appendChild(totalCell);
            
            // Add row to tbody
            newTbody.appendChild(tr);
        });
        
        // Replace the existing tbody with new editable one
        tbody.parentNode.replaceChild(newTbody, tbody);
        
        // Add save/cancel controls below the table
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'editable-controls';
        controlsDiv.id = 'editControlsDiv';
        controlsDiv.style.gap = '5px'; // Make controls more compact
        controlsDiv.style.margin = '8px 0'; // Reduce margin
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn-save';
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        saveBtn.style.padding = '6px 12px';
        saveBtn.style.fontSize = '12px';
        saveBtn.addEventListener('click', () => saveTransactionChanges(transaction));
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-cancel';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
        cancelBtn.style.padding = '6px 12px';
        cancelBtn.style.fontSize = '12px';
        cancelBtn.addEventListener('click', () => cancelTransactionEdit(transaction));
        
        controlsDiv.appendChild(saveBtn);
        controlsDiv.appendChild(cancelBtn);
        
        // Append controls after the table
        const content = document.getElementById('transaction-details-content');
        if (content) {
            // Check if controls already exist
            const existingControls = document.getElementById('editControlsDiv');
            if (existingControls) {
                existingControls.remove();
            }
            
            content.insertBefore(controlsDiv, document.getElementById('transaction-summary'));
        }
        
        // Hide edit button while in edit mode
        const editBtn = document.getElementById('editTransactionBtn');
        if (editBtn) editBtn.style.display = 'none';
    };
    
    // Helper function to update item styling based on status
    const updateItemStyles = (row, nameInput, status) => {
        if (status === 'returned') {
            row.classList.add('item-returned');
            nameInput.classList.add('item-returned');
            // Add strikethrough style directly to ensure it's applied
            nameInput.style.textDecoration = 'line-through';
            row.style.textDecoration = 'line-through';
        } else {
            row.classList.remove('item-returned');
            nameInput.classList.remove('item-returned');
            // Remove strikethrough style
            nameInput.style.textDecoration = 'none';
            row.style.textDecoration = 'none';
        }
    };
    
    // Function to recalculate transaction totals during editing
    const recalculateTransactionTotals = () => {
        let subtotal = 0;
        
        // Sum up all item totals from the edited rows, excluding returned items
        document.querySelectorAll('.editable-row').forEach(row => {
            const index = parseInt(row.dataset.index);
            const item = editedTransactionData.items[index];
            
            if (item && !item.status) { // Only include items that aren't returned
                subtotal += (item.price * item.quantity);
            }
        });
        
        // Calculate tax and total
        const tax = subtotal * TAX_RATE;
        const total = subtotal + tax;
        
        // Update the displayed values in the summary
        document.getElementById('subtotal-value').textContent = `₱${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('tax-value').textContent = `₱${tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('total-value').textContent = `₱${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        // Update total in transaction data
        editedTransactionData.total_amount = total;
    };

    // Function to save transaction changes
    const saveTransactionChanges = async (transaction) => {
        try {
            // Gather updated data from the form
            document.querySelectorAll('.editable-row').forEach(row => {
                const index = parseInt(row.dataset.index);
                
                const nameInput = row.querySelector(`input[data-field="item_name"]`);
                const priceInput = row.querySelector(`input[data-field="price"]`);
                const qtyInput = row.querySelector(`input[data-field="quantity"]`);
                
                if (nameInput && priceInput && qtyInput) {
                    editedTransactionData.items[index].item_name = nameInput.value;
                    editedTransactionData.items[index].price = parseFloat(priceInput.value);
                    editedTransactionData.items[index].quantity = parseInt(qtyInput.value);
                }
            });
            
            // Calculate new totals
            let subtotal = 0;
            editedTransactionData.items.forEach(item => {
                subtotal += (item.price * item.quantity);
            });
            
            const tax = subtotal * TAX_RATE;
            editedTransactionData.total_amount = subtotal + tax;
            
            // In a real application, you would save this to the server
            // For this example, we'll show a success message and refresh the view
            
            // Show success message
            Swal.fire({
                title: 'Changes Saved',
                text: 'The transaction has been updated successfully.',
                icon: 'success',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                // Refresh view with updated data
                viewTransactionDetails(transaction.transaction_id);
            });
            
        } catch (error) {
            console.error('Error saving transaction changes:', error);
            Swal.fire({
                title: 'Error',
                text: `Failed to save changes: ${error.message}`,
                icon: 'error',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
        }
    };
    
    // Function to cancel transaction edit
    const cancelTransactionEdit = (transaction) => {
        // Reset edited data back to original
        editedTransactionData = JSON.parse(JSON.stringify(originalTransactionData));
        // Refresh the view with original data
        viewTransactionDetails(transaction.transaction_id);
    };
    
    // Function to print transaction receipt - simplified to always print current state
    const printTransactionReceipt = (transaction) => {
        const receiptDate = new Date().toLocaleString();
        const receiptNumber = generateReceiptNumber();
        
        // Format items for receipt
        const items = transaction.items || [];
        const itemsHTML = items.map(item => {
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            const itemTotal = price * quantity;
            
            // Check if item is returned
            let statusLabel = '';
            let textStyle = '';
            
            if (item.status === 'returned') {
                statusLabel = '<span class="item-status">RETURNED</span>';
                textStyle = 'text-decoration: line-through; color: #666;';
            }
            
            return `<tr>
                <td style="text-align: left; padding: 3px 5px; ${textStyle}">${item.item_name || 'Unknown Item'} ${statusLabel}</td>
                <td style="text-align: center; padding: 3px 5px; ${textStyle}">${quantity}</td>
                <td style="text-align: right; padding: 3px 5px; ${textStyle}">₱${price.toFixed(2)}</td>
                <td style="text-align: right; padding: 3px 5px; ${textStyle}">₱${itemTotal.toFixed(2)}</td>
            </tr>`;
        }).join('');
        
        // Calculate subtotal (excluding returned items)
        const subtotal = items.reduce((sum, item) => {
            if (item.status === 'returned') return sum; // Skip returned items
            
            const price = parseFloat(item.price);
            const quantity = parseInt(item.quantity);
            return sum + (price * quantity);
        }, 0);
        
        // Calculate tax
        const tax = subtotal * TAX_RATE;
        
        // Get total amount (should be updated to reflect returned items)
        const total = subtotal + tax;
        
        // Get payment method name
        const paymentMethodNames = {
            'cash': 'Cash',
            'card': 'Card',
            'gcash': 'fas fa-mobile-alt',
            'paymaya': 'PayMaya',
            'ewallet': 'E-Wallet',
            'banktransfer': 'Bank Transfer'
        };
        const paymentMethodName = paymentMethodNames[transaction.payment_method] || 'Other';
        
        // Check if this receipt has returned items
        const hasReturns = items.some(item => item.status === 'returned');
        
        // Open a new window for the receipt
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html>
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
                    .receipt-info {
                        margin-bottom: 10px;
                        font-size: 12px;
                    }
                    .receipt-info p {
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
                    .item-status {
                        font-size: 9px;
                        background: #f8f8f8;
                        padding: 1px 3px;
                        border-radius: 2px;
                        margin-left: 3px;
                        vertical-align: top;
                        border: 1px solid #ddd;
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
                    .receipt-footer {
                        text-align: center;
                        margin-top: 15px;
                        border-top: 1px dashed #000;
                        padding-top: 10px;
                        font-size: 11px;
                    }
                    .returns-note {
                        background: #f8f8f8;
                        border: 1px dashed #999;
                        padding: 5px;
                        text-align: center;
                        margin: 10px 0;
                        font-weight: bold;
                        color: #cc0000;
                    }
                    @media print {
                        body {
                            width: 80mm;
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
                    ${hasReturns ? `<div class="returns-note">*INCLUDES RETURNED ITEMS*</div>` : ''}
                </div>
                <div class="receipt-info">
                    <p><strong>Receipt #:</strong> ${receiptNumber}</p>
                    <p><strong>Transaction ID:</strong> ${transaction.transaction_id}</p>
                    <p><strong>Date:</strong> ${new Date(transaction.transaction_date).toLocaleString()}</p>
                    <p><strong>Print Date:</strong> ${receiptDate}</p>
                    <p><strong>Cashier:</strong> ${transaction.cashier_name || 'Unknown'}</p>
                </div>
                <table class="receipt-items">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHTML}</tbody>
                </table>
                <div class="receipt-totals">
                    <div class="row">
                        <span>Subtotal:</span>
                        <span>₱${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="row">
                        <span>VAT (${TAX_RATE * 100}%):</span>
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
                    <p>This receipt serves as proof of purchase.</p>
                    ${hasReturns ? `<p><strong>Note:</strong> Some items have been returned.</p>` : ''}
                </div>
            </body>
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </html>`);
        
        printWindow.document.close();
        printWindow.focus();
    };
    
    // Helper function to generate receipt number
    const generateReceiptNumber = () => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `RT${year}${month}${day}-${random}`;
    };
    
    // Helper function to get payment icon
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
    
    // Initialize the module
    const init = () => {
        if (initialized) return;
        initialized = true;
        
        // Add any initialization code here
        console.log('Transaction History Admin module initialized');
    };
    
    // Public API
    return {
        init,
        viewTransactionDetails
    };
})();

// Initialize the module when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    TransactionHistoryAdmin.init();
});

// Make the module globally available
window.TransactionHistoryAdmin = TransactionHistoryAdmin;
