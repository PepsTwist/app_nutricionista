// src/api/api.ts

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Verifique se este é o IP correto da sua máquina na sua rede local
// O emulador Android usa 10.0.2.2 para se referir ao localhost da máquina anfitriã
const API_URL = 'http://10.0.2.2:3000';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor que será executado ANTES de cada requisição
api.interceptors.request.use(
  async config => {
    // --- AQUI ESTÁ A CORREÇÃO ---
    // Use a mesma chave que você definiu no seu AuthContext.
    const token = await AsyncStorage.getItem('@NutriApp:token');

    // Se o token existir, anexe-o ao cabeçalho.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Retorne a configuração para que a requisição possa continuar.
    return config;
  },
  error => {
    // Se ocorrer um erro, rejeite a promessa.
    return Promise.reject(error);
  },
);

export default api;
