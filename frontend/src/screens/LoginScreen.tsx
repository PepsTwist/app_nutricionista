import React, { useState } from 'react'; // A importação do useState está correta aqui
import {
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  SegmentedButtons,
  ActivityIndicator,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { LoginScreenProps } from '../navigation/types';

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('nutritionist');

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Campos vazios',
        text2: 'Por favor, preencha o e-mail e a senha.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.access_token) {
        await login(response.data.access_token);
      } else if (response.data.reset_token) {
        Toast.show({
          type: 'info',
          text1: 'Primeiro Acesso',
          text2: 'Por favor, redefina sua senha.',
        });
        navigation.navigate('ForceResetPassword', {
          reset_token: response.data.reset_token,
          email: email,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro de Login',
        text2: 'Credenciais inválidas. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Icon
              name="food-apple-outline"
              size={64}
              color={theme.colors.primary}
            />
            <Text variant="headlineLarge" style={styles.title}>
              NutriApp
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Bem-vindo(a) de volta!
            </Text>
          </View>

          <View style={styles.formContainer}>
            <SegmentedButtons
              value={loginType}
              onValueChange={setLoginType}
              style={styles.segmentedButtons}
              buttons={[
                { value: 'nutritionist', label: 'Sou Nutricionista' },
                { value: 'patient', label: 'Sou Paciente' },
              ]}
            />

            <TextInput
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon="at" />}
            />
            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="outlined"
              secureTextEntry
              left={<TextInput.Icon icon="lock-outline" />}
            />
            <Button
              mode="contained"
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              {isLoading ? (
                <ActivityIndicator
                  animating={true}
                  color={theme.colors.onPrimary}
                />
              ) : (
                'ENTRAR'
              )}
            </Button>

            {loginType === 'nutritionist' && (
              <Button
                mode="text"
                onPress={() => navigation.navigate('SignUp')}
                style={styles.button}
              >
                Não tem conta? Crie uma
              </Button>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 8,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  buttonLabel: {
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
