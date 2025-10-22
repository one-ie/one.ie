# ONE Migration Scripts

Scripts to help migrate frontend from using `frontend/convex` to `backend/convex`.

## Available Scripts

### 1. `migrate-to-backend-convex.sh`

Migrates frontend to use backend Convex deployment.

**What it does:**
1. Creates backup of current configuration
2. Copies `frontend/convex/*` to `backend/convex/*`
3. Deploys backend Convex
4. Updates frontend `.env.local` to point to backend
5. Clears caches and restarts frontend

**Usage:**
```bash
cd /Users/toc/Server/ONE
./scripts/migrate-to-backend-convex.sh
```

**Prerequisites:**
- Convex CLI installed (`npm install -g convex`)
- Bun installed
- Both frontend and backend directories exist

**Safety:**
- Creates timestamped backup before any changes
- Can be rolled back using rollback script
- Prompts for confirmation before proceeding

---

### 2. `rollback-to-frontend-convex.sh`

Rolls back migration and restores frontend to use frontend Convex.

**What it does:**
1. Finds most recent backup
2. Restores frontend `.env.local`
3. Clears caches
4. Optionally restarts frontend

**Usage:**
```bash
cd /Users/toc/Server/ONE
./scripts/rollback-to-frontend-convex.sh
```

**Prerequisites:**
- Backup directory exists (created by migration script)

---

## Migration Flow

```
┌─────────────────────────────────────────────────────────┐
│              BEFORE MIGRATION                           │
├─────────────────────────────────────────────────────────┤
│  Frontend → frontend/convex → Convex Cloud              │
│  Backend  → backend/convex  → (separate or empty)       │
└─────────────────────────────────────────────────────────┘

                         ↓
           [Run migrate-to-backend-convex.sh]
                         ↓

┌─────────────────────────────────────────────────────────┐
│              AFTER MIGRATION                            │
├─────────────────────────────────────────────────────────┤
│  Frontend → backend/convex → Convex Cloud               │
│  Backend  → backend/convex → Convex Cloud (same)        │
│                                                          │
│  frontend/convex/* → kept but unused                    │
└─────────────────────────────────────────────────────────┘
```

## Testing After Migration

### 1. Verify Connection

Open browser console at `http://localhost:4321`:

```javascript
console.log(import.meta.env.PUBLIC_CONVEX_URL);
// Should show backend Convex URL
```

### 2. Test Auth Flow

**Sign Up:**
1. Go to `/account/signup`
2. Create account
3. Check backend Convex dashboard → Data → `users` table
4. User should appear in backend deployment

**Sign In:**
1. Go to `/account/signin`
2. Sign in with created account
3. Check backend Convex dashboard → Data → `sessions` table
4. Session should appear

**Sign Out:**
1. Click sign out
2. Should redirect to home

### 3. Test Queries/Mutations

If you have pages using Convex:
- All queries should read from backend
- All mutations should write to backend
- Real-time subscriptions should work

## Troubleshooting

### Issue: "Schema mismatch"

**Fix:**
```bash
# Ensure backend has same schema as frontend
cp frontend/convex/schema.ts backend/convex/schema.ts
cd backend && npx convex deploy
```

### Issue: "Still connecting to old deployment"

**Fix:**
```bash
# Clear all caches
cd frontend
rm -rf .astro/ node_modules/.vite/
bun run dev
```

### Issue: "Auth not working"

**Fix:**
```bash
# Ensure auth files are copied
cp frontend/convex/auth.ts backend/convex/
cp frontend/convex/auth.config.ts backend/convex/
cd backend && npx convex deploy
```

## Backup Location

Backups are created in `/Users/toc/Server/ONE/backup-YYYYMMDD-HHMMSS/`

**Backup contents:**
- `frontend-convex/` - Full copy of frontend/convex
- `frontend-env.local` - Frontend .env.local
- `backend-convex-before/` - Backend convex before migration

## Manual Rollback

If scripts don't work, manually rollback:

1. Find backup directory:
   ```bash
   ls -lt /Users/toc/Server/ONE/backup-*
   ```

2. Restore frontend .env.local:
   ```bash
   cp /Users/toc/Server/ONE/backup-TIMESTAMP/frontend-env.local \
      /Users/toc/Server/ONE/frontend/.env.local
   ```

3. Restart frontend:
   ```bash
   cd /Users/toc/Server/ONE/frontend
   rm -rf .astro/
   bun run dev
   ```

## Success Criteria

✅ Migration successful if:
- Frontend connects to backend Convex URL
- Auth works (signup, signin, signout)
- All queries return data from backend
- All mutations write to backend
- No console errors

❌ Migration failed if:
- Frontend still uses old Convex URL
- Auth doesn't work
- Queries fail or return no data
- Console shows Convex errors

## Next Steps After Successful Migration

Once frontend successfully uses backend Convex:

1. **Deprecate Frontend Convex:**
   - Stop using `frontend/convex` deployment
   - Can delete `frontend/convex/` directory (after confirming everything works)

2. **Full API Separation:**
   - Follow `one/things/plans/separate.md`
   - Create REST API with Hono
   - Add API key authentication
   - Remove Convex dependency from frontend

## Support

If issues occur:
1. Check `one/things/plans/test-backend-connection.md` for detailed troubleshooting
2. Check Convex dashboard logs
3. Check browser console for errors
4. Use rollback script to revert

## Quick Reference

```bash
# Migrate to backend
./scripts/migrate-to-backend-convex.sh

# Rollback to frontend
./scripts/rollback-to-frontend-convex.sh

# Check current Convex URL
cd frontend && grep PUBLIC_CONVEX_URL .env.local

# List backups
ls -lt backup-*/

# Start frontend
cd frontend && bun run dev

# Deploy backend
cd backend && npx convex deploy

# View Convex logs
cd backend && npx convex logs
```
