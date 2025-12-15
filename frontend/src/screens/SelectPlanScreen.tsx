// frontend/src/screens/SelectPlanScreen.tsx

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Card,
  Avatar,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { SelectPlanScreenProps } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import Toast from 'react-native-toast-message';

interface DietPlanSummary {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  isActive: boolean;
}

const SelectPlanScreen = ({ navigation }: SelectPlanScreenProps) => {
  const theme = useTheme();
  const { logout } = useAuth();
  const [plans, setPlans] = useState<DietPlanSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMyPlans = useCallback(async () => {
    try {
      const response = await api.get<DietPlanSummary[]>('/diet/my-plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Erro ao buscar planos de dieta:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de Conexão',
        text2: 'Não foi possível buscar seus planos de dieta.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchMyPlans();
    }, [fetchMyPlans]),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchMyPlans();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator animating={true} size="large" />
        <Text style={{ marginTop: 10 }}>Buscando seus planos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium">Selecione um Plano</Text>
        <Button onPress={logout}>Sair</Button>
      </View>

      <FlatList
        data={plans}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            // =================================================================
            // --- MUDANÇA PRINCIPAL AQUI ---
            // Usando .navigate() para empilhar a tela e ter o botão "Voltar"
            // =================================================================
            onPress={() =>
              navigation.navigate('PatientDashboard', { planId: item.id })
            }
          >
            <Card.Title
              title={item.name}
              subtitle={`Criado em: ${formatDate(item.createdAt)}`}
              titleStyle={{ fontWeight: 'bold' }}
              left={props => (
                <Avatar.Icon
                  {...props}
                  size={40}
                  icon={item.isActive ? 'check-circle' : 'close-circle'}
                  style={{
                    backgroundColor: item.isActive
                      ? theme.colors.primary
                      : theme.colors.backdrop,
                  }}
                />
              )}
            />
            {item.description && (
              <Card.Content>
                <Text variant="bodyMedium">{item.description}</Text>
              </Card.Content>
            )}
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text variant="titleMedium">
              Nenhum plano alimentar encontrado.
            </Text>
            <Text
              variant="bodyMedium"
              style={{ marginTop: 8, textAlign: 'center' }}
            >
              Peça ao seu nutricionista para criar um plano para você.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
  },
});

export default SelectPlanScreen;
