<template>
  <div>
    <!-- Lista actual de alimentos -->
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
        @update:value="updateSelectedFood"
      />
      <input
        type="number"
        min="0"
        v-model.number="selectedFoods[index].quantity"
        @input="calculateTotals"
        class="quantity-input"
      />Gr</input>
      <button @click="removeFood(index)" class="ingredient-remove">🗑️</button>
    </div>

    <div style="display: flex; justify-content: center; gap: 1.0rem; margin-top: 10px;">
      <button class="action-button" @click="addFood"><i class="fa-solid fa-bowl-rice"></i> Añadir Ingrediente </button>
      <!-- Selector de recetas con botón y popup -->
      <div>
        <n-popover trigger="click">
          <template #trigger>
            <button class="action-button"><i class="fa-solid fa-magnifying-glass-plus"></i> Añadir Receta </button>
          </template>
          <p style="max-width: 40rem;"> Elija una receta se su lista de recetas para añadir automáticamente todos sus ingredientes </p>
          <n-select
            v-model:value="selectedRecipeId"
            :options="recipes"
            label-field="name"
            value-field="id"
            placeholder="Seleccione una receta"
            clearable
            @update:value="onRecipeSelected"
            style="min-width: 200px"
            />
        </n-popover>
      </div>
    </div>
      
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
  font-size: 1rem;
  flex: 1 1 150px;
  max-width: 500px;
}

.quantity-input {
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
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
import { NSelect, NPopover } from 'naive-ui'
import { getAuth } from 'firebase/auth'

//#region *****************************************   Variables   *****************************************
interface SelectedFood {
  id: string
  quantity: number
}

interface Recipe {
  id: string
  name: string
  ingredients: {id:string; quantity:number}[]
}

const foods = ref<FoodItem[]>([])
const selectedFoods = ref<SelectedFood[]>([{id:'', quantity:100}])
const auth = getAuth()
const user = auth.currentUser

const totals = reactive({
  carbs: 0,
  protein: 0,
  fat: 0,
  saturatedFat: 0,
  calories: 0
})

const recipes = ref<Recipe[]>([])
const selectedRecipeId = ref<string | null>(null)
//#endregion **********************************************************************************************

//#region *****************************************   Alimentos   *****************************************
onMounted(async () => {
  await loadFoods()
  await loadRecipes()
  let storedFoods = localStorage.getItem('selectedFoods'+new Date().toISOString().split('T')[0])
  selectedFoods.value = (storedFoods ? JSON.parse(storedFoods) : [{ id: '', quantity: 100 }])
  calculateTotals()
})

async function loadFoods() {
  if (user) {
    const foodsRef = collection(db, 'users', user.uid, 'foods')
    const querySnapshot = await getDocs(foodsRef)
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
}

async function loadRecipes() {
  if (user) {
    const recipesRef = collection(db, 'users', user.uid, 'recipes')
    const querySnapshot = await getDocs(recipesRef)
    recipes.value = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        ingredients: data.ingredients || []
      } as Recipe
    })
  }
}

function addFood() {
  selectedFoods.value.push({id:'', quantity:100})
}

function removeFood(index:number) {
  selectedFoods.value.splice(index, 1)
  calculateTotals()
}

function updateSelectedFood() {
  calculateTotals()
}
//#endregion *********************************************************************************************

//#region ***************************************   Calculo totales   *************************************
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

  localStorage.setItem('selectedFoods'+new Date().toISOString().split('T')[0], JSON.stringify(selectedFoods.value))
}

function onRecipeSelected(recipeId: string | null) {
  if (!recipeId) return

  const recipe = recipes.value.find(r => r.id === recipeId)
  if (!recipe) return

  recipe.ingredients.forEach((ingredient:any) => {
    selectedFoods.value.push({ id: ingredient.foodId, quantity: ingredient.amount })
  })

  calculateTotals()
  selectedRecipeId.value = null
}
//#endregion *********************************************************************************************
</script>
