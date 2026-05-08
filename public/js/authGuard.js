(function () {
    const getApiBase = () => {
        const { protocol, hostname, origin } = window.location;

        // If frontend is served by Live Server (e.g. :5500/:5501), route API to backend port.
        if (protocol.startsWith('http') && (hostname === 'localhost' || hostname === '127.0.0.1')) {
            if (window.location.port !== '5000') {
                return 'http://localhost:5000/api';
            }
            return `${origin}/api`;
        }

        // When served by backend host/domain, use same-origin API routes.
        if (protocol.startsWith('http') && hostname) {
            return `${origin}/api`;
        }

        // Fallback for file:// access during local development.
        return 'http://localhost:5000/api';
    };

    const API_BASE = getApiBase();
    const SESSION_KEYS = ['authToken', 'userName', 'userRole', 'userId'];

    const getToken = () => localStorage.getItem('authToken');

    const clearSession = () => {
        SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
    };

    const validateSession = async () => {
        const token = getToken();

        if (!token) {
            return { valid: false, reason: 'missing' };
        }

        try {
            const response = await fetch(`${API_BASE}/validate-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: '{}'
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok || !payload.valid || !payload.user) {
                clearSession();
                return { valid: false, reason: 'invalid' };
            }

            return { valid: true, user: payload.user };
        } catch (error) {
            clearSession();
            return { valid: false, reason: 'error', error };
        }
    };

    const redirectToLogin = () => {
        window.location.href = 'login.html';
    };

    const redirectByRole = (user) => {
        if (!user) {
            redirectToLogin();
            return;
        }

        if (user.role === 'admin') {
            window.location.href = 'admin.html';
            return;
        }

        window.location.href = 'pos.html';
    };

    window.AuthGuard = {
        getToken,
        clearSession,
        validateSession,
        redirectToLogin,
        redirectByRole
    };
})();