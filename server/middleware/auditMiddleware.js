const { storeAuditEvent, buildAuditActor, sanitizePayload } = require('../controllers/audit');

const isAuditRoute = (path = '') => path.startsWith('/audit-logs') || path.startsWith('/audit-events');

const auditMiddleware = (req, res, next) => {
    if (isAuditRoute(req.path)) {
        return next();
    }

    const startedAt = Date.now();

    res.on('finish', () => {
        if (isAuditRoute(req.path)) {
            return;
        }

        const actor = buildAuditActor(req, req.body || {});
        const statusCode = res.statusCode;
        const eventType = statusCode >= 400 ? 'api_error' : 'api_request';
        const eventLabel = `${req.method} ${req.originalUrl.split('?')[0]}`;

        storeAuditEvent({
            userId: actor.userId,
            userName: actor.userName,
            userRole: actor.userRole,
            eventType,
            eventLabel,
            source: 'middleware',
            path: req.originalUrl.split('?')[0],
            method: req.method,
            statusCode,
            metadata: {
                durationMs: Date.now() - startedAt,
                query: sanitizePayload(req.query),
                params: sanitizePayload(req.params),
                body: sanitizePayload(req.body),
                clientPage: req.headers['x-client-page'] || null,
                clientSection: req.headers['x-client-section'] || null,
                clientAction: req.headers['x-client-action'] || null,
                userAgent: req.headers['user-agent'] || null
            }
        }).catch((error) => {
            console.error('Audit middleware logging failed:', error);
        });
    });

    next();
};

module.exports = auditMiddleware;