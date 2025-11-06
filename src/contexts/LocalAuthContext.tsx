// DEPRECATED: This file has been replaced with LocalOnlyAuthContext.tsx
// All authentication is now handled through local storage only

export const LocalAuthContext = null;
export const useAuth = () => {
  throw new Error('LocalAuthContext is deprecated. Please use LocalOnlyAuthContext instead.');
};