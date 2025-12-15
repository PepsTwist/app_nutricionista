// frontend/src/types/index.ts

export interface DietItem {
  id: string;
  description: string;
  quantity: string;
  notes?: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  dayOfWeek: string; // Já tínhamos adicionado isso, está correto.
  items: DietItem[];
}

// --- CORREÇÃO PRINCIPAL AQUI ---
// A interface Patient precisa ser definida primeiro.
export interface Patient {
  id: string;
  fullName: string;
  email: string;
  birthDate?: string;
  phone?: string;
}

// Agora, a interface DietPlan pode referenciar a interface Patient.
export interface DietPlan {
  id: string;
  name: string;
  description: string;
  meals: Meal[];
  patient: Patient; // Adicionamos o objeto 'patient' que a API retorna.
}

export interface WeightRecord {
  id: string;
  weight: number;
  recordDate: string; // 'YYYY-MM-DD'
}
