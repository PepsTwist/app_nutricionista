import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
// --- 1. IMPORTE O TIPO DE PROPS CORRETO ---
import { ForceResetPasswordScreenProps } from '../navigation/types';

// --- 2. APLIQUE O TIPO ÀS PROPS DO COMPONENTE ---
const ForceResetPasswordScreen = ({ route }: ForceResetPasswordScreenProps) => {
  const { reset_token, email } = route.params;
  const theme = useTheme();
  const { login } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Senha muito curta',
        text2: 'A senha precisa ter no mínimo 6 caracteres.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'As senhas não coincidem' });
      return;
    }

    setIsLoading(true);
    try {
      // Faz o pedido para a nova rota com o token temporário
      const response = await api.patch(
        '/patients/me/reset-password',
        { newPassword },
        { headers: { Authorization: `Bearer ${reset_token}` } },
      );

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Sua senha foi redefinida. Fazendo login...',
      });

      // Tenta fazer login automaticamente com as novas credenciais
      const loginResponse = await api.post('/auth/login', {
        email: email,
        password: newPassword,
      });

      if (loginResponse.data.access_token) {
        await login(loginResponse.data.access_token);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível redefinir a senha.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Redefina sua Senha
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Por segurança, crie uma nova senha para o seu primeiro acesso.
        </Text>
        <TextInput
          label="Nova Senha"
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.input}
          mode="outlined"
          secureTextEntry
        />
        <TextInput
          label="Confirmar Nova Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          mode="outlined"
          secureTextEntry
        />
        <Button
          mode="contained"
          onPress={handleResetPassword}
          disabled={isLoading}
          loading={isLoading}
          style={styles.button}
        >
          Salvar Nova Senha
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  content: { padding: 20 },
  title: { textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 24 },
  input: { marginBottom: 16 },
  button: { marginTop: 8, paddingVertical: 8 },
});

export default ForceResetPasswordScreen;
