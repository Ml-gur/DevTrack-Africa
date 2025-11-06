// DEPRECATED: This file has been replaced with LocalOnlyAuthContext.tsx
// All Supabase connections have been removed in favor of local storage only

export const SupabaseAuthContext = null;
export const useAuth = () => {
  throw new Error('SupabaseAuthContext is deprecated. Please use LocalOnlyAuthContext instead.');
};