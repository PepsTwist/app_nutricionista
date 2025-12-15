// src/navigation/AppNavigator.tsx

import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import {
  AppStackParamList,
  AuthStackParamList,
  PatientAppStackParamList,
} from './types';
import { useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

// Telas
import DashboardScreen from '../screens/DashboardScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import CreateDietPlanScreen from '../screens/CreateDietPlanScreen';
import DietPlanDetailScreen from '../screens/DietPlanDetailScreen';
import AnamnesisScreen from '../screens/AnamnesisScreen';
import PatientWeightChartScreen from '../screens/PatientWeightChartScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForceResetPasswordScreen from '../screens/ForceResetPasswordScreen';
import PatientInitialScreen from '../screens/PatientInitialScreen';
import SelectPlanScreen from '../screens/SelectPlanScreen';
import PatientDashboardScreen from '../screens/PatientDashboardScreen';
import WeightRecordScreen from '../screens/WeightRecordScreen';

// =================================================================
// --- MUDANÇA 1: Definir cada Stack como um componente separado ---
// =================================================================

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    <AuthStack.Screen
      name="ForceResetPassword"
      component={ForceResetPasswordScreen}
      options={{ headerShown: true, title: 'Redefinir Senha' }}
    />
  </AuthStack.Navigator>
);

const AppStack = createNativeStackNavigator<AppStackParamList>();
const NutritionistNavigator = ({
  screenOptions,
}: {
  screenOptions: NativeStackNavigationOptions;
}) => (
  <AppStack.Navigator screenOptions={screenOptions}>
    <AppStack.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ title: 'Meus Pacientes' }}
    />
    <AppStack.Screen
      name="PatientDetail"
      component={PatientDetailScreen}
      options={{ title: 'Detalhes do Paciente' }}
    />
    <AppStack.Screen
      name="AddPatient"
      component={AddPatientScreen}
      options={{ title: 'Novo Paciente' }}
    />
    <AppStack.Screen
      name="CreateDietPlan"
      component={CreateDietPlanScreen}
      options={({ route }) => ({
        title: route.params.existingPlan ? 'Editar Plano' : 'Criar Novo Plano',
      })}
    />
    <AppStack.Screen
      name="DietPlanDetail"
      component={DietPlanDetailScreen}
      options={{ title: 'Detalhes do Plano' }}
    />
    <AppStack.Screen
      name="Anamnesis"
      component={AnamnesisScreen}
      options={{ title: 'Anamnese' }}
    />
    <AppStack.Screen
      name="PatientWeightChart"
      component={PatientWeightChartScreen}
    />
  </AppStack.Navigator>
);

const PatientStack = createNativeStackNavigator<PatientAppStackParamList>();
const PatientNavigator = () => {
  const { logout } = useAuth();
  const theme = useTheme();

  return (
    <PatientStack.Navigator
      initialRouteName="PatientInitial"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => (
          <Button textColor={theme.colors.onPrimary} onPress={logout}>
            Sair
          </Button>
        ),
      }}
    >
      <PatientStack.Screen
        name="PatientInitial"
        component={PatientInitialScreen}
        options={{ headerShown: false }}
      />
      <PatientStack.Screen
        name="SelectPlan"
        component={SelectPlanScreen}
        options={{ title: 'Meus Planos' }}
      />
      <PatientStack.Screen
        name="PatientDashboard"
        component={PatientDashboardScreen}
        options={{ title: 'Meu Plano Alimentar' }}
      />
      <PatientStack.Screen
        name="WeightRecord"
        component={WeightRecordScreen}
        options={{ title: 'Registrar Peso' }}
      />
    </PatientStack.Navigator>
  );
};

// =================================================================
// --- MUDANÇA 2: O componente principal agora é mais simples ---
// =================================================================

const AppNavigator = () => {
  const { token, userType, isLoading } = useAuth();
  const paperTheme = useTheme();

  const navigationTheme: NavigationTheme = {
    ...DefaultTheme,
    dark: paperTheme.dark,
    colors: {
      ...DefaultTheme.colors,
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      border: paperTheme.colors.outline,
      notification: paperTheme.colors.error,
    },
  };

  const screenOptions: NativeStackNavigationOptions = {
    headerStyle: { backgroundColor: paperTheme.colors.primary },
    headerTintColor: paperTheme.colors.onPrimary,
    headerTitleStyle: { fontWeight: 'bold' },
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: paperTheme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {!token ? (
        <AuthNavigator />
      ) : userType === 'nutritionist' ? (
        <NutritionistNavigator screenOptions={screenOptions} />
      ) : userType === 'patient' ? (
        <PatientNavigator />
      ) : (
        // Fallback caso algo dê errado, renderiza o AuthNavigator
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AppNavigator;
