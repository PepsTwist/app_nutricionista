// frontend/src/screens/WeightRecordScreen.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, useTheme, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import RNDateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import api from '../api/api';
// 1. IMPORTE O HOOK 'useNavigation' E O TIPO DE NAVEGAÇÃO
import { useNavigation } from '@react-navigation/native';
import { PatientAppNavigationProp } from '../navigation/types';

// 2. ALTERE A ASSINATURA DO COMPONENTE PARA NÃO RECEBER PROPS
const WeightRecordScreen = () => {
  const theme = useTheme();
  // 3. OBTENHA O OBJETO 'navigation' ATRAVÉS DO HOOK
  const navigation = useNavigation<PatientAppNavigationProp>();

  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleSaveRecord = async () => {
    const weightNumber = parseFloat(weight.replace(',', '.'));

    if (!weight || isNaN(weightNumber) || weightNumber <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Dado Inválido',
        text2: 'Por favor, insira um valor de peso válido.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];

      await api.post('/weight-records', {
        weight: weightNumber,
        recordDate: formattedDate,
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Seu peso foi registado com sucesso.',
      });

      // A função 'goBack' continuará a funcionar corretamente
      navigation.goBack();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Não foi possível salvar o registo.';
      Toast.show({
        type: 'error',
        text1: 'Erro ao Salvar',
        text2: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Registar Novo Peso
        </Text>

        <TextInput
          label="Peso (kg)"
          value={weight}
          onChangeText={setWeight}
          style={styles.input}
          mode="outlined"
          keyboardType="numeric"
          left={<TextInput.Icon icon="scale-bathroom" />}
        />

        <Button
          icon="calendar"
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
        >
          Data do Registo: {date.toLocaleDateString('pt-BR')}
        </Button>

        {showDatePicker && (
          <RNDateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        <Button
          mode="contained"
          onPress={handleSaveRecord}
          loading={isSaving}
          disabled={isSaving}
          style={styles.saveButton}
          labelStyle={styles.buttonLabel}
          icon="content-save"
        >
          {isSaving ? 'Salvando...' : 'SALVAR REGISTO'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 32,
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  dateButton: {
    width: '100%',
    paddingVertical: 8,
    marginBottom: 24,
  },
  saveButton: {
    width: '100%',
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
});

export default WeightRecordScreen;
