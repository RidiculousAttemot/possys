// Transaction History Module
const TransactionHistory = (() => {
    // Internal state variables
    let initialized = false;
    let transactionHistory = [];
    let activeModal = null;
    
    // API base URL
    const API_URL = 'http://localhost:5000/api';
    const TAX_RATE = 0.12; // 12% tax rate

    // Add CSS styles for the transaction history UI
    const addTransactionHistoryStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            /* Transaction History Modal */
            .transaction-history-popup {
                max-width: 850px !important;
                width: 90% !important;
                max-height: 85vh;
                border-radius: 12px !important;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
                overflow: hidden;
                padding: 0 !important;
                animation: modal-appear 0.3s ease-out;
            }
            
            @keyframes modal-appear {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Transaction Details Modal */
            .transaction-details-popup {
                max-width: 700px !important;
                min-width: 600px !important;
                width: 90% !important;
                border-radius: 12px !important;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
                overflow: hidden !important;
                padding: 0 !important;
                animation: modal-appear 0.3s ease-out;
            }
            
            /* Standardized header styling for both modals */
            .swal2-title {
                font-size: 22px !important;
                color: #f5f5f5 !important;
                padding: 20px 25px !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                margin: 0 !important;
                background: linear-gradient(to right, #1c1c1c, #2c2c2c) !important;
                text-transform: uppercase;
                letter-spacing: 1px;
                text-align: left !important;
            }
            
            /* Transaction history container improvements */
            .transaction-history-container {
                max-height: 65vh;
                overflow-y: auto;
                padding: 0;
                border-radius: 0;
                color: #f5f5f5;
                scrollbar-width: thin;
                scrollbar-color: #3498db #1a1a1a;
                width: 100%;
                margin: 0;
                background-color: #141414;
            }
            
            .transaction-history-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .transaction-history-container::-webkit-scrollbar-track {
                background: #1a1a1a;
                border-radius: 8px;
            }
            
            .transaction-history-container::-webkit-scrollbar-thumb {
                background: #3498db;
                border-radius: 8px;
                transition: background 0.3s;
            }
            
            .transaction-history-container::-webkit-scrollbar-thumb:hover {
                background: #2980b9;
            }
            
            .transaction-history-header {
                display: grid;
                grid-template-columns: 1fr 1fr 2fr 0.8fr;
                padding: 14px 20px;
                background: linear-gradient(to right, #1c1c1c, #2c2c2c);
                border-bottom: 1px solid #333;
                position: sticky;
                top: 0;
                font-weight: bold;
                z-index: 10;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                width: 100%;
                box-sizing: border-box;
                margin: 0;
            }
            
            .transaction-header-item {
                padding: 5px;
                text-align: center; /* Center all headers */
                color: #3498db;
                font-size: 14px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                white-space: nowrap; /* Prevent wrapping for better alignment */
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .transaction-history-list {
                overflow-y: auto;
                padding: 5px;
                width: 100%; /* Ensure full width */
                box-sizing: border-box; /* Include padding in width calculation */
            }
            
            .transaction-history-item {
                display: grid;
                grid-template-columns: 1fr 1fr 2fr 0.8fr; /* Match header columns - reordered */
                padding: 16px 20px;
                border-bottom: 1px solid #333;
                align-items: center;
                background: linear-gradient(to right, #1e1e1e, #252525);
                margin: 0;
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                width: 100%; /* Ensure full width */
                box-sizing: border-box; /* Include padding in width calculation */
            }
            
            .transaction-history-item:hover {
                background: linear-gradient(to right, #2a2a2a, #303030);
                transform: translateY(-2px);
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
                z-index: 5;
            }
            
            .transaction-date {
                display: flex;
                flex-direction: column;
                gap: 6px;
                justify-content: center;
                align-items: center; /* Center content */
                text-align: center; /* Center text */
            }
            
            .transaction-date-value {
                font-weight: 500;
                font-size: 15px;
                color: #f0f0f0;
                text-align: center;
            }
            
            .transaction-payment-method {
                font-size: 12px;
                color: #999;
                display: flex;
                align-items: center;
                justify-content: center; /* Center content */
                gap: 6px;
                background-color: rgba(52, 152, 219, 0.1);
                padding: 4px 8px;
                border-radius: 12px;
                width: fit-content;
                margin: 0 auto; /* Center block */
                border: 1px solid rgba(52, 152, 219, 0.2);
            }
            
            .transaction-id {
                font-family: 'Courier New', monospace;
                color: #999;
                font-size: 14px;
                letter-spacing: 0.5px;
                padding: 4px 0;
                text-align: center; /* Center text */
            }
            
            .transaction-amount {
                font-weight: 600;
                color: #3498db;
                font-size: 16px;
                background: linear-gradient(to right, #3498db, #2980b9);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-align: center; /* Center text */
                display: flex; /* Use flexbox for perfect centering */
                justify-content: center; /* Center horizontally */
                align-items: center; /* Center vertically */
                width: 100%; /* Ensure it takes full column width */
                padding: 0; /* Remove padding that might affect centering */
                height: 100%; /* Ensure it takes full height for vertical alignment */
            }
            
            .transaction-actions {
                text-align: center; /* Center actions */
            }
            
            .btn-view-transaction {
                background: linear-gradient(to right, #2c3e50, #3498db);
                border: none;
                color: white;
                padding: 8px 14px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center; /* Center content */
                gap: 8px;
                font-weight: 500;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                margin: 0 auto; /* Center button */
            }
            
            .btn-view-transaction:hover {
                background: linear-gradient(to right, #3498db, #2980b9);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            
            .btn-view-transaction i {
                font-size: 14px;
            }
            
            /* Empty State */
            .no-transactions {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                color: #999;
                text-align: center;
                background: linear-gradient(to bottom, #1a1a1a, #222222);
                border-radius: 10px;
                box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
            }
            
            .no-transactions i {
                font-size: 64px;
                margin-bottom: 20px;
                color: #333;
                background: linear-gradient(to bottom, #444, #333);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
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
                background: linear-gradient(to bottom, #1a1a1a, #222222);
                border-radius: 10px;
                box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
            }
            
            .error-history i {
                font-size: 48px;
                margin-bottom: 15px;
                background: linear-gradient(to bottom, #e74c3c, #c0392b);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .btn-retry {
                background: linear-gradient(to right, #3498db, #2980b9);
                color: white;
                border: none;
                border-radius: 6px;
                padding: 10px 20px;
                margin-top: 18px;
                cursor: pointer;
                transition: all 0.3s;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            
            .btn-retry:hover {
                background: linear-gradient(to right, #2980b9, #3498db);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            
            .btn-secondary {
                background: linear-gradient(to right, #2c3e50, #34495e);
                color: white;
                border: none;
                border-radius: 6px;
                padding: 10px 20px;
                cursor: pointer;
                transition: all 0.2s;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 10px auto 0;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            
            .btn-secondary:hover {
                background: linear-gradient(to right, #34495e, #2c3e50);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            
            /* Loading State */
            .loading-history {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                color: #999;
                text-align: center;
                background: linear-gradient(to bottom, #1a1a1a, #222222);
                border-radius: 10px;
                box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
            }
            
            .loading-history i {
                font-size: 40px;
                margin-bottom: 20px;
                color: #3498db;
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(0.95); opacity: 0.7; }
                50% { transform: scale(1.05); opacity: 1; }
                100% { transform: scale(0.95); opacity: 0.7; }
            }
            
            /* Transaction Details Modal */
            .transaction-details-popup {
                max-width: 700px !important;
                min-width: 600px !important;
                width: 90% !important;
                border-radius: 12px !important;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
                overflow: hidden !important;
                padding: 0 !important; /* Remove padding for better alignment */
                animation: modal-appear 0.3s ease-out;
            }
            
            /* Transaction details container improvements */
            .transaction-details-container {
                display: flex;
                flex-direction: column;
                gap: 15px;
                max-height: 70vh;
                overflow-y: auto;
                padding: 20px;
                scrollbar-width: thin;
                scrollbar-color: #3498db #1a1a1a;
                background-color: #141414;
            }
            
            .transaction-details-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .transaction-details-container::-webkit-scrollbar-track {
                background: #1a1a1a;
                border-radius: 8px;
            }
            
            .transaction-details-container::-webkit-scrollbar-thumb {
                background: #3498db;
                border-radius: 8px;
            }
            
            .transaction-details-container::-webkit-scrollbar-thumb:hover {
                background: #2980b9;
            }
            
            .transaction-details-header {
                background: linear-gradient(to right, #1c1c1c, #2c2c2c);
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                margin-bottom: 5px;
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
                min-width: 170px;
                background-color: rgba(255, 255, 255, 0.05);
                padding: 15px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: all 0.2s ease;
                align-items: center;
            }
            
            .transaction-info-item:hover {
                background-color: rgba(255, 255, 255, 0.08);
                border-color: rgba(52, 152, 219, 0.3);
            }
            
            .info-label {
                color: #999;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }
            
            .info-value {
                font-weight: 500;
                margin-top: 4px;
                font-size: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .transaction-details-content {
                background: linear-gradient(to right, #1c1c1c, #2c2c2c);
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            
            .transaction-items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                background-color: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border: 1px solid #333;
            }
            
            .transaction-items-table th, 
            .transaction-items-table td {
                padding: 12px 16px;
                text-align: left;
                border-bottom: 1px solid #333;
            }
            
            .transaction-items-table th {
                color: #3498db;
                font-weight: 500;
                font-size: 14px;
                text-transform: uppercase;
                background-color: rgba(0, 0, 0, 0.3);
                letter-spacing: 0.5px;
            }
            
            .transaction-items-table tr:last-child td {
                border-bottom: none;
            }
            
            .transaction-items-table tr:hover td {
                background-color: rgba(52, 152, 219, 0.05);
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
                gap: 10px;
                padding-top: 18px;
                border-top: 1px solid #333;
                margin-top: 10px;
                background-color: rgba(0, 0, 0, 0.2);
                padding: 16px;
                border-radius: 8px;
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                font-size: 14px;
                padding: 4px 0;
            }
            
            .total-row {
                font-weight: bold;
                font-size: 18px;
                color: #3498db;
                padding-top: 8px;
                margin-top: 8px;
                border-top: 1px solid #333;
                background: linear-gradient(to right, #3498db, #2980b9);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .transaction-details-actions {
                display: flex;
                justify-content: flex-end;
                padding: 10px 0;
            }
            
            .btn-print-transaction {
                background: linear-gradient(to right, #27ae60, #2ecc71);
                border: none;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                transition: all 0.2s;
                font-weight: 500;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                font-size: 15px;
                margin-left: auto;
            }
            
            .btn-print-transaction:hover {
                background: linear-gradient(to right, #2ecc71, #27ae60);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            
            /* SweetAlert override styles for transaction history */
            .swal2-title {
                font-size: 22px !important;
                color: #f5f5f5 !important;
                padding: 20px 25px !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                margin: 0 !important;
                background: linear-gradient(to right, #1c1c1c, #2c2c2c) !important;
                text-transform: uppercase;
                letter-spacing: 1px;
                text-align: left !important;
            }
            
            .transaction-history-button {
                background: linear-gradient(to right, #3498db, #2980b9) !important;
                border: none !important;
                padding: 12px 25px !important;
                border-radius: 8px !important;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
                transition: all 0.3s !important;
                font-weight: 500 !important;
                letter-spacing: 0.5px !important;
                margin: 15px !important;
            }
            
            .transaction-history-button:hover {
                background: linear-gradient(to right, #2980b9, #3498db) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
            }
            
            .transaction-details-button {
                background: linear-gradient(to right, #3498db, #2980b9) !important;
                border: none !important;
                padding: 12px 25px !important;
                border-radius: 8px !important;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
                transition: all 0.3s !important;
                font-weight: 500 !important;
                letter-spacing: 0.5px !important;
                margin: 15px !important;
            }
            
            .transaction-details-button:hover {
                background: linear-gradient(to right, #2980b9, #3498db) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3) !important;
            }
            
            /* SweetAlert specific styling improvements */
            .swal2-popup.transaction-history-popup .swal2-html-container,
            .swal2-popup.transaction-details-popup .swal2-html-container {
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                color: #f5f5f5 !important;
            }
            
            .swal2-popup.transaction-history-popup .swal2-actions,
            .swal2-popup.transaction-details-popup .swal2-actions {
                margin: 0 !important;
                padding: 10px !important;
                background-color: #141414 !important;
                border-top: 1px solid #333 !important;
                width: 100% !important;
                justify-content: flex-end !important;
            }
            
            /* Fix for last-updated timestamp */
            .transaction-timestamp {
                padding: 12px; 
                text-align: center; 
                font-size: 12px; 
                color: #666;
                background-color: #141414;
                border-top: 1px solid #333;
                width: 100%;
                box-sizing: border-box;
            }
            
            /* Enhanced styling for close button */
            .swal2-close {
                position: absolute !important;
                top: 16px !important;
                right: 16px !important;
                font-size: 24px !important;
                color: #999 !important;
                background: rgba(0, 0, 0, 0.2) !important;
                border-radius: 50% !important;
                width: 32px !important;
                height: 32px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: all 0.2s !important;
                z-index: 9999 !important; /* Increased z-index to ensure it's always on top */
                cursor: pointer !important;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
                opacity: 1 !important; /* Ensure it's always visible */
            }
            
            .swal2-close:hover {
                background: rgba(255, 0, 0, 0.2) !important; /* Red background for clear close indication */
                color: white !important;
                transform: rotate(90deg) !important;
            }
        `;
        document.head.appendChild(style);
    };

    // Store the current transaction history HTML for returning from detail view
    let currentTransactionHistoryHTML = '';
    let currentTransactionHistoryTitle = 'Transaction History';

    // Helper function to close modals consistently (same as in pos.js)
    const closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    };

    // Universal modal close function (for SweetAlert modals)
    const closeSwalModal = () => {
        if (window.Swal) {
            Swal.close();
            // Ensure body scrolling is restored
            document.body.style.overflow = 'auto';
            
            // Clear transaction content from the DOM to prevent leftover HTML
            const transactionContainers = document.querySelectorAll('.transaction-details, .transaction-history-container, .transaction-details-popup');
            transactionContainers.forEach(container => {
                if (container && container.parentNode) {
                    container.innerHTML = '';
                }
            });
            
            // Remove any lingering SweetAlert containers
            const swalContainers = document.querySelectorAll('.swal2-container');
            swalContainers.forEach(container => {
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            });
        }
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
    const showTransactionHistory = async (preserveHistoryHTML = false) => {
        console.log("TransactionHistory.showTransactionHistory called, preserveHistory:", preserveHistoryHTML);
        
        // Check if SweetAlert is defined
        if (typeof Swal === 'undefined') {
            console.error("SweetAlert is not defined. Make sure to include SweetAlert2 library.");
            alert("Error loading transaction history. Check console for details.");
            return;
        }
        
        // If we have stored history and were asked to preserve it, use that instead of fetching again
        if (preserveHistoryHTML && currentTransactionHistoryHTML) {
            console.log("Using preserved transaction history HTML");
            Swal.fire({
                title: currentTransactionHistoryTitle,
                html: currentTransactionHistoryHTML,
                showConfirmButton: false,
                showCloseButton: true, // Explicitly enable close button
                allowOutsideClick: true, // Allow clicking outside to close
                allowEscapeKey: true, // Allow ESC key to close
                background: '#141414',
                color: '#f5f5f5',
                width: 'auto', // Let the max-width setting control the size
                heightAuto: false,
                customClass: {
                    popup: 'transaction-history-popup',
                    confirmButton: 'transaction-history-button',
                    title: 'transaction-history-title',
                    htmlContainer: 'transaction-history-html-container',
                    actions: 'transaction-history-actions',
                    closeButton: 'history-close-button'
                },
                didOpen: (popup) => {
                    // Re-attach event listeners to view buttons
                    document.querySelectorAll('.btn-view-transaction').forEach(button => {
                        button.addEventListener('click', function() {
                            const transactionId = this.getAttribute('data-id');
                            viewTransactionDetails(transactionId);
                        });
                    });
                    
                    // Fix the close button using the same approach as pos.js
                    // First, handle the x button
                    const closeButton = popup.querySelector('.swal2-close');
                    if (closeButton) {
                        closeButton.onclick = () => {
                            console.log("Close button clicked");
                            closeSwalModal();
                        };
                    }
                    
                    // Handle ESC key
                    document.addEventListener('keydown', function escHandler(e) {
                        if (e.key === 'Escape') {
                            closeSwalModal();
                            document.removeEventListener('keydown', escHandler);
                        }
                    });
                    
                    // Handle outside click
                    popup.addEventListener('click', function(e) {
                        if (e.target === popup) {
                            closeSwalModal();
                        }
                    });
                }
            });
            return;
        }
        
        try {
            // Show loading state in SweetAlert with improved animation
            Swal.fire({
                title: 'Transaction History',
                html: '<div class="loading-history"><i class="fas fa-receipt fa-spin"></i><p>Loading your transaction history...</p></div>',
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
                        <div class="transaction-header-item">Transaction ID</div>
                        <div class="transaction-header-item">Amount</div>
                        <div class="transaction-header-item">Date & Payment Method</div>
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
                        <div class="transaction-id">#${transaction.transaction_id}</div>
                        <div class="transaction-amount">₱${parseFloat(transaction.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        <div class="transaction-date">
                            <div class="transaction-date-value">${formattedDate}</div>
                            <div class="transaction-payment-method">
                                <i class="${paymentIcon}"></i> ${paymentMethod}
                            </div>
                        </div>
                        <div class="transaction-actions">
                            <button class="btn-view-transaction" data-id="${transaction.transaction_id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                `;
            });
            
            // Add a timestamp at the bottom of the transaction history
            historyHTML += `
                    </div>
                    <div class="transaction-timestamp">
                        Last updated: ${new Date().toLocaleString()}
                    </div>
                </div>
            `;
            
            // Store the history HTML for later use
            currentTransactionHistoryHTML = historyHTML;
            currentTransactionHistoryTitle = 'Transaction History';
            
            // Show transaction history in SweetAlert
            Swal.fire({
                title: 'Transaction History',
                html: historyHTML,
                showConfirmButton: false,
                showCloseButton: true, // Explicitly enable close button
                allowOutsideClick: true, // Allow clicking outside to close
                allowEscapeKey: true, // Allow ESC key to close
                background: '#141414',
                color: '#f5f5f5',
                width: 'auto', // Let the max-width setting control the size
                heightAuto: false,
                customClass: {
                    popup: 'transaction-history-popup',
                    confirmButton: 'transaction-history-button',
                    title: 'transaction-history-title',
                    htmlContainer: 'transaction-history-html-container',
                    actions: 'transaction-history-actions',
                    closeButton: 'history-close-button'
                },
                didOpen: (popup) => {
                    // Add event listeners to view buttons with proper cleanup
                    document.querySelectorAll('.btn-view-transaction').forEach(button => {
                        // Clone and replace the button to remove any previous event listeners
                        const newButton = button.cloneNode(true);
                        button.parentNode.replaceChild(newButton, button);
                        
                        newButton.addEventListener('click', function() {
                            const transactionId = this.getAttribute('data-id');
                            viewTransactionDetails(transactionId);
                        });
                    });
                    
                    // Fix the close button using the same approach as pos.js
                    const closeButton = popup.querySelector('.swal2-close');
                    if (closeButton) {
                        // Clone and replace to remove any previous event listeners
                        const newCloseButton = closeButton.cloneNode(true);
                        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
                        
                        newCloseButton.onclick = () => {
                            console.log("Close button clicked");
                            closeSwalModal();
                        };
                    }
                    
                    // Handle ESC key with proper cleanup
                    document.addEventListener('keydown', function escHandler(e) {
                        if (e.key === 'Escape') {
                            closeSwalModal();
                            document.removeEventListener('keydown', escHandler);
                        }
                    });
                    
                    // Handle outside click with proper cleanup
                    popup.addEventListener('click', function outsideClickHandler(e) {
                        if (e.target === popup) {
                            closeSwalModal();
                            popup.removeEventListener('click', outsideClickHandler);
                        }
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
                showCloseButton: true, // Explicitly enable close button
                allowOutsideClick: true, // Allow clicking outside to close
                allowEscapeKey: true, // Allow ESC key to close
                didOpen: (popup) => {
                    // Add listener for mock data button
                    document.getElementById('useMockDataBtn').addEventListener('click', function() {
                        showMockTransactionHistory();
                        Swal.close();
                    });
                    
                    // Fix close button
                    const closeButton = popup.querySelector('.swal2-close');
                    if (closeButton) {
                        // Create new button to remove any existing listeners
                        const newCloseButton = closeButton.cloneNode(true);
                        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
                        
                        // Add new click handler
                        newCloseButton.addEventListener('click', () => {
                            Swal.close();
                        });
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    showTransactionHistory();
                }
            });
        }
    };
    
    // Function to handle Escape key press
    const closeOnEscape = (e) => {
        if (e.key === 'Escape') {
            console.log('Escape key pressed, closing modal');
            Swal.close();
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
                    <div class="transaction-header-item">Transaction ID</div>
                    <div class="transaction-header-item">Amount</div>
                    <div class="transaction-header-item">Date & Payment Method</div>
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
                    <div class="transaction-id">#${transaction.transaction_id}</div>
                    <div class="transaction-amount">₱${parseFloat(transaction.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div class="transaction-date">
                        <div class="transaction-date-value">${formattedDate}</div>
                        <div class="transaction-payment-method">
                            <i class="${paymentIcon}"></i> ${paymentMethod}
                        </div>
                    </div>
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
        
        // Store the mock history HTML for later use
        currentTransactionHistoryHTML = historyHTML;
        currentTransactionHistoryTitle = 'Transaction History (Mock Data)';
        
        // Show transaction history in SweetAlert
        Swal.fire({
            title: 'Transaction History (Mock Data)',
            html: historyHTML,
            showConfirmButton: false,
            showCloseButton: true, // Explicitly enable close button
            allowOutsideClick: true, // Allow clicking outside to close
            allowEscapeKey: true, // Allow ESC key to close
            background: '#141414',
            color: '#f5f5f5',
            width: 'auto', // Let the max-width setting control the size
            heightAuto: false,
            customClass: {
                popup: 'transaction-history-popup',
                confirmButton: 'transaction-history-button',
                title: 'transaction-history-title',
                htmlContainer: 'transaction-history-html-container',
                actions: 'transaction-history-actions',
                closeButton: 'history-close-button'
            },
            didOpen: (popup) => {
                // Add event listeners to view buttons
                document.querySelectorAll('.btn-view-transaction').forEach(button => {
                    button.addEventListener('click', function() {
                        const transactionId = this.getAttribute('data-id');
                        viewMockTransactionDetails(transactionId);
                    });
                });
                
                // Fix the close button using the same approach as pos.js
                const closeButton = popup.querySelector('.swal2-close');
                if (closeButton) {
                    closeButton.onclick = () => {
                        console.log("Close button clicked");
                        closeSwalModal();
                    };
                }
                
                // Handle ESC key
                document.addEventListener('keydown', function escHandler(e) {
                    if (e.key === 'Escape') {
                        closeSwalModal();
                        document.removeEventListener('keydown', escHandler);
                    }
                });
                
                // Handle outside click
                popup.addEventListener('click', function(e) {
                    if (e.target === popup) {
                        closeSwalModal();
                    }
                });
            }
        });
    };

    // Function to view transaction details
    const viewTransactionDetails = async (transactionId) => {
        try {
            // Show loading state with improved animation
            Swal.fire({
                title: 'Transaction Details',
                html: '<div class="loading-history"><i class="fas fa-file-invoice-dollar fa-spin"></i><p>Loading transaction details...</p></div>',
                showConfirmButton: false,
                allowOutsideClick: false,
                background: '#141414',
                color: '#f5f5f5',
                customClass: {
                    popup: 'transaction-details-popup'
                }
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
            
            // Show transaction details in an enhanced SweetAlert with formatted numbers
            Swal.fire({
                title: `Transaction #${transaction.transaction_id}`,
                html: `
                    <div class="transaction-details-container">
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
                showCloseButton: true, // Explicitly enable close button
                showConfirmButton: true,
                allowOutsideClick: true, // Allow clicking outside to close
                allowEscapeKey: true, // Allow ESC key to close
                confirmButtonText: '<i class="fas fa-arrow-left"></i> Back to History',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5',
                width: 'auto', // Let the max-width setting control the size
                heightAuto: false,
                customClass: {
                    popup: 'transaction-details-popup',
                    confirmButton: 'transaction-details-button',
                    title: 'transaction-details-title',
                    htmlContainer: 'transaction-details-html-container',
                    actions: 'transaction-details-actions',
                    closeButton: 'details-close-button'
                },
                didOpen: (popup) => {
                    // Add event listener for print receipt button
                    const printButton = document.getElementById('printTransactionReceipt');
                    if (printButton) {
                        // Clone and replace to remove any previous event listeners
                        const newPrintButton = printButton.cloneNode(true);
                        printButton.parentNode.replaceChild(newPrintButton, printButton);
                        
                        newPrintButton.addEventListener('click', function() {
                            // This will print the receipt for the current transaction
                            printTransactionReceipt(transaction);
                        });
                    }
                    
                    // Fix the close button using the same approach as pos.js
                    const closeButton = popup.querySelector('.swal2-close');
                    if (closeButton) {
                        // Clone and replace to remove any previous event listeners
                        const newCloseButton = closeButton.cloneNode(true);
                        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
                        
                        newCloseButton.onclick = () => {
                            console.log("Close button clicked");
                            closeSwalModal();
                        };
                    }
                    
                    // Handle ESC key with proper cleanup
                    document.addEventListener('keydown', function escHandler(e) {
                        if (e.key === 'Escape') {
                            closeSwalModal();
                            document.removeEventListener('keydown', escHandler);
                        }
                    });
                    
                    // Handle outside click with proper cleanup
                    popup.addEventListener('click', function outsideClickHandler(e) {
                        if (e.target === popup) {
                            closeSwalModal();
                            popup.removeEventListener('click', outsideClickHandler);
                        }
                    });
                },
                willClose: () => {
                    // Ensure we clean up any leftover content on modal close
                    const transactionDetailsContainers = document.querySelectorAll('.transaction-details');
                    transactionDetailsContainers.forEach(container => {
                        if (container && container.parentNode) {
                            container.innerHTML = '';
                        }
                    });
                }
            }).then((result) => {
                // If confirmed (Back to History button clicked), return to transaction history
                if (result.isConfirmed) {
                    showTransactionHistory(true); // Use the cached history
                } else {
                    // Also clean up when modal is dismissed via other means
                    const transactionDetailsContainers = document.querySelectorAll('.transaction-details');
                    transactionDetailsContainers.forEach(container => {
                        if (container && container.parentNode) {
                            container.innerHTML = '';
                        }
                    });
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
                showCloseButton: true, // Explicitly enable close button
                allowOutsideClick: true, // Allow clicking outside to close
                allowEscapeKey: true, // Allow ESC key to close
                confirmButtonText: '<i class="fas fa-arrow-left"></i> Back to History',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5',
                didOpen: (popup) => {
                    // Add listener for mock data button
                    document.getElementById('viewMockDetailsBtn')?.addEventListener('click', function() {
                        viewMockTransactionDetails(transactionId);
                        Swal.close();
                    });
                    
                    // Fix close button
                    const closeButton = popup.querySelector('.swal2-close');
                    if (closeButton) {
                        // Create new button to remove any existing listeners
                        const newCloseButton = closeButton.cloneNode(true);
                        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
                        
                        // Add new click handler
                        newCloseButton.addEventListener('click', () => {
                            Swal.close();
                        });
                    }
                }
            }).then((result) => {
                // If confirmed (Back to History button clicked), return to transaction history
                if (result.isConfirmed) {
                    showTransactionHistory(true); // Use the cached history
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
            showCloseButton: true, // Explicitly enable close button
            showConfirmButton: true,
            allowOutsideClick: true, // Allow clicking outside to close
            allowEscapeKey: true, // Allow ESC key to close
            confirmButtonText: '<i class="fas fa-arrow-left"></i> Back to History',
            confirmButtonColor: '#3498db',
            background: '#141414',
            color: '#f5f5f5',
            width: 'auto', // Let the max-width setting control the size
            heightAuto: false,
            customClass: {
                popup: 'transaction-details-popup',
                confirmButton: 'transaction-details-button',
                title: 'transaction-details-title',
                htmlContainer: 'transaction-details-html-container',
                actions: 'transaction-details-actions',
                closeButton: 'details-close-button'
            },
            didOpen: (popup) => {
                // Add event listener for print receipt button
                const printButton = document.getElementById('printTransactionReceipt');
                if (printButton) {
                    printButton.addEventListener('click', function() {
                        // This will print the receipt for the current transaction
                        printTransactionReceipt(transaction);
                    });
                }
                
                // Fix the close button using the same approach as pos.js
                const closeButton = popup.querySelector('.swal2-close');
                if (closeButton) {
                    // Clone and replace to remove any previous event listeners
                    const newCloseButton = closeButton.cloneNode(true);
                    closeButton.parentNode.replaceChild(newCloseButton, closeButton);
                    
                    newCloseButton.onclick = () => {
                        closeSwalModal();
                    };
                }
                
                // Handle ESC key with proper cleanup
                document.addEventListener('keydown', function escHandler(e) {
                    if (e.key === 'Escape') {
                        closeSwalModal();
                        document.removeEventListener('keydown', escHandler);
                    }
                });
                
                // Handle outside click with proper cleanup
                popup.addEventListener('click', function outsideClickHandler(e) {
                    if (e.target === popup) {
                        closeSwalModal();
                        popup.removeEventListener('click', outsideClickHandler);
                    }
                });
            },
            willClose: () => {
                // Ensure we clean up any leftover content on modal close
                const transactionDetailsContainers = document.querySelectorAll('.transaction-details');
                transactionDetailsContainers.forEach(container => {
                    if (container && container.parentNode) {
                        container.innerHTML = '';
                    }
                });
            }
        }).then((result) => {
            // If confirmed (Back to History button clicked), return to transaction history
            if (result.isConfirmed) {
                showMockTransactionHistory(); // Return to mock history
            } else {
                // Also clean up when modal is dismissed via other means
                const transactionDetailsContainers = document.querySelectorAll('.transaction-details');
                transactionDetailsContainers.forEach(container => {
                    if (container && container.parentNode) {
                        container.innerHTML = '';
                    }
                });
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
        if (initialized) {
            console.log('TransactionHistory already initialized');
            return;
        }
        
        console.log('Initializing TransactionHistory module');
        
        // Add styles
        addTransactionHistoryStyles();
        
        // Create the history modal
        createHistoryModal();
        
        // Add event listener to the history button
        const historyBtn = document.getElementById('historyBtn');
        if (historyBtn) {
            // Remove any existing event listeners to prevent duplicates
            const newHistoryBtn = historyBtn.cloneNode(true);
            historyBtn.parentNode.replaceChild(newHistoryBtn, historyBtn);
            
            newHistoryBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('History button clicked');
                showTransactionHistory();
            });
        }
        
        initialized = true;
    };

    // Function to create the history modal dynamically if it doesn't exist
    const createHistoryModal = () => {
        // Check if modal already exists
        if (document.getElementById('historyModal')) {
            return;
        }
        
        // Create the modal element
        const historyModal = document.createElement('div');
        historyModal.id = 'historyModal';
        historyModal.className = 'modal';
        
        // Set modal content
        historyModal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Transaction History</h2>
                <div class="history-list" id="historyList">
                    <!-- Transaction history will be loaded here -->
                </div>
            </div>
        `;
        
        // Append to document body
        document.body.appendChild(historyModal);
        
        // Add event listeners for closing the modal
        const closeBtn = historyModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeModal('historyModal');
            });
        }
        
        // Close modal when clicking outside the content
        historyModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal('historyModal');
            }
        });
    };

    // Public API - explicitly make showTransactionHistory available globally
    return {
        init,
        showTransactionHistory,
        viewTransactionDetails,
        showMockTransactionHistory, // New method for mock data
        viewMockTransactionDetails,  // New method for mock data
        closeModal, // Make closeModal available globally
        closeSwalModal  // Make closeSwalModal available globally
    };
})();

// Initialize the transaction history module when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded - initializing TransactionHistory module");
    TransactionHistory.init();
    
    // Add a global ESC key handler to close any open modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.querySelector('.swal2-container')) {
                if (window.Swal) Swal.close();
            }
            
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                if (modal.id) {
                    const closeFunc = window.closeModal || TransactionHistory.closeModal;
                    if (closeFunc) closeFunc(modal.id);
                } else {
                    modal.classList.remove('show');
                }
            });
        }
    });
});

// Make the showTransactionHistory function globally accessible for direct HTML onclick calls
window.TransactionHistory = TransactionHistory;
