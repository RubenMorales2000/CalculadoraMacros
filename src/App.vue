<script setup lang="ts">
import { ref } from 'vue'
import MacroCalculator from './views/MacroCalculator.vue'
import AddFood from './views/AddFood.vue'

const currentView = ref<'calculator' | 'addFood'>('calculator')

function goToAddFood() {
  currentView.value = 'addFood'
}

function goToCalculator() {
  currentView.value = 'calculator'
}
</script>

<template>
  <div class="app-container">
    <div class="nav-buttons">
      <button v-if="currentView === 'calculator'" @click="goToAddFood" class="switch-button">
        ➕ Tu nevera
      </button>
      <button v-if="currentView === 'addFood'" @click="goToCalculator" class="switch-button">
        🔙 Volver a calculadora
      </button>
    </div>

    <MacroCalculator v-if="currentView === 'calculator'" />
    <AddFood v-if="currentView === 'addFood'" />
  </div>
</template>

<style scoped>
.app-container {
  padding-right: 20px;
  padding-left: 20px;
  margin: 0 auto;
}

.nav-buttons {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.switch-button {
  background-color: #3498db;
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.switch-button:hover {
  background-color: #2980b9;
}
</style>
