export interface FoodItem {
  id: string;
  name: string;
  carbs: number;            // gramos por 100g
  protein: number;          // gramos por 100g
  fat: number;              // gramos por 100g
  saturatedFat: number;     // gramos por 100g
  calories: number;         // kcal por 100g
}