// src/screens/AddPatientScreen.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import api from '../api/api';
import { AddPatientScreenProps } from '../navigation/types';
import { MaskedTextInput } from 'react-native-mask-text'; // A importação agora funcionará

const AddPatientScreen = ({ navigation }: AddPatientScreenProps) => {
  const theme = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPatient = async () => {
    if (!fullName || !email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Campos Obrigatórios',
        text2: 'Nome, e-mail e senha provisória são necessários.',
      });
      return;
    }

    let formattedDate = null;
    if (birthDate && birthDate.length === 10) {
      // Valida se a data está completa
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (!dateRegex.test(birthDate)) {
        Toast.show({
          type: 'error',
          text1: 'Formato Inválido',
          text2: 'Use o formato DD/MM/AAAA para a data.',
        });
        return;
      }
      const parts = birthDate.split('/');
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    setIsLoading(true);
    try {
      await api.post('/patients', {
        fullName,
        email,
        phone,
        birthDate: formattedDate,
        password,
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'O paciente foi adicionado com sucesso.',
      });
      navigation.goBack();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Não foi possível adicionar o paciente.';
      Toast.show({
        type: 'error',
        text1: 'Erro ao Adicionar',
        text2: Array.isArray(errorMessage)
          ? errorMessage.join('\n')
          : errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            Adicionar Novo Paciente
          </Text>

          <TextInput
            label="Nome Completo do Paciente"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="E-mail do Paciente"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label="Senha Provisória"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry
          />
          <TextInput
            label="Telefone (Opcional)"
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
            render={props => (
              <MaskedTextInput
                {...props}
                mask="(99) 99999-9999"
                // --- CORREÇÃO DE TIPO E LÓGICA ---
                // Adicionamos os tipos 'string' aos parâmetros
                onChangeText={(formatted: string, extracted?: string) => {
                  setPhone(extracted || '');
                }}
              />
            )}
          />
          <TextInput
            label="Data de Nascimento (Opcional)"
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
            render={props => (
              <MaskedTextInput
                {...props}
                mask="99/99/9999"
                // --- CORREÇÃO DE TIPO ---
                // Adicionamos o tipo 'string' ao parâmetro 'text'
                onChangeText={(text: string) => {
                  setBirthDate(text);
                }}
              />
            )}
          />

          <Button
            mode="contained"
            onPress={handleAddPatient}
            disabled={isLoading}
            loading={isLoading}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {isLoading ? 'Salvando...' : 'SALVAR PACIENTE'}
          </Button>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
});

export default AddPatientScreen;
