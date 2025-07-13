<template>
  <div>
    <h2>Selecciona alimentos</h2>
    <div v-for="(_, index) in selectedFoods" class="food-entry" :key="index">
      
     <n-select
        v-model:value="selectedFoods[index].id"
        :options="foods"
        label-field="name"
        value-field="id"
        filterable
        clearable
        placeholder="Elija nuevo alimento"
        class="food-select"
        @update:value="updateSelectedFood()"
      />
      
      <input type="number" min="0" v-model.number="selectedFoods[index].quantity" @input="calculateTotals" class="food-input">Gr</input>

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
import { NSelect} from 'naive-ui'

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

<style scoped>
.food-entry {
  display: flex;
  align-items: center;
  justify-content: center; 
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.food-select {
  font-size: 14px;
  max-width: 300px;
}

.food-input {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  width: 2vw;
  max-width: 400px;
  min-width: 35px;
}

.food-remove-button {
  background: none;
  margin-bottom: 15px;
  margin-left: 1vh;
  color: red;
  border: 1px solid red;
}

</style>
