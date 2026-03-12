import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('shop_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token } = res.data;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userData = {
      id:    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      name:  payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
    };
    localStorage.setItem('shop_token', token);
    localStorage.setItem('shop_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    await authService.register({ name, email, password });
  };

  const logout = () => {
    localStorage.removeItem('shop_token');
    localStorage.removeItem('shop_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
