import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  useTheme,
  Divider,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { CreateDietPlanScreenProps } from '../navigation/types';
import api from '../api/api';
import { DietPlan } from '../types';
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

interface MealItemForm {
  description: string;
  quantity: string;
  notes?: string;
}
interface MealForm {
  name: string;
  time: string;
  dayOfWeek: string;
  items: MealItemForm[];
}

const CreateDietPlanScreen = ({
  route,
  navigation,
}: CreateDietPlanScreenProps) => {
  const { patientId, existingPlan } = route.params;
  const isEditing = !!existingPlan;
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[1]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [meals, setMeals] = useState<MealForm[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [currentPatientId, setCurrentPatientId] = useState<string>(patientId);

  useEffect(() => {
    const fetchAndSetPlanDetails = async () => {
      if (isEditing && existingPlan) {
        setIsLoading(true);
        try {
          // Rota corrigida para buscar detalhes do plano
          const response = await api.get<DietPlan>(
            `/diet/plan/${existingPlan.id}`,
          );
          const fullPlan = response.data;
          setName(fullPlan.name);
          setDescription(fullPlan.description || '');
          setCurrentPatientId(fullPlan.patient.id);
          const formattedMeals = fullPlan.meals.map(meal => ({
            name: meal.name,
            time: meal.time,
            dayOfWeek: meal.dayOfWeek || DAYS_OF_WEEK[1],
            items: meal.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              notes: item.notes || '',
            })),
          }));
          setMeals(formattedMeals);
        } catch (error) {
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Não foi possível carregar os detalhes do plano.',
          });
          navigation.goBack();
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchAndSetPlanDetails();
  }, [isEditing, existingPlan, navigation]);

  const handleMealChange = (
    text: string,
    mealIndex: number,
    field: 'name' | 'time',
  ) => {
    const newMeals = [...meals];
    newMeals[mealIndex][field] = text;
    setMeals(newMeals);
  };

  const handleItemChange = (
    text: string,
    mealIndex: number,
    itemIndex: number,
    field: 'description' | 'quantity' | 'notes',
  ) => {
    const newMeals = [...meals];
    newMeals[mealIndex].items[itemIndex][field] = text;
    setMeals(newMeals);
  };

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        name: '',
        time: '',
        dayOfWeek: selectedDay,
        items: [{ description: '', quantity: '', notes: '' }],
      },
    ]);
  };

  const removeMeal = (mealIndex: number) => {
    const newMeals = meals.filter((_, index) => index !== mealIndex);
    setMeals(newMeals);
  };

  const addItemToMeal = (mealIndex: number) => {
    const newMeals = [...meals];
    newMeals[mealIndex].items.push({
      description: '',
      quantity: '',
      notes: '',
    });
    setMeals(newMeals);
  };

  const removeItemFromMeal = (mealIndex: number, itemIndex: number) => {
    const newMeals = [...meals];
    newMeals[mealIndex].items = newMeals[mealIndex].items.filter(
      (_, index) => index !== itemIndex,
    );
    setMeals(newMeals);
  };

  const handleSavePlan = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erro de Validação',
        text2: 'O nome do plano é obrigatório.',
      });
      return;
    }
    // ... (sua outra lógica de validação)

    setIsSaving(true);
    const payload = { name, description, meals };

    try {
      if (isEditing && existingPlan?.id) {
        // Rota de edição corrigida
        await api.patch(`/diet/plan/${existingPlan.id}`, payload);
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Plano alimentar atualizado.',
        });
      } else if (!isEditing && currentPatientId) {
        // Rota de criação corrigida, com o patientId no corpo
        await api.post(`/diet/plan`, {
          patientId: currentPatientId,
          ...payload,
        });
        Toast.show({
          type: 'success',
          text1: 'Sucesso!',
          text2: 'Plano alimentar criado.',
        });
      } else {
        throw new Error('ID do paciente ou do plano não encontrado.');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error(
        'ERRO DETALHADO AO SALVAR:',
        error.response?.data || error.message,
      );
      const messages = error.response?.data?.message;
      const fallbackMessage =
        error.message || 'Não foi possível salvar o plano.';
      const text2 = Array.isArray(messages)
        ? messages.join('\n')
        : messages || fallbackMessage;

      Toast.show({
        type: 'error',
        text1: 'Erro ao Salvar',
        text2: text2,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContainer}
        >
          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Informações Gerais
          </Text>
          <TextInput
            label="Nome do Plano"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Descrição (Opcional)"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            mode="outlined"
            multiline
          />

          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
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

          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Refeições de {selectedDay}
          </Text>

          {meals
            .map((meal, index) => ({ ...meal, originalIndex: index }))
            .filter(meal => meal.dayOfWeek === selectedDay)
            .map(meal => (
              <Card key={meal.originalIndex} style={styles.mealCard}>
                <Card.Content>
                  <View style={styles.mealHeader}>
                    <TextInput
                      label="Refeição"
                      style={[styles.mealInput, { flex: 2 }]}
                      value={meal.name}
                      onChangeText={text =>
                        handleMealChange(text, meal.originalIndex, 'name')
                      }
                      mode="outlined"
                      dense
                    />
                    <TextInput
                      label="Horário"
                      style={[styles.mealInput, { flex: 1 }]}
                      value={meal.time}
                      onChangeText={text =>
                        handleMealChange(text, meal.originalIndex, 'time')
                      }
                      mode="outlined"
                      dense
                    />
                    <IconButton
                      icon="delete"
                      iconColor={theme.colors.error}
                      onPress={() => removeMeal(meal.originalIndex)}
                    />
                  </View>
                  <Divider style={styles.divider} />
                  {meal.items.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.itemContainer}>
                      <TextInput
                        label="Item"
                        style={[styles.itemInput, { flex: 2 }]}
                        value={item.description}
                        onChangeText={text =>
                          handleItemChange(
                            text,
                            meal.originalIndex,
                            itemIndex,
                            'description',
                          )
                        }
                        mode="outlined"
                        dense
                      />
                      <TextInput
                        label="Qtde."
                        style={[styles.itemInput, { flex: 1 }]}
                        value={item.quantity}
                        onChangeText={text =>
                          handleItemChange(
                            text,
                            meal.originalIndex,
                            itemIndex,
                            'quantity',
                          )
                        }
                        mode="outlined"
                        dense
                      />
                      <IconButton
                        icon="minus-circle-outline"
                        iconColor={theme.colors.error}
                        onPress={() =>
                          removeItemFromMeal(meal.originalIndex, itemIndex)
                        }
                        disabled={meal.items.length <= 1}
                      />
                    </View>
                  ))}
                  <Button
                    icon="plus-circle-outline"
                    mode="text"
                    onPress={() => addItemToMeal(meal.originalIndex)}
                    style={styles.addItemButton}
                  >
                    Adicionar Item
                  </Button>
                </Card.Content>
              </Card>
            ))}

          <Button
            icon="plus"
            mode="contained-tonal"
            onPress={addMeal}
            style={styles.addMealButton}
          >
            Adicionar Refeição para {selectedDay}
          </Button>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: insets.bottom === 0 ? 16 : insets.bottom,
            },
          ]}
        >
          <Button
            mode="contained"
            onPress={handleSavePlan}
            disabled={isSaving}
            loading={isSaving}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            {isSaving ? 'Salvando...' : 'SALVAR PLANO'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: { padding: 16 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: { fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  input: { marginBottom: 16 },
  button: { paddingVertical: 8 },
  buttonLabel: { fontSize: 16 },
  mealCard: { marginBottom: 16 },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mealInput: { backgroundColor: 'transparent' },
  divider: { marginVertical: 12 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemInput: { backgroundColor: 'transparent', marginRight: 8 },
  addItemButton: { alignSelf: 'flex-start', marginTop: 8 },
  addMealButton: { marginTop: 16, marginBottom: 40 },
  daysContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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

export default CreateDietPlanScreen;
