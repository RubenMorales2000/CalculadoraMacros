<template>
  <div class="app-container">
    <h2 v-if="!showForm">{{ editingFood ? 'Editar alimento' : 'Lista de alimentos' }}</h2>

    <!-- Lista de alimentos existentes -->
    <div v-if="!showForm" class="food-list">
      <ul>
        <li v-for="food in foods" :key="food.id" class="food-item">
          <div class="food-info">
            <strong>{{ food.name }}</strong> - {{ food.calories }} kcal
          </div>
            <button class = "food-action" @click="editFood(food)">✏️</button>
            <button class = "food-action" id="food-remove-button" @click="deleteFood(food.id)">🗑️</button>
        </li>
      </ul>
      <button @click="showForm = true">➕ Añadir nuevo alimento</button>
    </div>

    <!-- Formulario para añadir o editar alimento -->
    <div v-else>
      <h2>{{ editingFood ? 'Editar alimento' : 'Añadir alimento' }}</h2>
      <form @submit.prevent="saveFood">
        <input class="nombre-alimento" placeholder="Nombre" v-model="newFood.name" required />

        <div class="form-group" v-for="field in ['carbs', 'protein', 'fat', 'saturatedFat', 'calories']" :key="field">
          <label :for="field">{{ field }}:</label>
          <input
            class="newFoodInput"
            :id="field"
            type="number"
            v-model.number="(newFood as any)[field]"
            min="0"
            step="0.1"
            required
          />
        </div>

        <button type="submit">{{ editingFood ? 'Guardar cambios' : 'Guardar alimento' }}</button>
        <button type="button" @click="cancelForm">Cancelar</button>
      </form>
    </div>

    <p>{{ message }}</p>
  </div>
</template>


<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from '../firebase'

interface NewFood {
  name: string
  carbs: number
  protein: number
  fat: number
  saturatedFat: number
  calories: number
}

interface Food extends NewFood {
  id: string
}

const newFood = reactive<NewFood>({
  name: '',
  carbs: 0,
  protein: 0,
  fat: 0,
  saturatedFat: 0,
  calories: 0
})

const foods = ref<Food[]>([])
const message = ref('')
const showForm = ref(false)
const editingFood = ref<Food | null>(null)

async function loadFoods() {
  const snapshot = await getDocs(collection(db, "foods"))
  foods.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Food))
}

async function saveFood() {
  if (!newFood.name.trim()) {
    message.value = "El nombre es obligatorio."
    return
  }

  try {
    if (editingFood.value) {
      // Modo edición
      const foodRef = doc(db, "foods", editingFood.value.id)
      await updateDoc(foodRef, { ...newFood })
      message.value = `¡Alimento "${newFood.name}" actualizado!`
    } else {
      // Modo creación
      await addDoc(collection(db, "foods"), { ...newFood })
      message.value = `¡Alimento "${newFood.name}" guardado correctamente!`
    }

    cancelForm()
    await loadFoods()
  } catch (error) {
    message.value = 'Error guardando el alimento: ' + (error as Error).message
  }
}

function editFood(food: Food) {
  Object.assign(newFood, food)
  editingFood.value = food
  showForm.value = true
}

function cancelForm() {
  Object.assign(newFood, { name: '', carbs: 0, protein: 0, fat: 0, saturatedFat: 0, calories: 0 })
  showForm.value = false
  editingFood.value = null
}

async function deleteFood(id: string) {
  if (confirm("¿Seguro que deseas eliminar este alimento?")) {
    try {
      await deleteDoc(doc(db, "foods", id))
      message.value = "Alimento eliminado."
      await loadFoods()
    } catch (error) {
      message.value = 'Error eliminando el alimento: ' + (error as Error).message
    }
  }
}

onMounted(loadFoods)
</script>

<style scoped>
.food-list{
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  border-radius: 8px;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #ccc;
  max-width: 800px;
}

.food-info {
  flex: 1;
  text-align: left;
}

.food-action {
  padding: 4px 8px;
  margin-right: 0.5vh;
  background: none;
  border: none;
  cursor: pointer;
} 

.nombre-alimento {
  width: 32vw;
  margin: 0 auto;
}
.newFoodInput{
  min-width: 20vw;
}
</style>

