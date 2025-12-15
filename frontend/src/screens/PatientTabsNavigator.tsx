// src/navigation/PatientTabsNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PatientDashboardScreen from '../screens/PatientDashboardScreen';
// 1. IMPORTE O ECRÃ CORRETO PARA REGISTAR O PESO
import WeightRecordScreen from '../screens/WeightRecordScreen';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type PatientTabParamList = {
  // 2. RENOMEIE A ROTA PARA MAIOR CLAREZA (OPCIONAL, MAS RECOMENDADO)
  Dashboard: undefined;
  AddWeight: undefined;
};

const Tab = createBottomTabNavigator<PatientTabParamList>();

const PatientTabsNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={PatientDashboardScreen}
        options={{
          tabBarLabel: 'Meu Plano',
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-text-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        // 3. USE O NOME E O COMPONENTE CORRETOS
        name="AddWeight"
        component={WeightRecordScreen}
        options={{
          tabBarLabel: 'Registar Peso',
          tabBarIcon: ({ color, size }) => (
            <Icon name="plus-circle" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default PatientTabsNavigator;
