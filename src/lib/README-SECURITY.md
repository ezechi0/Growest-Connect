# Security Guidelines for Profile Data Access

## Critical Security Rules

### ⚠️ NEVER Query These Fields for Other Users

The following fields contain sensitive personal information and must NEVER be included when querying profiles of other users:

- `phone` - Phone numbers can be harvested for spam/scams
- `kyc_document_url` - Contains links to sensitive identity documents  
- `kyc_rejected_reason` - May contain sensitive rejection details

### ✅ Safe Fields for Other Users

When querying profiles of other users, ONLY select these fields:

```typescript
[
  'id',
  'full_name',
  'user_type', 
  'company',
  'bio',
  'website',
  'location',
  'avatar_url',
  'is_verified',
  'created_at'
]
```

### 🔒 Using Profile Query Helpers

Always use the helper functions from `src/lib/profileQueries.ts`:

```typescript
import { getSafeProfile, SAFE_PROFILE_SELECT_STRING } from '@/lib/profileQueries';

// Get a single safe profile
const { data } = await getSafeProfile(userId);

// Use in relations
supabase
  .from('projects')
  .select(`
    *,
    profiles:owner_id (${SAFE_PROFILE_SELECT_STRING})
  `)
```

### 🚫 DON'T Do This

```typescript
// ❌ NEVER do this for other users
supabase.from('profiles').select('*').eq('id', otherUserId)

// ❌ NEVER include phone in queries
supabase.from('profiles').select('full_name, phone, email')
```

### ✅ DO This Instead

```typescript
// ✅ For own profile (using auth.uid())
supabase.from('profiles').select('*').eq('id', auth.uid())

// ✅ For other users (explicit safe fields)
supabase.from('profiles')
  .select('id, full_name, company, avatar_url')
  .eq('id', otherUserId)

// ✅ Or use helper functions
import { getSafeProfile } from '@/lib/profileQueries';
const { data } = await getSafeProfile(otherUserId);
```

## Database-Level Protection

While the application enforces these restrictions, the database RLS policies control **which rows** users can access, not **which columns**. The application layer MUST enforce column-level restrictions by:

1. Always explicitly selecting safe fields
2. Using the provided helper functions
3. Never using `select('*')` except for own profile
4. Documenting security concerns in code comments

## Public Profiles View

For publicly accessible profiles (where `is_public = true`), use the `public_profiles` view:

```typescript
supabase.from('public_profiles').select('*')
```

This view automatically excludes all sensitive fields and is safe to query.

## Code Review Checklist

When reviewing code that accesses the `profiles` table, verify:

- [ ] Never selects `phone`, `kyc_document_url`, or `kyc_rejected_reason` for other users
- [ ] Uses explicit field selection (not `select('*')`) for other users
- [ ] Uses helper functions from `profileQueries.ts` when possible  
- [ ] Includes security comments explaining why certain fields are excluded
- [ ] Only uses `select('*')` when querying own profile with `auth.uid()`
