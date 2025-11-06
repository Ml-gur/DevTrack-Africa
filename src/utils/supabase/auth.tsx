// DEPRECATED: All Supabase authentication has been replaced with local storage
// Use LocalOnlyAuthContext from /contexts/LocalOnlyAuthContext.tsx instead

export const Auth = null;
export const useAuth = () => {
  throw new Error('Supabase Auth is deprecated. Use useAuth from LocalOnlyAuthContext instead.');
};