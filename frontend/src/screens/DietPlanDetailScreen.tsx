// frontend/src/screens/DietPlanDetailScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  useTheme,
  Card,
  Divider,
  Button,
  ActivityIndicator,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { DietPlanDetailScreenProps } from '../navigation/types'; // Import correto
import { DietPlan } from '../types';
import api from '../api/api';
import Toast from 'react-native-toast-message';

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

// --- AQUI ESTÁ A CORREÇÃO ---
const DietPlanDetailScreen = ({
  route,
  navigation,
}: DietPlanDetailScreenProps) => {
  const { planId } = route.params;
  const theme = useTheme();
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[1]);

  useFocusEffect(
    useCallback(() => {
      const fetchPlanDetails = async () => {
        setIsLoading(true);
        try {
          const response = await api.get<DietPlan>(`/diet/plan/${planId}`);
          setPlan(response.data);
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Não foi possível carregar o plano.',
          });
          navigation.goBack();
        } finally {
          setIsLoading(false);
        }
      };
      fetchPlanDetails();
    }, [planId, navigation]),
  );

  const handleDelete = async () => {
    if (!plan) return;
    try {
      await api.delete(`/diet/plan/${plan.id}`);
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Plano removido.',
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível remover o plano.',
      });
    }
  };

  const confirmDelete = () => {
    if (!plan) return;
    Alert.alert(
      'Confirmar Remoção',
      `Você tem certeza que deseja remover o plano "${plan.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, Remover', onPress: handleDelete, style: 'destructive' },
      ],
    );
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

  if (!plan) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <Text>Plano não encontrado.</Text>
      </View>
    );
  }

  const mealsForSelectedDay = plan.meals.filter(
    meal => meal.dayOfWeek === selectedDay,
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.planName}>
            {plan.name}
          </Text>
          <Text variant="bodyLarge" style={styles.planDescription}>
            {plan.description}
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Dia da Semana
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.daysContainer}
            >
              {DAYS_OF_WEEK.map(day => (
                <TouchableOpacity key={day} onPress={() => setSelectedDay(day)}>
                  <View
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor:
                          selectedDay === day
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          selectedDay === day
                            ? theme.colors.onPrimary
                            : theme.colors.onSurfaceVariant,
                        fontWeight: selectedDay === day ? 'bold' : 'normal',
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        {mealsForSelectedDay.length > 0 ? (
          mealsForSelectedDay.map(meal => (
            <Card key={meal.id} style={styles.mealCard}>
              <Card.Title
                title={meal.name}
                subtitle={meal.time}
                titleVariant="titleLarge"
              />
              <Card.Content>
                {meal.items.map((item, itemIndex) => (
                  <View key={item.id}>
                    <View style={styles.itemContainer}>
                      <Text style={styles.itemDescription} variant="bodyLarge">
                        {item.description}
                      </Text>
                      <Text style={styles.itemQuantity} variant="bodyLarge">
                        {item.quantity}
                      </Text>
                    </View>
                    {item.notes && (
                      <Text style={styles.itemNotes} variant="bodySmall">
                        Obs: {item.notes}
                      </Text>
                    )}
                    {itemIndex < meal.items.length - 1 && (
                      <Divider style={styles.divider} />
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.mealCard}>
            <Card.Content style={styles.centered}>
              <Text>Nenhuma refeição cadastrada para {selectedDay}.</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Button
          icon="pencil"
          mode="contained"
          onPress={() =>
            navigation.navigate('CreateDietPlan', {
              patientId: plan.patient.id,
              existingPlan: plan,
            })
          }
        >
          Editar Plano
        </Button>
        <Button
          icon="delete"
          mode="outlined"
          onPress={confirmDelete}
          style={styles.deleteButton}
          textColor={theme.colors.error}
        >
          Deletar Plano
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 16, paddingBottom: 120 },
  header: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  planName: { fontWeight: 'bold' },
  planDescription: { opacity: 0.8, marginTop: 4 },
  card: { marginBottom: 16 },
  mealCard: { marginBottom: 16 },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemDescription: { flex: 1, flexWrap: 'wrap' },
  itemQuantity: { marginLeft: 16, fontWeight: 'bold' },
  itemNotes: { fontStyle: 'italic', opacity: 0.7, marginTop: 4 },
  divider: { marginVertical: 4 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 8,
    borderColor: '#B91C1C',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: 'row',
  },
  dayChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DietPlanDetailScreen;
