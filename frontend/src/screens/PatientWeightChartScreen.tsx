import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { PatientWeightChartScreenProps } from '../navigation/types';
import { WeightRecord } from '../types';
import api from '../api/api';

const screenWidth = Dimensions.get('window').width;

const PatientWeightChartScreen = ({ route }: PatientWeightChartScreenProps) => {
  const { patientId, patientName } = route.params;
  const theme = useTheme();
  const navigation = useNavigation();

  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Define o título do ecrã com o nome do paciente
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: `Evolução de ${patientName.split(' ')[0]}`,
    });
  }, [navigation, patientName]);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get<WeightRecord[]>(
        `/weight-records/${patientId}`,
      );
      const sortedData = response.data.sort(
        (a, b) =>
          new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime(),
      );
      setWeightRecords(sortedData);
    } catch (error) {
      console.error('Erro ao buscar registros de peso:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [patientId]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchData();
    }, [fetchData]),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (weightRecords.length < 2) {
      return (
        <View style={styles.centered}>
          <Text variant="titleMedium" style={{ textAlign: 'center' }}>
            Registos insuficientes para gerar um gráfico.
          </Text>
          <Text
            variant="bodyMedium"
            style={{ textAlign: 'center', marginTop: 8 }}
          >
            O paciente precisa de adicionar pelo menos dois registos de peso.
          </Text>
        </View>
      );
    }

    const chartData = {
      labels: weightRecords.map(r =>
        new Date(r.recordDate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
      ),
      datasets: [{ data: weightRecords.map(r => r.weight) }],
    };

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <Text variant="headlineSmall" style={styles.title}>
          Evolução de Peso
        </Text>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={250}
          yAxisSuffix=" kg"
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: theme.colors.surface,
            backgroundGradientFrom: theme.colors.surface,
            backgroundGradientTo: theme.colors.surface,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // Cor primária
            labelColor: (opacity = 1) => theme.colors.onSurface,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: theme.colors.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {renderContent()}
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
  scrollContainer: { padding: 16 },
  title: { textAlign: 'center', marginBottom: 24 },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default PatientWeightChartScreen;
