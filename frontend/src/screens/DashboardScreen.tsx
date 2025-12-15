// src/screens/DashboardScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Button,
  Card,
  Avatar,
  ActivityIndicator,
  useTheme,
  FAB,
} from 'react-native-paper';
import { DashboardScreenProps } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Patient } from '../types';
import Toast from 'react-native-toast-message';

const DashboardScreen = ({ navigation }: DashboardScreenProps) => {
  const theme = useTheme();
  const { logout } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      const response = await api.get<Patient[]>('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro de Conexão',
        text2: 'Não foi possível buscar seus pacientes.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchPatients();
    }, [fetchPatients]),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchPatients();
  };

  if (isLoading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium">Meus Pacientes</Text>
        <Button onPress={logout}>Sair</Button>
      </View>

      <FlatList
        data={patients}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() =>
              navigation.navigate('PatientDetail', { patientId: item.id })
            }
          >
            <Card.Title
              title={item.fullName}
              subtitle={item.email}
              titleStyle={{ fontWeight: 'bold' }}
              left={props => (
                <Avatar.Text
                  {...props}
                  size={40}
                  label={item.fullName.substring(0, 2).toUpperCase()}
                />
              )}
            />
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text variant="titleMedium">Nenhum paciente encontrado.</Text>
            <Text variant="bodyMedium" style={{ marginTop: 8 }}>
              Adicione seu primeiro paciente no botão '+'.
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddPatient')}
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
    paddingBottom: 80, // Espaço para o FAB não cobrir o último item
  },
  card: {
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DashboardScreen;
