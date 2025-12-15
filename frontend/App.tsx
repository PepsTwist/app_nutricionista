// App.tsx

import React from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { LightTheme, DarkTheme } from './src/theme/themes'; // 1. Importe nossos temas
import Toast from 'react-native-toast-message';

function App(): React.JSX.Element {
  // 2. Detecta o tema atual do sistema operacional (light ou dark)
  const colorScheme = useColorScheme();

  // 3. Escolhe o nosso tema customizado com base na detecção
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    // 4. O PaperProvider agora envolve tudo e fornece o tema correto
    <PaperProvider theme={theme}>
      <AuthProvider>
        <AppNavigator />
        <Toast />
      </AuthProvider>
    </PaperProvider>
  );
}

export default App;
