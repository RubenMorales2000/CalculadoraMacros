<template>
  <div class="app-container">
    <h2>Añadir alimento</h2>
    <form @submit.prevent="addFood">
      <div class="nombre-alimento">
        <input placeholder="Nombre" id="name" v-model="newFood.name" required />
      </div>

      <div class="form-group">
        <label for="carbs">Carbohidratos(g):</label>
        <input id="carbs" class="newFoodInput" type="number" v-model.number="newFood.carbs" min="0" step="0.1" required />
      </div>

      <div class="form-group">
        <label for="protein">Proteínas(g):</label>
        <input id="protein" class="newFoodInput" type="number" v-model.number="newFood.protein" min="0" step="0.1" required />
      </div>

      <div class="form-group">
        <label for="fat">Grasas(g):</label>
        <input id="fat" class="newFoodInput" type="number" v-model.number="newFood.fat" min="0" step="0.1" required />
      </div>

      <div class="form-group">
        <label for="saturatedFat">Grasas sats(g):</label>
        <input id="saturatedFat" class="newFoodInput" type="number" v-model.number="newFood.saturatedFat" min="0" step="0.1" required />
      </div>

      <div class="form-group">
        <label for="calories">Calorías:</label>
        <input id="calories" class="newFoodInput" type="number" v-model.number="newFood.calories" min="0" step="0.1" required />
      </div>

      <button type="submit">Guardar alimento</button>
    </form>
    <p>{{ message }}</p>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { collection, addDoc } from "firebase/firestore"
import { db } from '../firebase'

interface NewFood {
  name: string
  carbs: number
  protein: number
  fat: number
  saturatedFat: number
  calories: number
}

const newFood = reactive<NewFood>({
  name: '',
  carbs: 0,
  protein: 0,
  fat: 0,
  saturatedFat: 0,
  calories: 0
})

const message = ref('')

async function addFood() {
  if (!newFood.name.trim()) {
    message.value = "El nombre es obligatorio."
    return
  }
  try {
    await addDoc(collection(db, "foods"), { ...newFood })
    message.value = `¡Alimento "${newFood.name}" guardado correctamente!`
    Object.assign(newFood, { name: '', carbs: 0, protein: 0, fat: 0, saturatedFat: 0, calories: 0 })
  } catch (error) {
    message.value = 'Error guardando el alimento: ' + (error as Error).message
  }
}
</script>
