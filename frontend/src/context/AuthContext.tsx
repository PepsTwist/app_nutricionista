// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextData {
  token: string | null;
  userType: 'nutritionist' | 'patient' | null;
  isLoading: boolean;
  login: (newToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<'nutritionist' | 'patient' | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await AsyncStorage.getItem('@NutriApp:token');
        if (storedToken) {
          api.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${storedToken}`;
          setToken(storedToken);
          const decodedToken: { userType?: 'nutritionist' | 'patient' } =
            jwtDecode(storedToken);
          setUserType(decodedToken.userType || null);
        }
      } catch (e) {
        console.error('Failed to load token from storage', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStorageData();
  }, []);

  const login = async (newToken: string) => {
    console.log('--- AuthContext: Iniciando Login ---'); // LOG 1
    setIsLoading(true);
    try {
      await AsyncStorage.setItem('@NutriApp:token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      const decodedToken: { userType?: 'nutritionist' | 'patient' } =
        jwtDecode(newToken);

      console.log('Token Decodificado:', decodedToken); // LOG 2

      setUserType(decodedToken.userType || null);
      setToken(newToken);

      console.log(
        `Estado atualizado. UserType: ${
          decodedToken.userType
        }, Token: ${!!newToken}`,
      ); // LOG 3
    } catch (e) {
      console.error('Falha ao salvar token', e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.removeItem('@NutriApp:token');
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUserType(null);
    } catch (e) {
      console.error('Falha ao remover token', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ token, userType, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
