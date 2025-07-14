<template>
  <div class="app-container">
    <h2 v-if="!showForm">{{ editingFood ? 'Editar ingrediente' : 'Lista de ingredientes' }}</h2>

    <div v-if="!showForm" class="food-list">
      <ul style="margin-block-start: 0.5em; margin-block-end: 1em; padding-inline-start: 2px; ">
        <li v-for="food in foods" :key="food.id" class="food-item">
          <div class="food-info">
            <strong>{{ food.name }}</strong> - {{ food.calories }} kcal
          </div>
            <button class="food-action" @click="editFood(food)">✏️</button>
            <button class="food-action" @click="deleteFood(food.id)">🗑️</button>
        </li>
      </ul>
      <button @click="showForm = true">➕ Añadir nuevo ingrediente</button>
    </div>

    <div v-else>
      <h2>{{ editingFood ? 'Editar ingrediente' : 'Añadir ingrediente' }}</h2>
      <form @submit.prevent="saveFood">
        <input class="nombre-ingrediente" placeholder="Nombre" v-model="newFood.name" required />
        <div class="form-group" v-for="field in ['carbs', 'protein', 'fat', 'saturatedFat', 'calories']" :key="field">
          <label :for="field" class="foodInput-label">{{ fieldLabels[field] }}:</label>
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
        
        <div style="display: flex; justify-content: center; gap: 0.5rem;">
          <button type="button" @click="cancelForm">Cancelar</button>
          <button type="submit">Guardar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.food-list{
  max-width: 800px;
  margin: 0 auto;
  border-radius: 8px;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #ccc;
}

.food-info {
  flex: 1;
  text-align: left;
}

.food-action {
  padding: 4px 8px;
  margin-right: 0.5vw;
  background: none;
  border: none;
  cursor: pointer;
} 

.nombre-ingrediente {
  width: 400px;
  max-width: 80vw;
  margin: 0 auto; 
}

.form-group {
  display: grid;
  grid-template-columns: 150px 1fr;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem auto;
  width: fit-content;
}

.foodInput-label {
  width: max-content;
}

.newFoodInput{
  width: 100px;
  max-width: 10vw;
}
</style>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from '../firebase'
import { useNotification } from 'naive-ui'

const fieldLabels: Record<string, string> = {
  carbs: 'Carbohidratos',
  protein: 'Proteínas',
  fat: 'Grasas',
  saturatedFat: 'Grasas saturadas',
  calories: 'Calorías'
}

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
const showForm = ref(false)
const editingFood = ref<Food | null>(null)
const notification = useNotification()

onMounted(loadFoods)

async function loadFoods() {
  const snapshot = await getDocs(collection(db, "foods"))
  foods.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Food))
}

async function saveFood() {
  if (!newFood.name.trim()) {
    notification.error({title:'Error', description:"El nombre es obligatorio.", duration:3000})
    return
  }

  try {
    if (editingFood.value) {
      const foodRef = doc(db, "foods", editingFood.value.id)
      await updateDoc(foodRef, { ...newFood })
      notification.success({title:'Guardado', description:`¡Alimento "${newFood.name}" actualizado!`, duration:3000})
    } else {
      await addDoc(collection(db, "foods"), { ...newFood })
      notification.success({title:'Guardado', description:`¡Alimento "${newFood.name}" guardado correctamente!`, duration:3000})
    }

    cancelForm()
    await loadFoods()
  } 
  catch (error) {
    notification.error({title:'Error', description:'Error guardando el ingrediente: ' + (error as Error).message, duration:3000})
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
  if (confirm("¿Seguro que deseas eliminar este ingrediente?")) {
    try {
      await deleteDoc(doc(db, "foods", id))
      notification.success({title:'Alimento Eliminado', description:"Alimento eliminado correctamente", duration:3000})
      await loadFoods()
    } 
    catch (error) {
      notification.error({title:'Error', description:'Error eliminando el ingrediente: ' + (error as Error).message, duration:3000})
    }
  }
}
</script>



