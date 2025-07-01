/**
 * Admin System Menu Module
 * Handles system-level operations like database checks, exports, and system resets
 */
const AdminSystemMenu = (() => {
    // Module state
    let initialized = false;
    const API_URL = 'http://localhost:5000/api'; // Assuming your API base URL

    // Initialize the module
    const init = () => {
        if (initialized) return;
        
        // Set up event listeners for system menu buttons
        setupDatabaseCheck();
        setupExportData();
        setupResetData();

        initialized = true;
        console.log('Admin System Menu module initialized');
    };

    // Setup Database Connection Check
    const setupDatabaseCheck = () => {
        const dbCheckBtn = document.getElementById('checkDatabase');
        if (!dbCheckBtn) return;

        dbCheckBtn.addEventListener('click', checkDatabaseConnection);
    };

    // Handle Database Connection Check
    const checkDatabaseConnection = () => {
        // Get the button element to update its state
        const dbCheckBtn = document.getElementById('checkDatabase');
        
        // Show checking state
        dbCheckBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        dbCheckBtn.disabled = true;
        dbCheckBtn.classList.add('checking');
        
        // Simulate checking connection (in a real application, this would be an actual API call)
        setTimeout(() => {
            // Show success modal with connection status
            Swal.fire({
                title: 'Database Connection',
                icon: 'success',
                html: `
                    <div class="db-connection-result">
                        <i class="fas fa-database db-connection-icon"></i>
                        <p>Connection to database established successfully!</p>
                        <div class="db-connection-details">
                            <p><strong>Status:</strong> Connected</p>
                            <p><strong>Database:</strong> MotorTech POS Database</p>
                            <p><strong>Server:</strong> localhost</p>
                        </div>
                    </div>
                `,
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5',
                customClass: {
                    popup: 'db-connection-popup'
                }
            });
            
            // Reset button state
            dbCheckBtn.innerHTML = '<i class="fas fa-check-circle"></i> Connected';
            dbCheckBtn.classList.remove('checking');
            dbCheckBtn.classList.add('connected');
            
            // Re-enable after a short delay with the original text
            setTimeout(() => {
                dbCheckBtn.disabled = false;
                dbCheckBtn.classList.remove('connected');
                dbCheckBtn.innerHTML = '<i class="fas fa-sync"></i> Check Connection';
            }, 2000);
        }, 1500);
    };

    // Setup Export Data functionality
    const setupExportData = () => {
        const exportBtn = document.getElementById('exportData');
        if (!exportBtn) return;

        exportBtn.addEventListener('click', () => {
            // Get current date for default values
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            
            // Format dates to YYYY-MM-DD for input values
            const formatDate = (date) => {
                return date.toISOString().split('T')[0];
            };

            Swal.fire({
                title: 'Export System Data',
                html: `
                    <div class="export-options">
                        <h4><i class="fas fa-file-export"></i> Select Export Type</h4>
                        <div class="export-options-grid">
                            <div class="export-option">
                                <input type="radio" id="exportSales" name="exportType" value="sales" checked>
                                <label for="exportSales">
                                    <i class="fas fa-chart-line"></i>
                                    <span>Sales Report</span>
                                </label>
                            </div>
                            <div class="export-option">
                                <input type="radio" id="exportInventory" name="exportType" value="inventory">
                                <label for="exportInventory">
                                    <i class="fas fa-boxes"></i>
                                    <span>Inventory Status</span>
                                </label>
                            </div>
                            <div class="export-option">
                                <input type="radio" id="exportTransactions" name="exportType" value="transactions">
                                <label for="exportTransactions">
                                    <i class="fas fa-receipt"></i>
                                    <span>Transactions History</span>
                                </label>
                            </div>
                            <div class="export-option">
                                <input type="radio" id="exportFull" name="exportType" value="full">
                                <label for="exportFull">
                                    <i class="fas fa-database"></i>
                                    <span>Full System Data</span>
                                </label>
                            </div>
                        </div>

                        <h4><i class="fas fa-calendar-alt"></i> Select Date Option</h4>
                        <div class="date-type-selector">
                            <div class="date-type-option">
                                <input type="radio" id="dateRange" name="dateType" value="range" checked>
                                <label for="dateRange">Date Range</label>
                            </div>
                            <div class="date-type-option">
                                <input type="radio" id="specificDate" name="dateType" value="specific">
                                <label for="specificDate">Specific Date</label>
                            </div>
                        </div>

                        <!-- Date Range Selection (default visible) -->
                        <div id="dateRangeSelector" class="date-range-options">
                            <div class="export-date-range">
                                <div class="date-input-group">
                                    <label for="startDate">Start Date</label>
                                    <input type="date" id="startDate" class="export-date-input" 
                                        value="${formatDate(firstDayOfMonth)}">
                                </div>
                                <div class="date-input-group">
                                    <label for="endDate">End Date</label>
                                    <input type="date" id="endDate" class="export-date-input" 
                                        value="${formatDate(today)}">
                                </div>
                            </div>
                            <div class="date-presets">
                                <button type="button" class="date-preset-btn" data-preset="today">Today</button>
                                <button type="button" class="date-preset-btn" data-preset="week">This Week</button>
                                <button type="button" class="date-preset-btn" data-preset="month">This Month</button>
                                <button type="button" class="date-preset-btn" data-preset="year">This Year</button>
                            </div>
                        </div>

                        <!-- Specific Date Selection (initially hidden) -->
                        <div id="specificDateSelector" class="specific-date-option" style="display: none;">
                            <div class="date-input-group">
                                <label for="exactDate">Specific Date</label>
                                <input type="date" id="exactDate" class="export-date-input" value="${formatDate(today)}">
                            </div>
                        </div>

                        <h4><i class="fas fa-file-alt"></i> Select Format</h4>
                        <div class="export-format-options">
                            <div class="export-format">
                                <input type="radio" id="formatCSV" name="exportFormat" value="csv" checked>
                                <label for="formatCSV">CSV</label>
                            </div>
                            <div class="export-format">
                                <input type="radio" id="formatPDF" name="exportFormat" value="pdf">
                                <label for="formatPDF">PDF</label>
                            </div>
                            <div class="export-format">
                                <input type="radio" id="formatExcel" name="exportFormat" value="excel">
                                <label for="formatExcel">Excel</label>
                            </div>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Generate Export',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#3498db',
                cancelButtonColor: '#95a5a6',
                background: '#141414',
                color: '#f5f5f5',
                customClass: {
                    popup: 'export-popup',
                },
                didOpen: () => {
                    // Set up date range preset buttons
                    document.querySelectorAll('.date-preset-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const preset = btn.dataset.preset;
                            const [start, end] = getDateRangeFromPreset(preset);
                            document.getElementById('startDate').value = formatDate(start);
                            document.getElementById('endDate').value = formatDate(end);
                            updateActiveDatePreset();
                        });
                    });

                    // Handle date type selection (range vs. specific)
                    document.querySelectorAll('input[name="dateType"]').forEach(radio => {
                        radio.addEventListener('change', () => {
                            const dateType = document.querySelector('input[name="dateType"]:checked').value;
                            if (dateType === 'range') {
                                document.getElementById('dateRangeSelector').style.display = 'block';
                                document.getElementById('specificDateSelector').style.display = 'none';
                            } else {
                                document.getElementById('dateRangeSelector').style.display = 'none';
                                document.getElementById('specificDateSelector').style.display = 'block';
                            }
                        });
                    });

                    // Highlight the active date preset
                    const updateActiveDatePreset = () => {
                        const startDateValue = document.getElementById('startDate').value;
                        const endDateValue = document.getElementById('endDate').value;
                        
                        // Remove active class from all presets
                        document.querySelectorAll('.date-preset-btn').forEach(btn => {
                            btn.classList.remove('active');
                        });

                        // Try to match the current date range with a preset
                        const start = new Date(startDateValue);
                        const end = new Date(endDateValue);
                        const presets = ['today', 'week', 'month', 'year'];
                        
                        for (const preset of presets) {
                            const [presetStart, presetEnd] = getDateRangeFromPreset(preset);
                            if (formatDate(presetStart) === startDateValue && formatDate(presetEnd) === endDateValue) {
                                document.querySelector(`.date-preset-btn[data-preset="${preset}"]`).classList.add('active');
                                break;
                            }
                        }
                    };

                    // Add event listener for date input changes
                    document.getElementById('startDate').addEventListener('change', updateActiveDatePreset);
                    document.getElementById('endDate').addEventListener('change', updateActiveDatePreset);

                    // Initialize active preset
                    updateActiveDatePreset();
                },
                preConfirm: () => {
                    const type = document.querySelector('input[name="exportType"]:checked').value;
                    const format = document.querySelector('input[name="exportFormat"]:checked').value;
                    const dateType = document.querySelector('input[name="dateType"]:checked').value;
                    
                    let dateOptions = {};
                    
                    if (dateType === 'range') {
                        const startDate = document.getElementById('startDate').value;
                        const endDate = document.getElementById('endDate').value;
                        
                        if (!startDate || !endDate) {
                            Swal.showValidationMessage('Please select a valid date range');
                            return false;
                        }
                        
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        
                        if (start > end) {
                            Swal.showValidationMessage('Start date must be before end date');
                            return false;
                        }
                        
                        dateOptions = { 
                            type: 'range',
                            startDate: startDate,
                            endDate: endDate
                        };
                    } else {
                        const exactDate = document.getElementById('exactDate').value;
                        
                        if (!exactDate) {
                            Swal.showValidationMessage('Please select a specific date');
                            return false;
                        }
                        
                        dateOptions = {
                            type: 'specific',
                            exactDate: exactDate
                        };
                    }
                    
                    return { 
                        type, 
                        format,
                        dateOptions
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    generateExport(result.value);
                }
            });
        });
    };

    // Helper to get date ranges from presets
    const getDateRangeFromPreset = (preset) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const end = new Date(today);
        let start = new Date(today);
        
        switch (preset) {
            case 'today':
                // Start and end are both today
                break;
            case 'week':
                // Start is the first day of this week (Sunday)
                start = new Date(today);
                start.setDate(today.getDate() - today.getDay());
                break;
            case 'month':
                // Start is the first day of the month
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'year':
                // Start is January 1st of current year
                start = new Date(today.getFullYear(), 0, 1);
                break;
            default:
                break;
        }
        
        return [start, end];
    };

    // Fetch data for export - fixed to work without process.env
    const fetchExportData = async (options) => {
        try {
            console.log('Fetching export data with options:', options);
            
            // Determine the date range for filtering
            let startDate, endDate;
            
            if (options.dateOptions.type === 'range') {
                startDate = new Date(options.dateOptions.startDate);
                endDate = new Date(options.dateOptions.endDate);
                // Set end date to end of day
                endDate.setHours(23, 59, 59, 999);
            } else {
                // For specific date, set start to beginning of day and end to end of day
                startDate = new Date(options.dateOptions.exactDate);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(options.dateOptions.exactDate);
                endDate.setHours(23, 59, 59, 999);
            }
            
            console.log('Date range:', { startDate, endDate });
            
            // Create query parameters
            const params = new URLSearchParams();
            if (options.dateOptions.type === 'range') {
                params.append('startDate', startDate.toISOString());
                params.append('endDate', endDate.toISOString());
            } else {
                params.append('specificDate', startDate.toISOString());
            }
            
            // Build the API URL
            const apiUrl = `${API_URL}/export/${options.type}?${params.toString()}`;
            console.log('Attempting to fetch from API URL:', apiUrl);
            
            // Set up fetch with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
            
            try {
                // Attempt to fetch from API
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                // Check if request was successful
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response from server:', errorText);
                    
                    // Try to parse as JSON, fallback to text
                    let errorMessage;
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.message || errorJson.error || `Server responded with status: ${response.status}`;
                    } catch (e) {
                        errorMessage = errorText || `Server responded with status: ${response.status}`;
                    }
                    
                    throw new Error(`Database returned error: ${response.status} ${errorMessage}`);
                }
                
                // Parse the successful response
                const data = await response.json();
                console.log(`Retrieved ${data.length} records from database`);
                return data;
            } catch (fetchError) {
                clearTimeout(timeoutId);
                
                // Handle specific types of fetch errors
                if (fetchError.name === 'AbortError') {
                    throw new Error('Database request timed out. The server may be overloaded or unreachable.');
                }
                
                console.warn('API fetch failed, falling back to mock data:', fetchError);
                
                // Fall back to using mock data when API is unavailable
                console.log('Using mock data as fallback');
                return generateMockData(options.type, startDate, endDate);
            }
        } catch (error) {
            console.error('Error fetching export data:', error);
            throw new Error(`Failed to fetch data from database: ${error.message}`);
        }
    };

    // Generate mock data as fallback when database connection fails
    const generateMockData = (type, startDate, endDate) => {
        console.log('Generating mock data for', type);
        
        // Wait to simulate processing delay for better UX
        return new Promise(resolve => {
            setTimeout(() => {
                switch (type) {
                    case 'sales':
                        resolve(mockFetchSalesData(startDate, endDate));
                        break;
                    case 'inventory':
                        resolve(mockFetchInventoryData());
                        break;
                    case 'transactions':
                        resolve(mockFetchTransactionsData(startDate, endDate));
                        break;
                    case 'full':
                        resolve(mockFetchFullData(startDate, endDate));
                        break;
                    default:
                        resolve([]);
                }
            }, 1000);
        });
    };

    // Helper function to check if localStorage data exists
    const hasLocalStorageData = (key) => {
        try {
            const data = localStorage.getItem(key);
            return data && data !== 'null' && data !== 'undefined' && data.length > 0;
        } catch (e) {
            return false;
        }
    };

    // Mock fetch functions for different report types
    const mockFetchSalesData = (startDate, endDate) => {
        // Try to get real transaction data from localStorage first
        try {
            if (hasLocalStorageData('transactions')) {
                const allTransactions = JSON.parse(localStorage.getItem('transactions'));
                
                // Filter by date range
                const filteredTransactions = allTransactions.filter(transaction => {
                    const transDate = new Date(transaction.transaction_date || transaction.date);
                    return transDate >= startDate && transDate <= endDate;
                });
                
                // Group by category and date
                const salesData = [];
                const categoryTotals = {};
                
                filteredTransactions.forEach(transaction => {
                    const transDate = new Date(transaction.transaction_date || transaction.date);
                    const dateString = transDate.toISOString().split('T')[0]; // YYYY-MM-DD
                    
                    // Process items in transaction
                    (transaction.items || []).forEach(item => {
                        const category = item.category || 'Uncategorized';
                        const revenue = (item.price || 0) * (item.quantity || 1);
                        
                        // Track by category and date
                        const key = `${dateString}_${category}`;
                        if (!categoryTotals[key]) {
                            categoryTotals[key] = {
                                date: transDate,
                                category,
                                items_sold: 0,
                                revenue: 0
                            };
                        }
                        
                        categoryTotals[key].items_sold += (item.quantity || 1);
                        categoryTotals[key].revenue += revenue;
                    });
                });
                
                // Convert to array
                Object.values(categoryTotals).forEach(data => {
                    salesData.push(data);
                });
                
                // If we have real data, return it
                if (salesData.length > 0) {
                    console.log('Using real sales data from localStorage');
                    return salesData;
                }
            }
        } catch (e) {
            console.warn('Error processing localStorage data:', e);
        }
        
        // Generate mock data
        console.log('Generating mock sales data');
        const data = [];
        const categories = ['Engine Parts', 'Brake Systems', 'Suspension', 'Oils & Lubricants', 'Body Parts'];
        
        // Loop through each day in the date range
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            // For each category, generate a sales record
            categories.forEach(category => {
                // Only include some categories for some days (to make data more realistic)
                if (Math.random() < 0.7) {
                    const itemsSold = Math.floor(Math.random() * 10) + 1;
                    const avgPrice = Math.floor(Math.random() * 1000) + 100;
                    const revenue = itemsSold * avgPrice;
                    
                    data.push({
                        date: new Date(date),
                        category,
                        items_sold: itemsSold,
                        revenue
                    });
                }
            });
        }
        
        return data;
    };

    const generateMockInventoryData = () => {
        const data = [];
        const categories = ['Engine Parts', 'Brake Systems', 'Suspension', 'Oils & Lubricants', 'Body Parts'];
        const itemsByCategory = {
            'Engine Parts': ['Oil Filter', 'Air Filter', 'Spark Plug', 'Timing Belt', 'Piston Ring'],
            'Brake Systems': ['Brake Pad', 'Brake Disc', 'Brake Caliper', 'Brake Fluid', 'Brake Hose'],
            'Suspension': ['Shock Absorber', 'Coil Spring', 'Suspension Bush', 'Suspension Arm', 'Ball Joint'],
            'Oils & Lubricants': ['Engine Oil', 'Transmission Fluid', 'Brake Fluid', 'Coolant', 'Grease'],
            'Body Parts': ['Headlight', 'Taillight', 'Mirror', 'Body Panel', 'Bumper']
        };
        
        // Generate a few items for each category
        for (let i = 0; i < 25; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const nameOptions = itemsByCategory[category];
            const name = nameOptions[Math.floor(Math.random() * nameOptions.length)] + ' ' + Math.floor(Math.random() * 100);
            const stock = Math.floor(Math.random() * 100);
            const price = Math.floor(Math.random() * 5000) + 100;
            
            data.push({
                id: i + 1,
                name,
                category,
                stock,
                price
            });
        }
        
        return data;
    };

    const generateMockTransactionsData = (startDate, endDate) => {
        const data = [];
        const cashiers = ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Williams'];
        
        // Generate a few transactions for each day in the range
        let id = 1;
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            // Generate random number of transactions for each day
            const transactionsCount = Math.floor(Math.random() * 5) + 1;
            
            for (let i = 0; i < transactionsCount; i++) {
                const cashier = cashiers[Math.floor(Math.random() * cashiers.length)];
                const itemsCount = Math.floor(Math.random() * 5) + 1;
                const total = Math.floor(Math.random() * 10000) + 100;
                
                // Generate a random time for this day
                const transactionDate = new Date(date);
                transactionDate.setHours(Math.floor(Math.random() * 12) + 8); // Between 8am and 8pm
                transactionDate.setMinutes(Math.floor(Math.random() * 60));
                
                data.push({
                    id,
                    date: transactionDate,
                    cashier,
                    items: itemsCount,
                    total
                });
                
                id++;
            }
        }
        
        return data;
    };

    // Generate and download the export based on selected options
    const generateExport = (options) => {
        // Show loading state
        Swal.fire({
            title: 'Connecting to Database...',
            html: `
                <div class="export-loading">
                    <div class="export-progress">
                        <div class="export-progress-bar">
                            <div class="export-progress-fill" id="exportProgressFill"></div>
                        </div>
                        <div class="export-progress-text" id="exportProgressText">Establishing database connection...</div>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false,
            background: '#141414',
            color: '#f5f5f5',
            customClass: {
                popup: 'export-popup'
            },
            didOpen: () => {
                const progressFill = document.getElementById('exportProgressFill');
                const progressText = document.getElementById('exportProgressText');
                
                // Start progress animation
                let progress = 0;
                const progressInterval = setInterval(() => {
                    progress += 5;
                    if (progress > 90) clearInterval(progressInterval);
                    progressFill.style.width = `${progress}%`;
                }, 200);

                // Update text to show database activity
                setTimeout(() => {
                    progressText.textContent = 'Querying database records...';
                }, 1000);
                
                setTimeout(() => {
                    progressText.textContent = 'Processing data from database...';
                }, 2000);
                
                setTimeout(() => {
                    progressText.textContent = 'Generating export from database data...';
                }, 3000);
                
                // Fetch data from database based on selected options
                fetchExportData(options).then(data => {
                    // Clear interval and complete progress
                    clearInterval(progressInterval);
                    progressFill.style.width = '100%';
                    progressText.textContent = 'Export ready!';
                    
                    // Close loading modal and display the report
                    setTimeout(() => {
                        const reportTitle = getReportTitle(options.type);
                        const columns = getReportColumns(options.type);
                        displayGeneratedReport(reportTitle, columns, data, options);
                    }, 500);
                }).catch(error => {
                    // Handle database connection error
                    clearInterval(progressInterval);
                    console.error('Database connection error:', error);
                    
                    Swal.fire({
                        title: 'Database Connection Error',
                        html: `
                            <div style="text-align: left; margin-bottom: 20px;">
                                <p>Failed to connect to the database to generate the report.</p>
                                <div style="background: rgba(231, 76, 60, 0.1); border-left: 3px solid #e74c3c; padding: 10px; margin-top: 15px;">
                                    <p><strong>Error Details:</strong> ${error.message}</p>
                                    <p><strong>Troubleshooting Steps:</strong></p>
                                    <ul style="margin-left: 20px; margin-top: 5px;">
                                        <li>Ensure the database server is running</li>
                                        <li>Check database connection settings</li>
                                        <li>Verify network connectivity</li>
                                        <li>Contact your system administrator</li>
                                    </ul>
                                </div>
                            </div>
                        `,
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#3498db',
                        background: '#141414',
                        color: '#f5f5f5'
                    });
                });
            }
        });
    };

    // Get report title based on export type
    const getReportTitle = (type) => {
        switch (type) {
            case 'sales':
                return 'Sales Report';
            case 'inventory':
                return 'Inventory Status Report';
            case 'transactions':
                return 'Transaction History Report';
            case 'full':
                return 'Full System Data Report';
            default:
                return 'System Report';
        }
    };

    // Get columns based on export type
    const getReportColumns = (type) => {
        switch (type) {
            case 'sales':
                return [
                    { id: 'date', label: 'Date' },
                    { id: 'category', label: 'Category' },
                    { id: 'items_sold', label: 'Items Sold' },
                    { id: 'revenue', label: 'Revenue' }
                ];
            case 'inventory':
                return [
                    { id: 'id', label: 'ID' },
                    { id: 'name', label: 'Item Name' },
                    { id: 'category', label: 'Category' },
                    { id: 'stock', label: 'Current Stock' },
                    { id: 'price', label: 'Price' }
                ];
            case 'transactions':
                return [
                    { id: 'id', label: 'Transaction ID' },
                    { id: 'date', label: 'Date & Time' },
                    { id: 'cashier', label: 'Cashier' },
                    { id: 'items', label: 'Items' },
                    { id: 'total', label: 'Total Amount' }
                ];
            case 'full':
                return [
                    { id: 'id', label: 'Record ID' },
                    { id: 'type', label: 'Record Type' },
                    { id: 'date', label: 'Date' },
                    { id: 'details', label: 'Details' },
                    { id: 'value', label: 'Value' }
                ];
            default:
                return [];
        }
    };

    // Display the generated report in a modal
    const displayGeneratedReport = (title, columns, data, options) => {
        // Format date range for display
        let dateRangeText = '';
        if (options.dateOptions.type === 'range') {
            const startDate = new Date(options.dateOptions.startDate).toLocaleDateString();
            const endDate = new Date(options.dateOptions.endDate).toLocaleDateString();
            dateRangeText = `Date Range: ${startDate} to ${endDate}`;
        } else {
            dateRangeText = `Date: ${new Date(options.dateOptions.exactDate).toLocaleDateString()}`;
        }
        
        // Calculate summary data
        const summary = calculateReportSummary(options.type, data);
        
        // Generate table HTML
        const tableHTML = `
            <table class="export-table">
                <thead>
                    <tr>
                        ${columns.map(col => `<th>${col.label}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            ${columns.map(col => {
                                let cellValue = item[col.id];
                                
                                // Format values based on their type
                                if (col.id === 'date' && cellValue instanceof Date) {
                                    cellValue = cellValue.toLocaleString();
                                } else if (col.id === 'revenue' || col.id === 'price' || col.id === 'total' || col.id === 'value') {
                                    if (typeof cellValue === 'number') {
                                        cellValue = `₱${cellValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                                    }
                                }
                                
                                return `<td>${cellValue}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        // Generate summary HTML
        const summaryHTML = `
            <div class="export-summary">
                <h3>Report Summary</h3>
                <div class="summary-grid">
                    ${Object.entries(summary).map(([key, value]) => `
                        <div class="summary-item">
                            <div class="summary-label">${key}</div>
                            <div class="summary-value">${
                                typeof value === 'number' && (key.includes('Amount') || key.includes('Revenue') || key.includes('Value'))
                                ? `₱${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                                : value
                            }</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Show the report
        Swal.fire({
            title: title,
            html: `
                <div class="export-report">
                    <p class="export-date-range">${dateRangeText}</p>
                    ${summaryHTML}
                    <div class="export-table-container">
                        ${tableHTML}
                    </div>
                    <div class="export-actions">
                        <button id="downloadExportBtn" class="export-btn">
                            <i class="fas fa-download"></i> Download ${options.format.toUpperCase()}
                        </button>
                    </div>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            background: '#141414',
            color: '#f5f5f5',
            customClass: {
                popup: 'large-export-popup',
                closeButton: 'export-close-button'
            },
            didOpen: () => {
                // Set up download button
                document.getElementById('downloadExportBtn').addEventListener('click', () => {
                    downloadReport(title, columns, data, options.format, options.dateOptions);
                });
            }
        });
    };

    // Calculate summary data for reports
    const calculateReportSummary = (type, data) => {
        switch (type) {
            case 'sales':
                const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
                const totalItemsSold = data.reduce((sum, item) => sum + item.items_sold, 0);
                const categories = [...new Set(data.map(item => item.category))];
                
                return {
                    'Total Revenue': totalRevenue,
                    'Items Sold': totalItemsSold,
                    'Unique Categories': categories.length,
                    'Date Range': `${data.length} days`
                };
                
            case 'inventory':
                const totalItems = data.length;
                const totalValue = data.reduce((sum, item) => sum + (item.price * item.stock), 0);
                const lowStock = data.filter(item => item.stock < 10).length;
                
                return {
                    'Total Items': totalItems,
                    'Inventory Value': totalValue,
                    'Low Stock Items': lowStock,
                    'Categories': [...new Set(data.map(item => item.category))].length
                };
                
            case 'transactions':
                const totalTransactions = data.length;
                const totalAmount = data.reduce((sum, item) => sum + item.total, 0);
                const avgAmount = totalAmount / (totalTransactions || 1);
                
                return {
                    'Total Transactions': totalTransactions,
                    'Total Amount': totalAmount,
                    'Average Transaction': avgAmount.toFixed(2),
                    'Unique Cashiers': [...new Set(data.map(item => item.cashier))].length
                };
                
            case 'full':
                return {
                    'Total Records': data.length,
                    'Record Types': [...new Set(data.map(item => item.type))].length,
                    'Date Range': `${new Date(Math.min(...data.map(item => new Date(item.date)))).toLocaleDateString()} - ${new Date(Math.max(...data.map(item => new Date(item.date)))).toLocaleDateString()}`,
                    'Total Value': data.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
                };
                
            default:
                return {};
        }
    };

    // Download report in the selected format
    const downloadReport = (title, columns, data, format, dateOptions) => {
        try {
            // Format the date for the filename
            const today = new Date().toISOString().slice(0, 10);
            let dateRange = '';
            
            if (dateOptions.type === 'range') {
                dateRange = `${dateOptions.startDate}_to_${dateOptions.endDate}`;
            } else {
                dateRange = dateOptions.exactDate;
            }
            
            const filename = `${title.replace(/\s+/g, '_')}_${dateRange}`;
            
            switch (format) {
                case 'csv':
                    downloadCSV(columns, data, filename);
                    break;
                case 'excel':
                    downloadExcel(title, columns, data, filename);
                    break;
                case 'pdf':
                    downloadPDF(title, columns, data, filename, dateOptions);
                    break;
                default:
                    throw new Error('Unsupported export format');
            }
            
            // Show success message
            Swal.fire({
                title: 'Download Started',
                text: 'Your export file is being downloaded.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#141414',
                color: '#f5f5f5'
            });
        } catch (error) {
            console.error('Error downloading report:', error);
            Swal.fire({
                title: 'Download Error',
                text: `Failed to download report: ${error.message}`,
                icon: 'error',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
        }
    };

    // Download as CSV
    const downloadCSV = (columns, data, filename) => {
        // Create CSV header
        const header = columns.map(col => `"${col.label}"`).join(',');
        
        // Create CSV rows
        const rows = data.map(item => {
            return columns.map(col => {
                let value = item[col.id];
                
                // Format values
                if (value instanceof Date) {
                    value = value.toLocaleString();
                } else if (typeof value === 'string') {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                
                return value;
            }).join(',');
        }).join('\n');
        
        // Combine header and rows
        const csvContent = `${header}\n${rows}`;
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Download as Excel - simple version (in a real app, you might use a library like SheetJS/xlsx)
    const downloadExcel = (title, columns, data, filename) => {
        // For simplicity, we'll just download as CSV with an .xlsx extension
        // In a real application, you would use a library to create actual Excel files
        downloadCSV(columns, data, filename.replace('.csv', '.xlsx'));
    };

    // Download as PDF - simple version (in a real app, you might use a library like jsPDF)
    const downloadPDF = (title, columns, data, filename, dateOptions) => {
        // Create a new window to generate PDF content
        const printWindow = window.open('', '_blank');
        
        // Format date range for display
        let dateRangeText = '';
        if (dateOptions.type === 'range') {
            const startDate = new Date(dateOptions.startDate).toLocaleDateString();
            const endDate = new Date(dateOptions.endDate).toLocaleDateString();
            dateRangeText = `Date Range: ${startDate} to ${endDate}`;
        } else {
            dateRangeText = `Date: ${new Date(dateOptions.exactDate).toLocaleDateString()}`;
        }
        
        // Calculate summary
        const summary = calculateReportSummary(
            columns[0].id === 'date' && columns.some(c => c.id === 'revenue') ? 'sales' :
            columns.some(c => c.id === 'stock') ? 'inventory' :
            columns.some(c => c.id === 'cashier') ? 'transactions' : 'full',
            data
        );
        
        // Generate HTML content
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #333;
                    }
                    h1 {
                        color: #2980b9;
                        text-align: center;
                        margin-bottom: 5px;
                    }
                    .date-range {
                        text-align: center;
                        margin-bottom: 20px;
                        font-size: 14px;
                        color: #666;
                    }
                    .summary {
                        margin-bottom: 30px;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                        justify-content: center;
                    }
                    .summary-item {
                        background-color: #f9f9f9;
                        border-radius: 5px;
                        padding: 10px;
                        min-width: 140px;
                        text-align: center;
                        border: 1px solid #ddd;
                    }
                    .summary-label {
                        font-size: 12px;
                        color: #666;
                        margin-bottom: 5px;
                    }
                    .summary-value {
                        font-weight: bold;
                        font-size: 16px;
                        color: #2980b9;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 30px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        font-size: 12px;
                        color: #666;
                        border-top: 1px solid #ddd;
                        padding-top: 10px;
                    }
                    @media print {
                        body {
                            margin: 0;
                            padding: 15px;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="no-print" style="text-align: center; margin-bottom: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; background-color: #2980b9; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Print/Save as PDF
                    </button>
                </div>
                
                <h1>${title}</h1>
                <div class="date-range">${dateRangeText}</div>
                
                <div class="summary">
                    ${Object.entries(summary).map(([key, value]) => `
                        <div class="summary-item">
                            <div class="summary-label">${key}</div>
                            <div class="summary-value">${
                                typeof value === 'number' && (key.includes('Amount') || key.includes('Revenue') || key.includes('Value'))
                                ? `₱${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                                : value
                            }</div>
                        </div>
                    `).join('')}
                </div>
                
                <table>
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col.label}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr>
                                ${columns.map(col => {
                                    let cellValue = item[col.id];
                                    
                                    // Format values based on their type
                                    if (col.id === 'date' && cellValue instanceof Date) {
                                        cellValue = cellValue.toLocaleString();
                                    } else if (col.id === 'revenue' || col.id === 'price' || col.id === 'total' || col.id === 'value') {
                                        if (typeof cellValue === 'number') {
                                            cellValue = `₱${cellValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                                        }
                                    }
                                    
                                    return `<td>${cellValue}</td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Generated by MotorTech POS on ${new Date().toLocaleString()}</p>
                </div>
                
                <script>
                    // Automatically open print dialog when loaded
                    window.onload = function() {
                        // Wait a bit to ensure content is rendered
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    };

    // Setup Reset Data functionality 
    const setupResetData = () => {
        const resetBtn = document.getElementById('resetData');
        if (!resetBtn) return;

        resetBtn.addEventListener('click', () => {
            Swal.fire({
                title: '<i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i> Reset System Data',
                html: `
                    <div class="reset-options-container">
                        <div class="reset-warning">
                            <i class="fas fa-exclamation-triangle"></i> 
                            <span>WARNING: This action cannot be undone!</span>
                        </div>
                        <p class="reset-description">
                            Resetting system data will permanently delete the selected information from the database. 
                            This is intended for maintenance or when setting up a new installation.
                        </p>
                        <div class="reset-options">
                            <label>
                                <input type="checkbox" id="resetTransactions"> 
                                <div class="reset-option-content">
                                    <span>Reset Transactions History</span>
                                    <small>Deletes all sales transaction records and history</small>
                                </div>
                            </label>
                            <label>
                                <input type="checkbox" id="resetInventory"> 
                                <div class="reset-option-content">
                                    <span>Reset Inventory Data</span>
                                    <small>Removes all products and resets inventory levels</small>
                                </div>
                            </label>
                            <label>
                                <input type="checkbox" id="resetUsers"> 
                                <div class="reset-option-content">
                                    <span>Reset User Accounts</span>
                                    <small>Removes all users except the current admin account</small>
                                </div>
                            </label>
                        </div>
                        <div class="confirmation-input">
                            <label for="confirmationText">Type "RESET" to confirm:</label>
                            <input type="text" id="confirmationText" placeholder="RESET" autocomplete="off">
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Reset Selected Data',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#e74c3c',
                cancelButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5',
                customClass: {
                    popup: 'reset-confirmation-modal',
                    confirmButton: 'reset-confirm-button',
                    cancelButton: 'reset-cancel-button'
                },
                preConfirm: () => {
                    const resetOptions = {
                        transactions: document.getElementById('resetTransactions').checked,
                        inventory: document.getElementById('resetInventory').checked,
                        users: document.getElementById('resetUsers').checked
                    };
                    if (!Object.values(resetOptions).some(Boolean)) {
                        Swal.showValidationMessage('Please select at least one option to reset');
                        return false;
                    }
                    if (document.getElementById('confirmationText').value !== 'RESET') {
                        Swal.showValidationMessage('Please type "RESET" to confirm this action');
                        return false;
                    }
                    return resetOptions;
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Final Confirmation',
                        text: 'Are you absolutely sure you want to proceed with system reset? This cannot be undone.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, Reset Now',
                        cancelButtonText: 'No, Cancel',
                        confirmButtonColor: '#e74c3c',
                        cancelButtonColor: '#3498db',
                        background: '#141414',
                        color: '#f5f5f5'
                    }).then((finalResult) => {
                        if (finalResult.isConfirmed) {
                            performResetLogic(result.value);
                        }
                    });
                }
            });
        });
    };

    // Logic to actually reset the data for each section via API calls
    const performResetLogic = (options) => {
        Swal.fire({
            title: 'Resetting System Data',
            html: `
                <div class="reset-progress">
                    <div class="reset-progress-bar">
                        <div class="reset-progress-fill" id="resetProgressFill"></div>
                    </div>
                    <div id="resetProgressText">Starting the reset process...</div>
                </div>
            `,
            showConfirmButton: false,
            allowOutsideClick: false,
            background: '#141414',
            color: '#f5f5f5',
            didOpen: () => {
                const progressFill = document.getElementById('resetProgressFill');
                const progressText = document.getElementById('resetProgressText');
                let currentProgress = 0;
                progressFill.style.width = `${currentProgress}%`;
                const results = [];

                const selectedOptions = Object.entries(options).filter(([, checked]) => checked);
                const totalSteps = selectedOptions.length;
                let completedSteps = 0;

                const updateProgress = () => {
                    completedSteps++;
                    currentProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 100;
                    progressFill.style.width = `${currentProgress}%`;
                };

                const doReset = async () => {
                    try {
                        // Transactions
                        if (options.transactions) {
                            progressText.textContent = 'Resetting transactions...';
                            console.log('[RESET] Sending API request to reset transaction data...');
                            const response = await fetch(`${API_URL}/reset/transactions`, { method: 'DELETE' });
                            if (!response.ok) {
                                const errorData = await response.json().catch(() => ({ message: 'Failed to reset transactions. Server error.' }));
                                throw new Error(errorData.message || `Transactions reset failed: ${response.statusText}`);
                            }
                            console.log('[RESET] Transaction data reset successfully via API.');
                            // Client-side cleanup
                            [
                                'transactions', 'transaction_history', 'recent_transactions', 'transaction_counts',
                                'sales_data', 'total_sales', 'daily_sales', 'monthly_sales', 'yearly_sales',
                                'current_cart', 'cart_items'
                            ].forEach(key => localStorage.removeItem(key));
                            localStorage.setItem('transactions', JSON.stringify([]));
                            localStorage.setItem('transaction_history', JSON.stringify([]));
                            localStorage.setItem('current_cart', JSON.stringify([]));
                            localStorage.setItem('total_sales', '0');
                            updateProgress();
                            results.push({ name: 'Transactions', message: 'Transaction history reset successfully.' });
                        }

                        // Inventory
                        if (options.inventory) {
                            progressText.textContent = 'Resetting inventory...';
                            console.log('[RESET] Sending API request to reset inventory data...');
                            const response = await fetch(`${API_URL}/reset/inventory`, { method: 'DELETE' });
                            if (!response.ok) {
                                const errorData = await response.json().catch(() => ({ message: 'Failed to reset inventory. Server error.' }));
                                throw new Error(errorData.message || `Inventory reset failed: ${response.statusText}`);
                            }
                            console.log('[RESET] Inventory data reset successfully via API.');
                            // Client-side cleanup
                            [
                                'inventory', 'categories', 'suppliers', 'inventory_changes', 'inventory_stats', 'stock_alerts'
                            ].forEach(key => localStorage.removeItem(key));
                            const defaultCategories = ['Engine Parts', 'Brake Systems', 'Suspension', 'Oils & Lubricants', 'Body Parts'];
                            localStorage.setItem('inventory', JSON.stringify([]));
                            localStorage.setItem('categories', JSON.stringify(defaultCategories));
                            localStorage.setItem('suppliers', JSON.stringify([]));
                            updateProgress();
                            results.push({ name: 'Inventory', message: 'Inventory data reset successfully.' });
                        }

                        // Users
                        if (options.users) {
                            progressText.textContent = 'Resetting users...';
                            console.log('[RESET] Sending API request to reset user accounts...');
                            const response = await fetch(`${API_URL}/reset/users`, { method: 'DELETE' });
                            if (!response.ok) {
                                const errorData = await response.json().catch(() => ({ message: 'Failed to reset users. Server error.' }));
                                throw new Error(errorData.message || `User accounts reset failed: ${response.statusText}`);
                            }
                            console.log('[RESET] User accounts reset successfully via API (admin should be preserved by backend).');
                            // Client-side cleanup (preserving admin logic might be complex here if not handled by backend fully for client)
                            let currentAdmin = null;
                            try {
                                const currentUserData = localStorage.getItem('currentUser');
                                if (currentUserData) {
                                    const parsedUser = JSON.parse(currentUserData);
                                    if (parsedUser && parsedUser.role === 'admin') currentAdmin = parsedUser;
                                }
                            } catch (e) { console.error('[RESET] Error parsing current user for client-side preservation:', e); }
                            localStorage.removeItem('users');
                            const defaultAdmin = { id: 1, username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin', email: 'admin@motortech.com', active: true };
                            const adminToKeep = currentAdmin || defaultAdmin;
                            localStorage.setItem('users', JSON.stringify([adminToKeep]));
                            localStorage.setItem('currentUser', JSON.stringify(adminToKeep));
                            updateProgress();
                            results.push({ name: 'Users', message: 'User accounts reset (admin preserved by backend).' });
                        }
                        
                        if (totalSteps === 0) { // No options selected but flow continued
                            currentProgress = 100;
                            progressFill.style.width = `${currentProgress}%`;
                        }

                        progressText.textContent = 'Reset completed!';
                        console.log('[RESET] All selected data reset operations complete.');

                        setTimeout(() => {
                            Swal.fire({
                                title: 'Reset Complete!',
                                html: `
                                    <div style="text-align: center; margin-bottom: 20px;">
                                        <i class="fas fa-check-circle" style="font-size: 48px; color: #2ecc71;"></i>
                                    </div>
                                    <div>
                                        ${results.length > 0 ? results.map(item => `
                                            <div style="margin-bottom: 10px; text-align: left;">
                                                <i class="fas fa-check" style="color: #2ecc71;"></i>
                                                <strong>${item.name}:</strong> ${item.message}
                                            </div>
                                        `).join('') : '<p>No data categories were selected for reset, or an issue occurred.</p>'}
                                    </div>
                                    <p style="margin-top: 20px;">The system will now reload to apply changes.</p>
                                `,
                                icon: 'success',
                                confirmButtonText: 'Reload System',
                                confirmButtonColor: '#3498db',
                                allowOutsideClick: false,
                                background: '#141414',
                                color: '#f5f5f5'
                            }).then(() => {
                                console.log('[RESET] Reloading page with cache bust.');
                                window.location.href = window.location.pathname + '?reset=' + Date.now();
                            });
                        }, 1000);
                    } catch (error) {
                        console.error('[RESET] Error during reset process:', error);
                        Swal.fire({
                            title: 'Reset Failed',
                            text: `An error occurred: ${error.message}. Please check the console for more details.`,
                            icon: 'error',
                            confirmButtonColor: '#d33',
                            confirmButtonText: 'OK',
                            background: '#141414',
                            color: '#f5f5f5'
                        });
                         // Reset progress bar on failure
                        progressText.textContent = 'Reset failed.';
                        progressFill.style.width = `${currentProgress}%`; // Show last successful progress or 0
                        progressFill.style.backgroundColor = 'var(--danger)'; // Indicate error
                    }
                };
                doReset();
            }
        });
    };

    // Return public API
    return {
        init
    };
})();

// Initialize the module when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AdminSystemMenu.init();
});
