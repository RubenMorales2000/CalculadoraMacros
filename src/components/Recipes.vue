<template>
  <div class="recetas-container">
    <div class="form-group">
      <label for="recipe-name">Nombre de la receta:</label>
      <input v-model="recipeName" id="recipe-name" type="text" />
    </div>

    <div v-for="(_, index) in ingredients" class="ingredient-entry" :key="index">
     <n-select
        v-model:value="ingredients[index].foodId"
        :options="foods"
        label-field="name"
        value-field="id"
        filterable
        clearable
        placeholder="Elija nuevo alimento"
        class="ingredient-select"
      />
      <input type="number" min="0" v-model.number="ingredients[index].amount" class="quantity-input">Gr</input>
      <button @click="removeIngredient(index)" class="ingredient-remove">🗑️</button>
    </div>

    <button @click="addIngredient">➕ Añadir ingrediente</button>
    <button @click="saveRecipe" class="save-btn">💾 Guardar receta</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useNotification, NSelect } from 'naive-ui'

interface FoodItem {
  id: string
  name: string
}

interface Ingredient {
  foodId: string
  amount: number
}

const foods = ref<FoodItem[]>([])
const recipeName = ref('')
const ingredients = ref<Ingredient[]>([{ foodId: '', amount: 0 }])
const notification = useNotification()

async function loadFoods() {
  const userId = getAuth().currentUser?.uid
  if (!userId) return

  const snapshot = await getDocs(collection(db, 'users', userId, 'foods'))
  foods.value = snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name
  }))
}

function addIngredient() {
  ingredients.value.push({ foodId: '', amount: 0 })
}

function removeIngredient(index: number) {
  ingredients.value.splice(index, 1)
}

async function saveRecipe() {
  const userId = getAuth().currentUser?.uid
  if (!userId) return

  if (!recipeName.value.trim()) {
    notification.error({ title: 'Error', description: 'El nombre de la receta es obligatorio', duration: 3000 })
    return
  }

  const validIngredients = ingredients.value.filter(i => i.foodId && i.amount > 0)
  if (validIngredients.length === 0) {
    notification.error({ title: 'Error', description: 'Agrega al menos un ingrediente válido.', duration: 3000 })
    return
  }

  try {
    await addDoc(collection(db, 'users', userId, 'recipes'), {
      name: recipeName.value.trim(),
      ingredients: validIngredients
    })
    notification.success({ title: 'Guardado', description: '¡Receta guardada correctamente!', duration: 3000 })

    // Reset form
    recipeName.value = ''
    ingredients.value = [{ foodId: '', amount: 0 }]
  } catch (err) {
    notification.error({ title: 'Error', description: 'No se pudo guardar la receta.', duration: 3000 })
    console.error(err)
  }
}

onMounted(loadFoods)
</script>

<style scoped>
.recetas-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.ingredient-entry {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.quantity-input {
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 14px;
  flex: 0 1 80px; 
}

input,
select {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.save-btn {
  margin-top: 12px;
  padding: 8px 14px;
  margin-left: 20px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.ingredient-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
</style>
