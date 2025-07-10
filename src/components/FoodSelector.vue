<template>
  <div>
    <h2>Selecciona alimentos</h2>
    <div v-for="(_, index) in selectedFoods" class="food-entry" :key="index">
      <select v-model="selectedFoods[index].id" @change="updateSelectedFood()" class="food-select">
        <option disabled value="">Elija nuevo alimento</option>
        <option v-for="food in foods" :key="food.id" :value="food.id">
          {{ food.name }}
        </option>
      </select>

      <input type="number" min="0" v-model.number="selectedFoods[index].quantity" @input="calculateTotals" class="food-input">
       Gramos
      </input>

      <button @click="removeFood(index)" class="food-remove-button"><i class="fas fa-trash-alt"></i> </button>
    </div>

    <button @click="addFood">Añadir alimento a la comida</button>

    <h3>Macros totales:</h3>
    <p>Carbohidratos: {{ totals.carbs.toFixed(2) }} g</p>
    <p>Proteínas: {{ totals.protein.toFixed(2) }} g</p>
    <p>Grasas: {{ totals.fat.toFixed(2) }} g</p>
    <p>Grasas saturadas: {{ totals.saturatedFat.toFixed(2) }} g</p>
    <p>Calorías: {{ totals.calories.toFixed(2) }}</p>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import type { FoodItem } from '../types/FoodItem'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'

interface SelectedFood {
  id: string
  quantity: number
}

const foods = ref<FoodItem[]>([])
const selectedFoods = ref<SelectedFood[]>([
  { id: '', quantity: 100 }
])

const totals = reactive({
  carbs: 0,
  protein: 0,
  fat: 0,
  saturatedFat: 0,
  calories: 0
})

async function loadFoods() {
  const querySnapshot = await getDocs(collection(db, "foods"))
  foods.value = querySnapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      carbs: data.carbs,
      protein: data.protein,
      fat: data.fat,
      saturatedFat: data.saturatedFat || 0,
      calories: data.calories
    } as FoodItem
  })
}

function addFood() {
  selectedFoods.value.push({ id: '', quantity: 100 })
}

function removeFood(index: number) {
  selectedFoods.value.splice(index, 1)
  calculateTotals()
}

function updateSelectedFood() {
  calculateTotals()
}

function calculateTotals() {
  totals.carbs = 0
  totals.protein = 0
  totals.fat = 0
  totals.saturatedFat = 0
  totals.calories = 0

  selectedFoods.value.forEach(sf => {
    const food = foods.value.find(f => f.id === sf.id)
    if (food && sf.quantity > 0) {
      const factor = sf.quantity / 100
      totals.carbs += food.carbs * factor
      totals.protein += food.protein * factor
      totals.fat += food.fat * factor
      totals.saturatedFat += food.saturatedFat * factor
      totals.calories += food.calories * factor
    }
  })
}

onMounted(async () => {
  await loadFoods()
  calculateTotals()
})
</script>
