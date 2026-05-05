export interface Macros {
  energy: string;
  protein: string;
  carbs: string;
  fats: string;
}

export interface Meal {
  id: string;
  label: string;
  category: 'CORE' | 'LEAN' | 'ZERO' | 'MASS' | 'BOOST' | 'READY';
  title: string;
  subtitle: string;
  desc: string;
  macros: Macros;
  img: string;
  proteinSource: string[];
  goals: string[];
  servingStyle: string[];
  calories: number;
  proteinValue: number;
  carbsValue: number;
  fatsValue: number;
  labDetails?: {
    protein: { name: string; weight: number }[];
    carb: { name: string; weight: number; unit?: string }[];
    veggies: { name: string; weight: number }[];
    sauce: { name: string; weight: number }[];
  };
}
