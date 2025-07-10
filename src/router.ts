// src/router.ts
import { createRouter, createWebHistory } from 'vue-router'
import MacroCalculator from './views/MacroCalculator.vue'
import AddFood from './views/AddFood.vue'

const routes = [
  { path: '/', name: 'Calculadora', component: MacroCalculator },
  { path: '/add-food', name: 'Añadir alimento', component: AddFood }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
