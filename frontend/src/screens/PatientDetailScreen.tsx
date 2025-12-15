import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Text,
  useTheme,
  Card,
  Button,
  Avatar,
  List,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { PatientDetailScreenProps } from '../navigation/types';
import { Patient, DietPlan } from '../types';
import api from '../api/api';
import Toast from 'react-native-toast-message';
import { MaskedTextInput } from 'react-native-mask-text';

interface PatientProfileWithPlans extends Patient {
  dietPlans: DietPlan[];
}

const PatientDetailScreen = ({
  route,
  navigation,
}: PatientDetailScreenProps) => {
  const { patientId } = route.params;
  const theme = useTheme();
  const [patient, setPatient] = useState<PatientProfileWithPlans | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- ESTADOS PARA O MODO DE EDIÇÃO ---
  const [isEditing, setIsEditing] = useState(false);
  const [editablePhone, setEditablePhone] = useState('');
  const [editableBirthDate, setEditableBirthDate] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get<PatientProfileWithPlans>(
        `/patients/${patientId}`,
      );
      setPatient(response.data);
      // Inicializa os estados de edição com os dados do paciente
      setEditablePhone(response.data.phone || '');
      setEditableBirthDate(
        response.data.birthDate
          ? new Date(response.data.birthDate).toLocaleDateString('pt-BR')
          : '',
      );
    } catch (error) {
      console.error('Erro ao buscar detalhes do paciente:', error);
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

  // --- FUNÇÃO PARA SALVAR AS ALTERAÇÕES ---
  const handleSaveChanges = async () => {
    let formattedDate: string | undefined = undefined;
    if (editableBirthDate && editableBirthDate.length === 10) {
      const parts = editableBirthDate.split('/');
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // AAAA-MM-DD
    }

    try {
      await api.patch(`/patients/${patientId}`, {
        phone: editablePhone,
        birthDate: formattedDate,
      });
      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Dados atualizados.',
      });
      setIsEditing(false);
      fetchData(); // Recarrega os dados
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível atualizar.',
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!patient) {
    return (
      <View style={styles.centered}>
        <Text>Paciente não encontrado.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <Card style={styles.card}>
          <Card.Title
            title={patient.fullName}
            subtitle={patient.email}
            titleVariant="headlineSmall"
            left={props => (
              <Avatar.Text
                {...props}
                label={patient.fullName.substring(0, 2).toUpperCase()}
              />
            )}
            right={props =>
              !isEditing ? (
                <Button
                  {...props}
                  icon="pencil"
                  onPress={() => setIsEditing(true)}
                >
                  Editar
                </Button>
              ) : null
            }
          />
          <Card.Content>
            {isEditing ? (
              <>
                <TextInput
                  label="Telefone"
                  style={styles.input}
                  mode="outlined"
                  keyboardType="phone-pad"
                  value={editablePhone}
                  render={props => (
                    <MaskedTextInput
                      {...props}
                      mask="(99) 99999-9999"
                      onChangeText={(_, extracted) =>
                        setEditablePhone(extracted || '')
                      }
                    />
                  )}
                />
                <TextInput
                  label="Data de Nascimento"
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                  value={editableBirthDate}
                  render={props => (
                    <MaskedTextInput
                      {...props}
                      mask="99/99/9999"
                      onChangeText={text => setEditableBirthDate(text)}
                    />
                  )}
                />
                <View style={styles.editButtons}>
                  <Button mode="text" onPress={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button mode="contained" onPress={handleSaveChanges}>
                    Salvar
                  </Button>
                </View>
              </>
            ) : (
              <>
                {patient.phone && (
                  <Text variant="bodyLarge">Telefone: {patient.phone}</Text>
                )}
                {patient.birthDate && (
                  <Text variant="bodyLarge">
                    Nascimento:{' '}
                    {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
                  </Text>
                )}
              </>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Button
              icon="chart-line"
              mode="contained"
              style={styles.button}
              onPress={() =>
                navigation.navigate('PatientWeightChart', {
                  patientId: patient.id,
                  patientName: patient.fullName,
                })
              }
            >
              Ver Evolução de Peso
            </Button>
            <Button
              icon="notebook-plus-outline"
              mode="contained-tonal"
              style={styles.button}
              onPress={() =>
                navigation.navigate('CreateDietPlan', { patientId: patient.id })
              }
            >
              Criar Novo Plano Alimentar
            </Button>
            <Button
              icon="file-document-edit-outline"
              mode="contained-tonal"
              style={styles.button}
              onPress={() =>
                navigation.navigate('Anamnesis', { patientId: patient.id })
              }
            >
              Ver / Editar Anamnese
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Planos Alimentares" titleVariant="titleLarge" />
          <Card.Content>
            {patient.dietPlans && patient.dietPlans.length > 0 ? (
              patient.dietPlans.map(plan => (
                <List.Item
                  key={plan.id}
                  title={plan.name}
                  description={`Criado em: ${new Date(
                    plan.createdAt,
                  ).toLocaleDateString('pt-BR')}`}
                  left={props => (
                    <List.Icon {...props} icon="notebook-outline" />
                  )}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() =>
                    navigation.navigate('DietPlanDetail', { planId: plan.id })
                  }
                  style={styles.listItem}
                />
              ))
            ) : (
              <Text style={{ paddingVertical: 10 }}>
                Nenhum plano alimentar encontrado.
              </Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 16 },
  card: { marginBottom: 16 },
  button: { marginTop: 8 },
  listItem: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  input: { marginBottom: 16 },
  editButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
});

export default PatientDetailScreen;
