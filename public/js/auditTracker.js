(function () {
    const API_BASE = 'http://localhost:5000/api';
    const nativeFetch = window.fetch.bind(window);
    const state = {
        activeSection: null
    };

    const getAuthToken = () => {
        if (window.AuthGuard && typeof window.AuthGuard.getToken === 'function') {
            return window.AuthGuard.getToken();
        }

        return localStorage.getItem('authToken') || '';
    };

    const getPageName = () => {
        if (document.body && document.body.dataset && document.body.dataset.page) {
            return document.body.dataset.page;
        }

        const fileName = window.location.pathname.split('/').pop() || 'unknown';
        return fileName.replace(/\.html?$/i, '') || 'unknown';
    };

    const getUserContext = () => ({
        userId: localStorage.getItem('userId') || null,
        userName: localStorage.getItem('userName') || 'Guest',
        userRole: localStorage.getItem('userRole') || 'guest'
    });

    const getActiveSection = () => state.activeSection || localStorage.getItem('lastActiveSection') || null;

    const isApiRequest = (resource) => {
        const requestUrl = resource instanceof Request ? resource.url : String(resource);

        try {
            const resolvedUrl = new URL(requestUrl, window.location.href);
            return resolvedUrl.href.startsWith(API_BASE) || resolvedUrl.pathname.startsWith('/api/');
        } catch (error) {
            return requestUrl.includes('/api/');
        }
    };

    const mergeHeaders = (resource, init = {}) => {
        const headers = new Headers();

        if (resource instanceof Request) {
            resource.headers.forEach((value, key) => {
                headers.set(key, value);
            });
        }

        if (init.headers) {
            new Headers(init.headers).forEach((value, key) => {
                headers.set(key, value);
            });
        }

        const token = getAuthToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        headers.set('x-client-page', getPageName());

        const activeSection = getActiveSection();
        if (activeSection) {
            headers.set('x-client-section', activeSection);
        }

        return headers;
    };

    window.fetch = function (resource, init = {}) {
        if (!isApiRequest(resource)) {
            return nativeFetch(resource, init);
        }

        const requestInit = { ...init, headers: mergeHeaders(resource, init) };
        const requestUrl = resource instanceof Request ? resource.url : String(resource);

        return nativeFetch(resource, requestInit).then((response) => {
            const shouldRedirectToLogin = (response.status === 401 || response.status === 403)
                && !requestUrl.includes('/login');

            if (shouldRedirectToLogin) {
                if (window.AuthGuard && typeof window.AuthGuard.clearSession === 'function') {
                    window.AuthGuard.clearSession();
                }

                if (window.location.pathname.endsWith('admin.html') || window.location.pathname.endsWith('pos.html')) {
                    window.location.href = 'login.html';
                }
            }

            return response;
        });
    };

    const sendEvent = async (eventType, eventLabel, metadata = {}) => {
        const token = getAuthToken();

        if (!token) {
            return false;
        }

        try {
            await nativeFetch(`${API_BASE}/audit-events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    eventType,
                    eventLabel,
                    source: 'client',
                    path: window.location.pathname,
                    method: 'CLIENT',
                    metadata: {
                        ...metadata,
                        page: getPageName(),
                        timestamp: new Date().toISOString()
                    }
                }),
                keepalive: true
            });

            return true;
        } catch (error) {
            console.error('Failed to record audit event:', error);
            return false;
        }
    };

    const trackPageView = (metadata = {}) => {
        sendEvent('page_view', `${getPageName()} opened`, metadata);
    };

    const trackNavigation = (label, metadata = {}) => {
        sendEvent('navigation', label, metadata);
    };

    const trackAction = (label, metadata = {}) => {
        sendEvent('action', label, metadata);
    };

    const trackSectionChange = (sectionId, label) => {
        state.activeSection = sectionId || null;
        sendEvent('navigation', label || `Section: ${sectionId}`, {
            section: sectionId,
            page: getPageName()
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        trackPageView({ path: window.location.pathname });

        if (getPageName() === 'admin') {
            state.activeSection = document.querySelector('.section.active')?.id || state.activeSection;
        }
    }, { once: true });

    window.addEventListener('admin:section-change', (event) => {
        const detail = event.detail || {};
        state.activeSection = detail.sectionId || state.activeSection;
        trackSectionChange(detail.sectionId, detail.label);
    });

    document.addEventListener('click', (event) => {
        const anchor = event.target.closest('a');
        const button = event.target.closest('button');

        if (anchor) {
            const href = anchor.getAttribute('href') || '';

            if (anchor.classList.contains('btn-logout')) {
                trackAction('Logout button clicked', { href, page: getPageName() });
                return;
            }

            if (/\.html($|[?#])/i.test(href) || href.startsWith('http')) {
                trackNavigation(anchor.textContent.trim() || href, {
                    href,
                    page: getPageName()
                });
                return;
            }
        }

        if (button) {
            if (button.id === 'refreshDashboard') {
                trackAction('Refresh dashboard clicked', { page: getPageName() });
            }

            if (button.id === 'refreshAuditLogs') {
                trackAction('Refresh audit logs clicked', { page: getPageName() });
            }
        }
    }, true);

    document.addEventListener('submit', (event) => {
        const form = event.target;

        if (form && form.id === 'addItemForm') {
            trackAction('Add item form submitted', { section: 'inventory' });
        }

        if (form && form.id === 'addUserForm') {
            trackAction('Add user form submitted', { section: 'users' });
        }
    }, true);

    window.AuditTracker = {
        trackPageView,
        trackNavigation,
        trackAction,
        trackSectionChange,
        sendEvent,
        getUserContext,
        getActiveSection: () => state.activeSection
    };
})();