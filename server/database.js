const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
    console.warn('SUPABASE_DB_URL is not set. Database connection will fail until it is configured.');
}

const pool = new Pool({
    connectionString,
    ssl: process.env.SUPABASE_DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    max: Number.parseInt(process.env.DB_POOL_MAX || '10', 10)
});

const normalizeSqlDialect = (sql) => {
    if (!sql || typeof sql !== 'string') {
        return sql;
    }

    return sql
        .replace(
            /DATE_SUB\s*\(\s*CURDATE\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi,
            "CURRENT_DATE - INTERVAL '$1 day'"
        )
        .replace(/CURDATE\(\)/gi, 'CURRENT_DATE');
};

const convertPlaceholders = (sql) => {
    let index = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let previousChar = '';
    let output = '';

    for (const char of sql) {
        if (char === "'" && !inDoubleQuote && previousChar !== '\\') {
            inSingleQuote = !inSingleQuote;
            output += char;
        } else if (char === '"' && !inSingleQuote && previousChar !== '\\') {
            inDoubleQuote = !inDoubleQuote;
            output += char;
        } else if (char === '?' && !inSingleQuote && !inDoubleQuote) {
            index += 1;
            output += `$${index}`;
        } else {
            output += char;
        }

        previousChar = char;
    }

    return output;
};

const appendReturningForInsert = (sql) => {
    const trimmed = sql.trim();

    if (!/^INSERT\s+INTO/i.test(trimmed) || /\bRETURNING\b/i.test(trimmed)) {
        return sql;
    }

    return `${trimmed.replace(/;\s*$/, '')} RETURNING *`;
};

const inferInsertId = (row) => {
    if (!row || typeof row !== 'object') {
        return null;
    }

    const keys = Object.keys(row);
    const preferredKey = keys.find((key) => key === 'id' || key.endsWith('_id')) || keys[0];
    return preferredKey ? row[preferredKey] : null;
};

const runQuery = async (client, sql, params = []) => {
    const sqlWithDialect = normalizeSqlDialect(sql);
    const sqlWithReturning = appendReturningForInsert(sqlWithDialect);
    const text = convertPlaceholders(sqlWithReturning);
    const result = await client.query(text, params);
    const rows = result.rows || [];
    const meta = {
        affectedRows: result.rowCount || 0,
        rowCount: result.rowCount || 0,
        insertId: null
    };

    if (result.command === 'INSERT' && rows.length > 0) {
        meta.insertId = inferInsertId(rows[0]);
    }

    return { rows, meta, command: result.command };
};

const normalizeParamsAndCallback = (params, callback) => {
    if (typeof params === 'function') {
        return { values: [], cb: params };
    }

    if (params === undefined || params === null) {
        return { values: [], cb: callback };
    }

    return { values: Array.isArray(params) ? params : [params], cb: callback };
};

const isReadQuery = (sql) => /^\s*SELECT/i.test(sql);

const query = (sql, params, callback) => {
    const { values, cb } = normalizeParamsAndCallback(params, callback);

    if (typeof cb === 'function') {
        runQuery(pool, sql, values)
            .then(({ rows }) => cb(null, rows))
            .catch((error) => cb(error));
        return;
    }

    return runQuery(pool, sql, values).then(({ rows, meta }) => [rows, meta]);
};

const execute = (sql, params, callback) => {
    const { values, cb } = normalizeParamsAndCallback(params, callback);

    if (typeof cb === 'function') {
        runQuery(pool, sql, values)
            .then(({ rows, meta }) => cb(null, isReadQuery(sql) ? rows : meta))
            .catch((error) => cb(error));
        return;
    }

    return runQuery(pool, sql, values).then(({ rows, meta }) => [rows, meta]);
};

const getConnection = async () => {
    const client = await pool.connect();

    return {
        query: (sql, params, callback) => {
            const { values, cb } = normalizeParamsAndCallback(params, callback);

            if (typeof cb === 'function') {
                runQuery(client, sql, values)
                    .then(({ rows }) => cb(null, rows))
                    .catch((error) => cb(error));
                return;
            }

            return runQuery(client, sql, values).then(({ rows, meta }) => [rows, meta]);
        },
        execute: (sql, params, callback) => {
            const { values, cb } = normalizeParamsAndCallback(params, callback);

            if (typeof cb === 'function') {
                runQuery(client, sql, values)
                    .then(({ rows, meta }) => cb(null, isReadQuery(sql) ? rows : meta))
                    .catch((error) => cb(error));
                return;
            }

            return runQuery(client, sql, values).then(({ rows, meta }) => [rows, meta]);
        },
        beginTransaction: () => client.query('BEGIN'),
        commit: () => client.query('COMMIT'),
        rollback: () => client.query('ROLLBACK'),
        release: () => client.release()
    };
};

const testConnection = async () => {
    try {
        await pool.query('SELECT 1');
        return true;
    } catch (error) {
        console.error('Database connection test failed:', error.message);
        return false;
    }
};

module.exports = {
    query,
    execute,
    getConnection,
    testConnection,
    end: () => pool.end()
};
