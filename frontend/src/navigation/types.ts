// frontend/src/types.ts

import type {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

// --- INTERFACES DE DADOS ---

export interface WeightRecord {
  id: string;
  weight: number;
  recordDate: string;
}

export interface MealItem {
  id: string;
  description: string;
  quantity: string;
  notes?: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  dayOfWeek: string;
  items: MealItem[];
}

export interface DietPlan {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  meals: Meal[];
}

export interface Patient {
  id: string;
  fullName: string;
  email: string;
  // ... outras propriedades do paciente que possam existir

  // CORREÇÃO: Adicionando a propriedade que faltava.
  // O endpoint /auth/me retorna os registros de peso junto com o perfil.
  weightRecords?: WeightRecord[];
}

// --- TIPOS DE NAVEGAÇÃO ---

// Telas e parâmetros para o fluxo de Autenticação (não logado)
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForceResetPassword: { reset_token: string; email: string };
};

// Telas e parâmetros para o fluxo do Nutricionista (logado)
export type AppStackParamList = {
  Dashboard: undefined;
  PatientDetail: { patientId: string };
  AddPatient: undefined;
  CreateDietPlan: { patientId: string; existingPlan?: DietPlan };
  DietPlanDetail: { planId: string };
  Anamnesis: { patientId: string };
  PatientWeightChart: { patientId: string; patientName: string };
};

// Telas e parâmetros para o fluxo do Paciente (logado)
export type PatientAppStackParamList = {
  // Tela de carregamento e roteamento inicial
  PatientInitial: undefined;
  // Tela para escolher um plano (se houver mais de 1 ou 0)
  SelectPlan: undefined;
  // Tela que exibe o plano de dieta e o gráfico de peso
  PatientDashboard: { planId: string };
  // Tela para adicionar um novo registro de peso
  WeightRecord: undefined;
  // Tela de detalhes do plano (se aplicável no futuro)
  DietPlanDetail: { planId: string };
};

// --- PROPS PARA CADA TELA ---

// ... (Props do AuthStack e AppStack permanecem as mesmas) ...

// --- PROPS ATUALIZADAS PARA O PACIENTE ---

export type PatientInitialScreenProps = NativeStackScreenProps<
  PatientAppStackParamList,
  'PatientInitial'
>;

export type SelectPlanScreenProps = NativeStackScreenProps<
  PatientAppStackParamList,
  'SelectPlan'
>;

export type PatientDashboardScreenProps = NativeStackScreenProps<
  PatientAppStackParamList,
  'PatientDashboard'
>;

export type WeightRecordScreenProps = NativeStackScreenProps<
  PatientAppStackParamList,
  'WeightRecord'
>;

export type DietPlanDetailScreenProps = NativeStackScreenProps<
  AppStackParamList | PatientAppStackParamList,
  'DietPlanDetail'
>;

// --- TIPOS PARA A PROPRIEDADE DE NAVEGAÇÃO ---

export type AppNavigationProp = NativeStackNavigationProp<AppStackParamList>;
export type PatientAppNavigationProp =
  NativeStackNavigationProp<PatientAppStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
