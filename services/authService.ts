
const AUTH_KEY = 'zenith_admin_session';

export const authService = {
  login: (username: string, password: string): boolean => {
    // In a real app, this would be a server-side check with hashed passwords
    if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  },

  logout: (): void => {
    sessionStorage.removeItem(AUTH_KEY);
  },

  isAuthenticated: (): boolean => {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  }
};
