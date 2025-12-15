// src/screens/AnamnesisScreen.tsx

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { AnamnesisScreenProps } from '../navigation/types';
import api from '../api/api';
import Toast from 'react-native-toast-message';

interface AnamnesisData {
  healthHistory: string | null;
  lifestyleHabits: string | null;
  familyHistory: string | null;
  mainComplaint: string | null;
}

const AnamnesisScreen = ({ route, navigation }: AnamnesisScreenProps) => {
  const { patientId } = route.params;
  const theme = useTheme();
  const styles = createStyles(theme.colors);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<AnamnesisData>({
    healthHistory: '',
    lifestyleHabits: '',
    familyHistory: '',
    mainComplaint: '',
  });

  useFocusEffect(
    useCallback(() => {
      const fetchAnamnesis = async () => {
        setIsLoading(true);
        try {
          const response = await api.get(`/anamnesis/${patientId}`);
          if (response.data) {
            setFormData({
              healthHistory: response.data.healthHistory || '',
              lifestyleHabits: response.data.lifestyleHabits || '',
              familyHistory: response.data.familyHistory || '',
              mainComplaint: response.data.mainComplaint || '',
            });
          }
        } catch (error) {
          // Silencioso, pois é normal não haver dados
        } finally {
          setIsLoading(false);
        }
      };
      fetchAnamnesis();
    }, [patientId]),
  );

  const handleInputChange = (field: keyof AnamnesisData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.post('/anamnesis', { patientId, ...formData });
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Anamnese salva com sucesso.',
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar a anamnese.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text variant="titleLarge" style={styles.title}>
          Formulário de Anamnese
        </Text>

        <TextInput
          label="Histórico de Saúde"
          value={formData.healthHistory || ''}
          onChangeText={text => handleInputChange('healthHistory', text)}
          style={styles.input}
          multiline
          numberOfLines={4}
        />
        <TextInput
          label="Hábitos de Vida"
          value={formData.lifestyleHabits || ''}
          onChangeText={text => handleInputChange('lifestyleHabits', text)}
          style={styles.input}
          multiline
          numberOfLines={4}
        />
        <TextInput
          label="Histórico Familiar"
          value={formData.familyHistory || ''}
          onChangeText={text => handleInputChange('familyHistory', text)}
          style={styles.input}
          multiline
          numberOfLines={4}
        />
        <TextInput
          label="Queixa Principal e Objetivos"
          value={formData.mainComplaint || ''}
          onChangeText={text => handleInputChange('mainComplaint', text)}
          style={styles.input}
          multiline
          numberOfLines={4}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving}
          style={styles.button}
          labelStyle={styles.buttonLabel}
          icon="content-save"
        >
          {isSaving ? 'Salvando...' : 'SALVAR ANAMNESE'}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    scrollContainer: { padding: 16 },
    title: { marginBottom: 24, textAlign: 'center', color: colors.onSurface },
    input: { marginBottom: 16, backgroundColor: colors.surfaceVariant },
    button: { marginTop: 16, paddingVertical: 8 },
    buttonLabel: { fontSize: 16, fontWeight: 'bold' },
  });

export default AnamnesisScreen;
