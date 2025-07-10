<template>
  <div>
    <h1>Calculadora de Macros</h1>
    <FoodSelector :onUpdate="handleUpdate" />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import FoodSelector from '../components/FoodSelector.vue'

const summary = reactive({
  carbs: 0,
  protein: 0,
  fat: 0,
  saturatedFat: 0,
  calories: 0
})

function handleUpdate(data: typeof summary) {
  Object.assign(summary, data)
}
</script>
