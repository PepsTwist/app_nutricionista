// src/screens/SignUpScreen.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { SignUpScreenProps } from '../navigation/types';
import api from '../api/api';
import Toast from 'react-native-toast-message';

const SignUpScreen = ({ navigation }: SignUpScreenProps) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [crn, setCrn] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !crn) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Por favor, preencha todos os campos.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/users', { fullName, email, password, crn });
      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Sua conta foi criada. Agora você pode fazer o login.',
      });
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Erro no Cadastro',
        text2: 'Não foi possível criar sua conta. Verifique os dados.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Crie sua Conta
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            Comece a transformar a jornada dos seus pacientes.
          </Text>
        </View>
        <View style={styles.form}>
          <TextInput
            label="Nome Completo"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Seu melhor e-mail"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Crie uma senha"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry
          />
          <TextInput
            label="CRN (Conselho Regional de Nutricionistas)"
            value={crn}
            onChangeText={setCrn}
            style={styles.input}
            mode="outlined"
          />
          <Button
            mode="contained"
            onPress={handleSignUp}
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
              'FINALIZAR CADASTRO'
            )}
          </Button>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Já tem uma conta?{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                Faça login
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { textAlign: 'center' },
  form: { width: '100%' },
  input: { marginBottom: 16 },
  button: { paddingVertical: 8, marginTop: 16 },
  buttonLabel: { fontSize: 16 },
  linkButton: { marginTop: 24, alignItems: 'center' },
});

export default SignUpScreen;
