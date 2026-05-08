const db = require('../database');

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 200;

const normalizeString = (value, fallback = '') => {
    if (value === null || value === undefined) {
        return fallback;
    }

    const text = String(value).trim();
    return text.length > 0 ? text : fallback;
};

const toSafeInteger = (value, fallback = DEFAULT_LIMIT, min = 1, max = MAX_LIMIT) => {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
        return fallback;
    }

    return Math.min(max, Math.max(min, parsed));
};

const parseMetadata = (metadata) => {
    if (!metadata) {
        return null;
    }

    if (typeof metadata === 'object') {
        return metadata;
    }

    try {
        return JSON.parse(metadata);
    } catch (error) {
        return { raw: String(metadata) };
    }
};

const sanitizePayload = (payload) => {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const clonedPayload = Array.isArray(payload) ? [...payload] : { ...payload };
    const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'currentPassword', 'newPassword', 'confirmPassword'];

    Object.keys(clonedPayload).forEach((key) => {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some((sensitiveKey) => lowerKey.includes(sensitiveKey.toLowerCase()))) {
            clonedPayload[key] = '[redacted]';
        }
    });

    return clonedPayload;
};

const buildAuditActor = (req, payload = {}) => {
    const decodedUser = req.user || {};
    const headerUserId = decodedUser.user_id || decodedUser.id || req.headers['x-user-id'] || payload.user_id || null;
    const parsedUserId = headerUserId === null || headerUserId === undefined || headerUserId === ''
        ? null
        : Number.parseInt(headerUserId, 10);

    return {
        userId: Number.isNaN(parsedUserId) ? null : parsedUserId,
        userName: normalizeString(decodedUser.full_name || decodedUser.username || req.headers['x-user-name'] || payload.user_name || 'Guest', 'Guest'),
        userRole: normalizeString(decodedUser.role || req.headers['x-user-role'] || payload.user_role || 'guest', 'guest')
    };
};

const storeAuditEvent = async ({
    userId = null,
    userName = 'Guest',
    userRole = 'guest',
    eventType = 'general',
    eventLabel = 'Audit event',
    source = 'system',
    path = null,
    method = null,
    statusCode = null,
    metadata = null
}) => {
    await db.query(
        `
            INSERT INTO audit_logs (
                user_id, user_name, user_role, event_type, event_label, source, path, method, status_code, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            userId,
            normalizeString(userName, 'Guest'),
            normalizeString(userRole, 'guest'),
            normalizeString(eventType, 'general'),
            normalizeString(eventLabel, 'Audit event'),
            normalizeString(source, 'system'),
            path ? String(path) : null,
            method ? String(method).toUpperCase() : null,
            statusCode === null || statusCode === undefined ? null : Number.parseInt(statusCode, 10),
            metadata ? JSON.stringify(metadata) : null
        ]
    );
};

const normalizeRow = (row) => ({
    ...row,
    metadata: parseMetadata(row.metadata)
});

exports.storeAuditEvent = storeAuditEvent;
exports.buildAuditActor = buildAuditActor;
exports.sanitizePayload = sanitizePayload;

exports.recordEvent = async (req, res) => {
    try {
        const payload = req.body || {};
        const actor = buildAuditActor(req, payload);
        const metadata = payload.metadata || payload.details || payload.extra || null;

        await storeAuditEvent({
            userId: payload.user_id ?? actor.userId,
            userName: payload.user_name || actor.userName,
            userRole: payload.user_role || actor.userRole,
            eventType: normalizeString(payload.eventType || payload.event_type || 'navigation', 'navigation'),
            eventLabel: normalizeString(payload.eventLabel || payload.event_label || 'Navigation event', 'Navigation event'),
            source: normalizeString(payload.source || 'client', 'client'),
            path: payload.path || req.headers['x-client-page'] || req.originalUrl,
            method: payload.method || req.method,
            statusCode: payload.statusCode ?? null,
            metadata: metadata ? sanitizePayload(metadata) : {
                page: req.headers['x-client-page'] || payload.page || null,
                section: req.headers['x-client-section'] || payload.section || null,
                action: req.headers['x-client-action'] || payload.action || null,
                href: payload.href || null,
                timestamp: new Date().toISOString()
            }
        });

        res.status(201).json({ message: 'Audit event recorded' });
    } catch (error) {
        console.error('Error recording audit event:', error);
        res.status(500).json({ error: 'Failed to record audit event' });
    }
};

exports.getAuditLogs = async (req, res) => {
    try {
        const limit = toSafeInteger(req.query.limit, DEFAULT_LIMIT, 1, MAX_LIMIT);
        const eventType = normalizeString(req.query.eventType, '');
        const source = normalizeString(req.query.source, '');
        const search = normalizeString(req.query.search, '');
        const section = normalizeString(req.query.section, '');
        const startDate = normalizeString(req.query.startDate, '');
        const endDate = normalizeString(req.query.endDate, '');

        const filters = [];
        const params = [];

        if (eventType) {
            filters.push('event_type = ?');
            params.push(eventType);
        }

        if (source) {
            filters.push('source = ?');
            params.push(source);
        }

        if (section) {
            filters.push('metadata LIKE ?');
            params.push(`%"section":"${section}"%`);
        }

        if (search) {
            filters.push('(user_name LIKE ? OR event_label LIKE ? OR path LIKE ? OR source LIKE ?)');
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }

        if (startDate) {
            filters.push('DATE(created_at) >= ?');
            params.push(startDate);
        }

        if (endDate) {
            filters.push('DATE(created_at) <= ?');
            params.push(endDate);
        }

        const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

        const [rows] = await db.query(
            `
                SELECT
                    audit_id,
                    user_id,
                    user_name,
                    user_role,
                    event_type,
                    event_label,
                    source,
                    path,
                    method,
                    status_code,
                    metadata,
                    created_at
                FROM audit_logs
                ${whereClause}
                ORDER BY created_at DESC, audit_id DESC
                LIMIT ?
            `,
            [...params, limit]
        );

        res.json(rows.map(normalizeRow));
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};

exports.getAuditSummary = async (req, res) => {
    try {
        const [summaryRows] = await db.query(`
            SELECT
                COUNT(*) AS "totalEvents",
                SUM(CASE WHEN event_type = 'navigation' THEN 1 ELSE 0 END) AS "navigationEvents",
                SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS "pageViews",
                SUM(CASE WHEN event_type = 'api_request' THEN 1 ELSE 0 END) AS "apiRequests",
                SUM(CASE WHEN event_type = 'api_error' THEN 1 ELSE 0 END) AS "apiErrors",
                SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 ELSE 0 END) AS "todayEvents",
                COUNT(DISTINCT COALESCE(CAST(user_id AS TEXT), user_name)) AS "uniqueActors",
                MAX(created_at) AS "latestEventAt"
            FROM audit_logs
        `);

        const [eventBreakdownRows] = await db.query(`
            SELECT event_type, COUNT(*) AS count
            FROM audit_logs
            GROUP BY event_type
            ORDER BY count DESC, event_type ASC
            LIMIT 5
        `);

        const [recentRows] = await db.query(`
            SELECT
                audit_id,
                user_id,
                user_name,
                user_role,
                event_type,
                event_label,
                source,
                path,
                method,
                status_code,
                metadata,
                created_at
            FROM audit_logs
            ORDER BY created_at DESC, audit_id DESC
            LIMIT 5
        `);

        const summary = summaryRows[0] || {
            totalEvents: 0,
            navigationEvents: 0,
            pageViews: 0,
            apiRequests: 0,
            apiErrors: 0,
            todayEvents: 0,
            uniqueActors: 0,
            latestEventAt: null
        };

        res.json({
            summary,
            eventBreakdown: eventBreakdownRows,
            recent: recentRows.map(normalizeRow)
        });
    } catch (error) {
        console.error('Error fetching audit summary:', error);
        res.status(500).json({ error: 'Failed to fetch audit summary' });
    }
};