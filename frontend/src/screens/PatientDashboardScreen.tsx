// frontend/src/screens/PatientDashboardScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Divider, useTheme, FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/api';
import { DietPlan, WeightRecord, Patient } from '../types';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { PatientDashboardScreenProps } from '../navigation/types';

const screenWidth = Dimensions.get('window').width;
const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

type TabViewRoute = { key: string; title: string };
interface RenderLabelProps {
  route: TabViewRoute;
  focused: boolean;
  color: string;
}

const PatientDashboardScreen = ({
  route,
  navigation,
}: PatientDashboardScreenProps) => {
  const { planId } = route.params;
  const theme = useTheme();
  const { logout } = useAuth();

  const [activePlan, setActivePlan] = useState<DietPlan | null>(null);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [index, setIndex] = useState(0);
  const [routes] = useState<TabViewRoute[]>([
    { key: 'plan', title: 'Plano Alimentar' },
    { key: 'weight', title: 'Evolução de Peso' },
  ]);
  const [selectedDay, setSelectedDay] = useState<string>(
    DAYS_OF_WEEK[new Date().getDay()],
  );

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [profileResponse, planResponse] = await Promise.all([
        api.get<Patient>('/auth/me'),
        api.get<DietPlan>(`/diet/my-plan/${planId}`),
      ]);

      navigation.setOptions({ title: planResponse.data.name || 'Meu Plano' });

      const profile = profileResponse.data;
      const sortedWeights =
        profile.weightRecords?.sort(
          (a, b) =>
            new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime(),
        ) || [];
      setWeightRecords(sortedWeights);
      setActivePlan(planResponse.data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      if ((error as any).response?.status === 401) logout();
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [planId, logout, navigation]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchData();
    }, [fetchData]),
  );
  const onRefresh = fetchData;

  if (isLoading) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  // =================================================================
  // --- CORREÇÃO: Código completo para as funções de renderização ---
  // =================================================================

  const PlanTab = () => {
    if (!activePlan) {
      return (
        <ScrollView
          contentContainerStyle={styles.centered}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <Text variant="headlineSmall">Plano não encontrado!</Text>
          <Text variant="bodyLarge" style={{ textAlign: 'center' }}>
            Não foi possível carregar os detalhes deste plano. Tente novamente.
          </Text>
        </ScrollView>
      );
    }
    const mealsForSelectedDay = activePlan.meals.filter(
      meal => meal.dayOfWeek === selectedDay,
    );
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
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
        {mealsForSelectedDay.length > 0 ? (
          mealsForSelectedDay.map(meal => (
            <Card key={meal.id} style={styles.mealCard}>
              <Card.Title
                title={meal.name}
                subtitle={meal.time}
                titleVariant="titleLarge"
              />
              <Card.Content>
                {meal.items.map((item, idx) => (
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
                    {idx < meal.items.length - 1 && (
                      <Divider style={styles.divider} />
                    )}
                  </View>
                ))}
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={[styles.centered, { minHeight: 150 }]}>
            <Text variant="bodyLarge">
              Nenhuma refeição cadastrada para {selectedDay}.
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const WeightTab = () => {
    if (!weightRecords || weightRecords.length < 2) {
      return (
        <ScrollView
          contentContainerStyle={styles.centered}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <Text variant="bodyLarge">
            Registros de peso insuficientes para gerar um gráfico.
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            Adicione seu peso no botão '+'.
          </Text>
        </ScrollView>
      );
    }
    const labels = weightRecords.map(r =>
      new Date(r.recordDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
    );
    const data = weightRecords.map(r => r.weight);
    return (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <Text
          variant="titleLarge"
          style={{ textAlign: 'center', marginTop: 16 }}
        >
          Evolução do Peso
        </Text>
        <LineChart
          data={{ labels, datasets: [{ data }] }}
          width={screenWidth - 32}
          height={250}
          yAxisSuffix="kg"
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: theme.colors.primary,
            },
          }}
          bezier
          style={{ marginVertical: 8, alignSelf: 'center' }}
        />
      </ScrollView>
    );
  };

  const renderScene = SceneMap({ plan: PlanTab, weight: WeightTab });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.colors.primary }}
      style={{ backgroundColor: theme.colors.background }}
      renderLabel={({ route, focused }: RenderLabelProps) => (
        <Text
          style={{
            color: focused ? theme.colors.primary : theme.colors.onSurface,
            fontWeight: focused ? 'bold' : 'normal',
            margin: 8,
          }}
        >
          {route.title}
        </Text>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('WeightRecord')}
        visible={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 16, paddingBottom: 80 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  sectionTitle: { fontWeight: 'bold', marginTop: 8, marginBottom: 16 },
  daysContainer: { flexDirection: 'row', marginBottom: 24 },
  dayChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PatientDashboardScreen;
