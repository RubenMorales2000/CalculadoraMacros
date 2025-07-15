<template>
  <NNotificationProvider placement="top">
    <div class="app-container">
      <div v-if="loading" class="loading">Cargando...</div>

      <div v-else-if="user">
        <div class="nav-buttons">
          <button v-if="currentView === 'calculator'" @click="goToAddFood" class="switch-button">
            ➕ Tu nevera
          </button>
          <button v-if="currentView === 'addFood'" @click="goToCalculator" class="switch-button">
            🔙 Volver a calculadora
          </button>
          <button @click="logout" class="logout-button">Cerrar sesión</button>
        </div>

        <MacroCalculator v-if="currentView === 'calculator'" />
        <AddFood v-if="currentView === 'addFood'" />
      </div>

      <div v-else class="login-container">
        <button @click="login" class="login-button">Iniciar sesión con Google</button>
      </div>
    </div>
  </NNotificationProvider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MacroCalculator from './views/MacroCalculator.vue'
import AddFood from './views/AddFood.vue'
import { NNotificationProvider } from 'naive-ui'
import { loginWithGoogle, logout as logoutService, getCurrentUser } from './services/authService'
import type { User } from 'firebase/auth'

const currentView = ref<'calculator' | 'addFood'>('calculator')
const user = ref<User | null>(null)
const loading = ref(true)

onMounted(async () => {
  user.value = await getCurrentUser()
  loading.value = false
})

function goToAddFood() {
  currentView.value = 'addFood'
}

function goToCalculator() {
  currentView.value = 'calculator'
}

async function login() {
  try {
    user.value = await loginWithGoogle()
  } 
  catch (error) {
    console.error(error)
  }
}

async function logout() {
  await logoutService()
  user.value = null
  currentView.value = 'calculator' 
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  margin: 0 auto;
  max-width: 900px;
}

.loading {
  text-align: center;
  margin-top: 100px;
  font-size: 18px;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.switch-button,
.logout-button,
.login-button {
  background-color: #3498db;
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.switch-button:hover,
.logout-button:hover,
.login-button:hover {
  background-color: #2980b9;
}

.login-container {
  display: flex;
  justify-content: center;
  margin-top: 120px;
}
</style>
