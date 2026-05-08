# Supabase Migration Guide

## 1. Configure environment
1. Copy `.env.example` to `.env`.
2. Set `SUPABASE_DB_URL` using your Supabase Postgres URI.

## 2. Install dependencies
```bash
npm install
```

## 3. Create tables on Supabase
```bash
npm run db:setup
```

This creates:
- `users`
- `items`
- `transactions`
- `transaction_items`
- `audit_logs`

It also inserts a default admin user if none exists:
- username: `admin`
- password: `admin123`

## 4. Run the app
```bash
npm run dev
```

## 5. (Optional) Move existing local MySQL data
If you still have data in MySQL that you want in Supabase, export/import by table.

Recommended approach:
1. Export each MySQL table to CSV.
2. In Supabase Table Editor, import CSV in this order:
   1. `users`
   2. `items`
   3. `transactions`
   4. `transaction_items`
   5. `audit_logs`
3. After import, reset sequences (important for auto IDs):
```sql
SELECT setval('users_user_id_seq', COALESCE((SELECT MAX(user_id) FROM users), 1), true);
SELECT setval('items_item_id_seq', COALESCE((SELECT MAX(item_id) FROM items), 1), true);
SELECT setval('transactions_transaction_id_seq', COALESCE((SELECT MAX(transaction_id) FROM transactions), 1), true);
SELECT setval('transaction_items_transaction_item_id_seq', COALESCE((SELECT MAX(transaction_item_id) FROM transaction_items), 1), true);
SELECT setval('audit_logs_audit_id_seq', COALESCE((SELECT MAX(audit_id) FROM audit_logs), 1), true);
```

## Notes
- Existing controller code was kept and adapted through a compatibility database layer.
- Parameter placeholders (`?`) are translated to PostgreSQL placeholders internally.
- MySQL-specific date functions used by reports were updated for PostgreSQL.
