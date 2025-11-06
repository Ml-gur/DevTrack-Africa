# DevTrack Africa - Remove Offline Capabilities Plan

## 🎯 OBJECTIVE
Remove all offline/local storage functionality to maintain ONLY online capabilities via Supabase.

## 🗑️ FILES TO DELETE (Phase 1)

### Critical Removals
1. `/utils/local-storage-service.ts` - Complete offline data layer
2. `/contexts/LocalAuthContext.tsx` - Local authentication system
3. `/utils/database-availability-manager.ts` - Database fallback manager
4. `/utils/firebase/` directory - Deprecated Firebase components

### Connection Managers (Evaluate)
- `/utils/supabase/connection-manager.ts` - Contains offline logic, needs cleanup

## 🔧 FILES TO MODIFY (Phase 2)

### App.tsx Changes
- Remove any imports related to local storage
- Ensure only SupabaseAuthContext is used
- Remove database availability fallbacks
- Simplify connection error handling (no offline mode)

### CSS Cleanup
- Remove storage-related CSS classes in globals.css
- Keep only online-specific styling

### Component Updates
- Update any components that might reference local storage
- Ensure all data operations go through Supabase service only

## ✅ VERIFICATION STEPS

1. Search codebase for "localStorage" references
2. Search codebase for "LocalAuth" references  
3. Search codebase for "database-availability" references
4. Search codebase for "offline" references
5. Test that app fails gracefully when Supabase is unavailable
6. Verify no data is stored locally

## 🚀 EXPECTED RESULT

- App works ONLY when connected to Supabase
- No local data storage or caching
- No offline authentication
- Clean error messages when database is unavailable
- Simplified codebase with single data source

## 🎯 SUCCESS CRITERIA

- ✅ No localStorage usage except for basic app settings
- ✅ Only SupabaseAuthContext in use
- ✅ All data operations go through supabaseService
- ✅ App shows connection required when Supabase unavailable
- ✅ No data conflicts between local and cloud storage