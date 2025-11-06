// DEPRECATED: This file has been replaced with LocalOnlyAuthContext.tsx
// All authentication is now handled through local storage only
// This file is kept as a placeholder to avoid import errors during migration

export const AuthContext = null;
export const useAuth = () => {
  throw new Error('AuthContext is deprecated. Please use LocalOnlyAuthContext instead.');
};
export const AuthProvider = () => {
  throw new Error('AuthProvider is deprecated. Please use LocalOnlyAuthProvider instead.');
};