<template>
  <div>
    <div v-for="(_, index) in selectedFoods" class="food-entry" :key="index">
     <n-select
        v-model:value="selectedFoods[index].id"
        :options="foods"
        label-field="name"
        value-field="id"
        filterable
        clearable
        placeholder="Elija nuevo alimento"
        class="ingredient-select"
        @update:value="updateSelectedFood()"
      />
      <input type="number" min="0" v-model.number="selectedFoods[index].quantity" @input="calculateTotals" class="quantity-input">Gr</input>
      <button @click="removeFood(index)" class="ingredient-remove">🗑️</button>
    </div>

    <button @click="addFood" style="margin-top: 10px;">Añadir ingrediente</button>

    <h3>Macros totales:</h3>
    <p>Carbohidratos: {{ totals.carbs.toFixed(2) }} g</p>
    <p>Proteínas: {{ totals.protein.toFixed(2) }} g</p>
    <p>Grasas: {{ totals.fat.toFixed(2) }} g</p>
    <p>Grasas saturadas: {{ totals.saturatedFat.toFixed(2) }} g</p>
    <p>Calorías: {{ totals.calories.toFixed(2) }}</p>
  </div>
</template>

<style scoped>
.food-entry {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 5px;
  flex-wrap: nowrap; 
  overflow: hidden;
}

.ingredient-select {
  font-size: 14px;
  flex: 1 1 150px; 
  max-width: 500px;
}

.quantity-input {
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  flex: 0 1 50px; 
}

.ingredient-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
</style>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import type { FoodItem } from '../types/FoodItem'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { NSelect} from 'naive-ui'

interface SelectedFood {
  id: string
  quantity: number
}

const foods = ref<FoodItem[]>([])
const selectedFoods = ref<SelectedFood[]>([{id:'', quantity:100}])

const totals = reactive({
  carbs: 0,
  protein: 0,
  fat: 0,
  saturatedFat: 0,
  calories: 0
})

onMounted(async () => {
  await loadFoods()
  calculateTotals()
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
  selectedFoods.value.push({id:'', quantity:100})
}

function removeFood(index:number) {
  selectedFoods.value.splice(index,1)
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
</script>

