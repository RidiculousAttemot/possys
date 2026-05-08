(function () {
    const API_BASE = 'http://localhost:5000/api';
    const state = {
        filters: {
            eventType: '',
            source: '',
            search: '',
            startDate: '',
            endDate: ''
        }
    };

    const get = (id) => document.getElementById(id);

    const formatDateTime = (value) => {
        if (!value) {
            return 'N/A';
        }

        const date = new Date(value);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const escapeHtml = (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const formatDetails = (log) => {
        const metadata = log.metadata || {};
        const details = [];

        if (metadata.page) {
            details.push(`Page: ${metadata.page}`);
        }

        if (metadata.section) {
            details.push(`Section: ${metadata.section}`);
        }

        if (metadata.action) {
            details.push(`Action: ${metadata.action}`);
        }

        if (metadata.durationMs !== undefined) {
            details.push(`Duration: ${metadata.durationMs}ms`);
        }

        if (metadata.itemName) {
            details.push(`Item: ${metadata.itemName}`);
        }

        if (metadata.targetFullName || metadata.targetUsername) {
            details.push(`Target: ${metadata.targetFullName || metadata.targetUsername}`);
        }

        if (metadata.transactionId) {
            details.push(`Transaction #${metadata.transactionId}`);
        }

        if (metadata.payment_method) {
            details.push(`Payment: ${metadata.payment_method}`);
        }

        if (metadata.changedFields && Array.isArray(metadata.changedFields) && metadata.changedFields.length > 0) {
            details.push(`Changed: ${metadata.changedFields.join(', ')}`);
        }

        if (metadata.itemCount !== undefined) {
            details.push(`Items: ${metadata.itemCount}`);
        }

        if (metadata.total_amount !== undefined) {
            details.push(`Total: ₱${Number(metadata.total_amount).toFixed(2)}`);
        }

        if (details.length === 0 && log.path) {
            details.push(log.path);
        }

        return details.join(' • ');
    };

    const escapeCsvValue = (value) => {
        const normalized = value === null || value === undefined ? '' : String(value);
        return `"${normalized.replace(/"/g, '""')}"`;
    };

    const getAuthToken = () => {
        return localStorage.getItem('authToken') || '';
    };

    const downloadBlob = (content, fileName, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const renderSummary = (summary = {}) => {
        const totalEvents = get('auditTotalEvents');
        const todayEvents = get('auditTodayEvents');
        const navigationEvents = get('auditNavigationEvents');
        const apiRequests = get('auditApiRequests');
        const auditEventCount = get('auditEventCount');

        if (totalEvents) {
            totalEvents.textContent = summary.totalEvents ?? 0;
        }

        if (todayEvents) {
            todayEvents.textContent = summary.todayEvents ?? 0;
        }

        if (navigationEvents) {
            navigationEvents.textContent = summary.navigationEvents ?? 0;
        }

        if (apiRequests) {
            apiRequests.textContent = summary.apiRequests ?? 0;
        }

        if (auditEventCount) {
            auditEventCount.textContent = summary.totalEvents ?? 0;
        }
    };

    const renderPreview = (rows = []) => {
        const preview = get('auditPreviewList');
        if (!preview) {
            return;
        }

        if (!rows.length) {
            preview.innerHTML = `
                <div class="audit-empty-state">
                    <i class="fas fa-shield-alt"></i>
                    <h4>No audit events yet</h4>
                    <p>Navigation and API requests will appear here once users start moving through the system.</p>
                </div>
            `;
            return;
        }

        preview.innerHTML = rows.map((log) => `
            <article class="audit-preview-item">
                <div class="audit-preview-header">
                    <span class="audit-preview-user">${escapeHtml(log.user_name || 'Guest')}</span>
                    <span class="audit-type-pill type-${escapeHtml(log.event_type || 'general')}">${escapeHtml(log.event_type || 'general')}</span>
                </div>
                <strong>${escapeHtml(log.event_label || 'Audit event')}</strong>
                <span>${escapeHtml(log.path || (log.metadata && log.metadata.section) || 'No target recorded')}</span>
                <small>${escapeHtml(formatDateTime(log.created_at))}</small>
            </article>
        `).join('');
    };

    const renderLogs = (rows = []) => {
        const table = get('auditLogsTable');
        if (!table) {
            return;
        }

        if (!rows.length) {
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="audit-empty-cell">
                        <div class="audit-empty-state compact">
                            <i class="fas fa-clipboard-list"></i>
                            <h4>No audit logs found</h4>
                            <p>Try changing the search or event filters.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = rows.map((log) => `
            <tr>
                <td>${escapeHtml(formatDateTime(log.created_at))}</td>
                <td>
                    <div class="audit-user-cell">
                        <strong>${escapeHtml(log.user_name || 'Guest')}</strong>
                        <span>${escapeHtml(log.user_role || 'guest')}</span>
                    </div>
                </td>
                <td>
                    <span class="audit-type-pill type-${escapeHtml(log.event_type || 'general')}">${escapeHtml(log.event_type || 'general')}</span>
                </td>
                <td>${escapeHtml(log.source || 'system')}</td>
                <td>${escapeHtml(log.path || 'N/A')}</td>
                <td>${escapeHtml(log.status_code === null || log.status_code === undefined ? '—' : log.status_code)}</td>
                <td>${escapeHtml(formatDetails(log))}</td>
            </tr>
        `).join('');
    };

    const buildQueryString = (overrides = {}) => {
        const params = new URLSearchParams();
        const filters = { ...state.filters, ...overrides };

        params.set('limit', String(overrides.limit || 25));

        if (filters.eventType && filters.eventType !== 'all') {
            params.set('eventType', filters.eventType);
        }

        if (filters.source && filters.source !== 'all') {
            params.set('source', filters.source);
        }

        if (filters.search) {
            params.set('search', filters.search);
        }

        if (filters.startDate) {
            params.set('startDate', filters.startDate);
        }

        if (filters.endDate) {
            params.set('endDate', filters.endDate);
        }

        return params.toString();
    };

    const buildCsv = (rows = []) => {
        const headers = ['Time', 'User', 'Role', 'Event Type', 'Source', 'Path', 'Status', 'Details'];
        const csvRows = [headers.map(escapeCsvValue).join(',')];

        rows.forEach((log) => {
            csvRows.push([
                formatDateTime(log.created_at),
                log.user_name || 'Guest',
                log.user_role || 'guest',
                log.event_type || 'general',
                log.source || 'system',
                log.path || 'N/A',
                log.status_code === null || log.status_code === undefined ? '—' : log.status_code,
                formatDetails(log)
            ].map(escapeCsvValue).join(','));
        });

        return csvRows.join('\n');
    };

    const fetchJson = async (url) => {
        const token = getAuthToken();
        const headers = {
            Accept: 'application/json'
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            headers
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        return response.json();
    };

    const loadAuditSummary = async () => {
        try {
            const payload = await fetchJson(`${API_BASE}/audit-logs/summary`);
            renderSummary(payload.summary || {});
            renderPreview(payload.recent || []);
            return payload;
        } catch (error) {
            console.error('Failed to load audit summary:', error);
            renderSummary({});
            renderPreview([]);
            return null;
        }
    };

    const loadAuditLogs = async (overrides = {}) => {
        const table = get('auditLogsTable');
        if (!table) {
            return [];
        }

        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading audit logs...</p>
                </td>
            </tr>
        `;

        try {
            const query = buildQueryString(overrides);
            const logs = await fetchJson(`${API_BASE}/audit-logs?${query}`);
            renderLogs(logs);
            window.__latestAuditLogs = logs;
            return logs;
        } catch (error) {
            console.error('Failed to load audit logs:', error);
            table.innerHTML = `
                <tr>
                    <td colspan="7" class="audit-empty-cell">
                        <div class="audit-empty-state compact error">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h4>Could not load audit logs</h4>
                            <p>${escapeHtml(error.message || 'Unexpected error')}</p>
                        </div>
                    </td>
                </tr>
            `;
            return [];
        }
    };

    let searchTimer = null;

    const applyFilters = () => {
        state.filters.eventType = get('auditTypeFilter')?.value || '';
        state.filters.source = get('auditSourceFilter')?.value || '';
        state.filters.search = get('auditSearchInput')?.value.trim() || '';
        state.filters.startDate = get('auditStartDate')?.value || '';
        state.filters.endDate = get('auditEndDate')?.value || '';
        return loadAuditLogs();
    };

    const exportAuditLogs = async (format) => {
        try {
            const query = buildQueryString({ limit: 200 });
            const logs = await fetchJson(`${API_BASE}/audit-logs?${query}`);

            if (!logs.length) {
                Swal.fire({
                    title: 'No data',
                    text: 'There are no audit events to export for the current filters.',
                    icon: 'info',
                    confirmButtonColor: '#3498db',
                    background: '#141414',
                    color: '#f5f5f5'
                });
                return;
            }

            if (format === 'json') {
                const fileName = `audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
                downloadBlob(JSON.stringify(logs, null, 2), fileName, 'application/json');
                return;
            }

            const fileName = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
            downloadBlob(buildCsv(logs), fileName, 'text/csv;charset=utf-8;');
        } catch (error) {
            console.error('Failed to export audit logs:', error);
            Swal.fire({
                title: 'Export failed',
                text: error.message || 'Unable to export audit logs.',
                icon: 'error',
                confirmButtonColor: '#3498db',
                background: '#141414',
                color: '#f5f5f5'
            });
        }
    };

    const clearFilters = () => {
        ['auditSearchInput', 'auditStartDate', 'auditEndDate'].forEach((id) => {
            const element = get(id);
            if (element) {
                element.value = '';
            }
        });

        if (get('auditTypeFilter')) {
            get('auditTypeFilter').value = 'all';
        }

        if (get('auditSourceFilter')) {
            get('auditSourceFilter').value = 'all';
        }

        state.filters = {
            eventType: '',
            source: '',
            search: '',
            startDate: '',
            endDate: ''
        };

        loadAuditLogs();
    };

    const init = () => {
        const auditSection = get('auditLogs');
        if (!auditSection) {
            return;
        }

        const refreshButton = get('refreshAuditLogs');
        const searchInput = get('auditSearchInput');
        const typeFilter = get('auditTypeFilter');
        const sourceFilter = get('auditSourceFilter');
        const startDate = get('auditStartDate');
        const endDate = get('auditEndDate');
        const clearButton = get('clearAuditFilters');
        const exportCsvButton = get('exportAuditCsv');
        const exportJsonButton = get('exportAuditJson');

        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                loadAuditSummary();
                loadAuditLogs();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => {
                    applyFilters();
                }, 250);
            });
        }

        if (typeFilter) {
            typeFilter.addEventListener('change', applyFilters);
        }

        if (sourceFilter) {
            sourceFilter.addEventListener('change', applyFilters);
        }

        if (startDate) {
            startDate.addEventListener('change', applyFilters);
        }

        if (endDate) {
            endDate.addEventListener('change', applyFilters);
        }

        if (clearButton) {
            clearButton.addEventListener('click', clearFilters);
        }

        if (exportCsvButton) {
            exportCsvButton.addEventListener('click', () => exportAuditLogs('csv'));
        }

        if (exportJsonButton) {
            exportJsonButton.addEventListener('click', () => exportAuditLogs('json'));
        }

        window.addEventListener('admin:section-change', (event) => {
            if (event.detail && event.detail.sectionId === 'auditLogs') {
                loadAuditLogs();
            }
        });

        window.loadAuditSummary = loadAuditSummary;
        window.loadAuditLogs = loadAuditLogs;

        loadAuditSummary();

        if (auditSection.classList.contains('active')) {
            loadAuditLogs();
        }
    };

    document.addEventListener('DOMContentLoaded', init);
})();