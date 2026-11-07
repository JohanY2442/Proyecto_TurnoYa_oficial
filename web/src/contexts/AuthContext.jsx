import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { authService } from '../services/authService';
import { onSesionExpirada, refrescarSesion } from '../services/api';
import { tokenStorage } from '../services/tokenStorage';

export const AuthContext = createContext(null);

const initialState = { user: null, status: 'checking' }; // checking | authenticated | anonymous

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.user, status: 'authenticated' };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.user } };
    case 'LOGOUT':
      return { user: null, status: 'anonymous' };
    default:
      return state;
  }
}

const guardarTokens = ({ accessToken, refreshToken }) => {
  tokenStorage.setAccessToken(accessToken);
  tokenStorage.setRefreshToken(refreshToken);
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const logout = useCallback(() => {
    tokenStorage.clear();
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Al recargar la página: si hay refresh token, se recupera la sesión.
  useEffect(() => {
    onSesionExpirada(logout);
    if (!tokenStorage.getRefreshToken()) {
      dispatch({ type: 'LOGOUT' });
      return;
    }
    refrescarSesion()
      .then((data) => dispatch({ type: 'LOGIN', user: data.usuario }))
      .catch(logout);
  }, [logout]);

  const login = useCallback(async (credenciales) => {
    const data = await authService.login(credenciales);
    guardarTokens(data);
    dispatch({ type: 'LOGIN', user: data.usuario });
    return data.usuario;
  }, []);

  const register = useCallback(async (datos) => {
    const data = await authService.register(datos);
    guardarTokens(data);
    dispatch({ type: 'LOGIN', user: data.usuario });
    return data.usuario;
  }, []);

  const updateUser = useCallback((user) => dispatch({ type: 'UPDATE_USER', user }), []);

  const value = useMemo(
    () => ({
      user: state.user,
      status: state.status,
      isAuthenticated: state.status === 'authenticated',
      hasRole: (...roles) => !!state.user && roles.includes(state.user.rol),
      login,
      register,
      logout,
      updateUser,
    }),
    [state, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };
