import React from 'react';

export const AuthContext = React.createContext({
  user: null,
  token: null,
  isAdmin: false,
  setUser: () => {},
  setToken: () => {},
  setIsAdmin: () => {}
});

export default AuthContext;
