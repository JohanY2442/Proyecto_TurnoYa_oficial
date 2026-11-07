import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { authService } from '../services/authService';
import { onSesionExpirada } from '../services/api';
import { tokenStorage } from '../services/tokenStorage';

export const AuthContext = createContext(null);

function reducer(state, action) {
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

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { user: null, status: 'checking' });

  const logout = useCallback(async () => {
    await tokenStorage.clear();
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Al abrir la app: si hay token guardado, se recupera la sesión (el interceptor lo renueva si venció).
  useEffect(() => {
    onSesionExpirada(() => dispatch({ type: 'LOGOUT' }));
    (async () => {
      const token = await tokenStorage.getAccessToken();
      if (!token) return dispatch({ type: 'LOGOUT' });
      try {
        dispatch({ type: 'LOGIN', user: await authService.me() });
      } catch {
        await logout();
      }
    })();
  }, [logout]);

  const entrar = useCallback(async (promesa) => {
    const data = await promesa;
    await tokenStorage.save(data);
    dispatch({ type: 'LOGIN', user: data.usuario });
    return data.usuario;
  }, []);

  const value = useMemo(
    () => ({
      user: state.user,
      status: state.status,
      isAuthenticated: state.status === 'authenticated',
      login: (credenciales) => entrar(authService.login(credenciales)),
      register: (datos) => entrar(authService.register(datos)),
      logout,
      updateUser: (user) => dispatch({ type: 'UPDATE_USER', user }),
    }),
    [state, entrar, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };
