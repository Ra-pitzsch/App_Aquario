import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from '../utils/storage';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao montar, verifica se há uma sessão ativa salva
  useEffect(() => {
    async function checkAuth() {
      try {
        const savedUser = await getCurrentUser();
        setUser(savedUser);
      } catch (error) {
        console.error('Erro ao verificar autenticação inicial:', error);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  /**
   * Realiza login do usuário com email e senha.
   */
  const login = async (email, password) => {
    try {
      const loggedUser = await loginUser({ email, password });
      setUser(loggedUser);
      return { success: true, user: loggedUser };
    } catch (error) {
      return { success: false, message: error.message || 'Erro ao realizar login.' };
    }
  };

  /**
   * Cadastra um novo usuário.
   */
  const register = async (name, email, password) => {
    try {
      const newUser = await registerUser({ name, email, password });
      return { success: true, user: newUser };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao realizar cadastro.',
      };
    }
  };

  /**
   * Encerra a sessão do usuário.
   */
  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Erro ao deslogar:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return context;
}
