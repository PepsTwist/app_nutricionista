// frontend/src/screens/PatientInitialScreen.tsx

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme, Text } from 'react-native-paper';
import { useNavigation, CommonActions } from '@react-navigation/native';
import {
  PatientAppNavigationProp,
  PatientInitialScreenProps,
} from '../navigation/types';
import api from '../api/api';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

// Interface para o tipo de plano que a API /my-plans retorna
interface DietPlanSummary {
  id: string;
  name: string;
}

const PatientInitialScreen = ({ navigation }: PatientInitialScreenProps) => {
  const theme = useTheme();
  const { logout } = useAuth();

  useEffect(() => {
    const decideRoute = async () => {
      try {
        const response = await api.get<DietPlanSummary[]>('/diet/my-plans');
        const plans = response.data;

        if (plans && plans.length === 1) {
          // Se tem exatamente 1 plano, vai direto para o dashboard dele
          // Usamos 'reset' para que o usuário não possa "voltar" para esta tela de carregamento
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'PatientDashboard',
                  params: { planId: plans[0].id },
                },
              ],
            }),
          );
        } else {
          // Se tem 0 ou mais de 1 plano, vai para a tela de seleção
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'SelectPlan' }],
            }),
          );
        }
      } catch (error) {
        console.error('Erro ao decidir a rota do paciente:', error);
        Toast.show({
          type: 'error',
          text1: 'Erro de Conexão',
          text2: 'Não foi possível carregar seus dados.',
        });

        // Se der erro, podemos deslogar o usuário ou levá-lo a uma tela de erro.
        // Por segurança, vamos deslogar para forçar uma nova autenticação.
        logout();
      }
    };

    // Adiciona um pequeno delay para a transição de tela não ser tão abrupta
    const timer = setTimeout(() => {
      decideRoute();
    }, 500);

    return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
  }, [navigation, logout]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ActivityIndicator animating={true} size="large" />
      <Text variant="bodyLarge" style={{ marginTop: 16 }}>
        Carregando...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PatientInitialScreen;
