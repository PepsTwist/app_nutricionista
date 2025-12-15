// Caminho do Ficheiro: frontend/src/types/diet.ts

// Define a estrutura de um item da refeição
export interface MealItem {
  id: string;
  description: string;
  quantity: string;
  notes?: string;
}

// Define a estrutura de uma refeição
export interface Meal {
  id: string;
  name: string;
  time: string;
  items: MealItem[];
}

// Define a estrutura completa de um Plano de Dieta
export interface DietPlan {
  id: string;
  name: string;
  description?: string;
  isActive: boolean; // Propriedade necessária
  meals: Meal[];
  patient: {
    id: string;
  };

  // Propriedades de data que vêm do backend
  createdAt: string; // Propriedade necessária
  updatedAt: string; // Propriedade necessária
}

// Outros tipos úteis para a sua aplicação
export interface WeightRecord {
  id: string;
  weight: number;
  recordDate: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  birthDate?: string;
}
