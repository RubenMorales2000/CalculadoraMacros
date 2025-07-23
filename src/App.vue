<template>
  <NNotificationProvider placement="top">
    <div class="app-container">
      <div v-if="loading" class="loading">Cargando...</div>

      <div v-else-if="user">
        <nav class="top-bar">
          <img src="/public/logo.png" alt="Kalos Logo" style="width:40px; height: auto;">
          <div class="nav-title"> Kalos </div>
          <div class="nav-links">
            <button :class="{active:currentView === 'calculator'}" @click="currentView = 'calculator'"><i class="fas fa-calculator"></i></button>
            <button :class="{active:currentView === 'addFood' }"   @click="currentView = 'addFood'"><i class="fas fa-apple-alt"></i></button>
            <button :class="{active:currentView === 'recipes' }"   @click="currentView = 'recipes'"><i class="fas fa-utensils"></i></button>
            <button :class="{active:currentView === 'history' }"   @click="currentView = 'history'"><i class="fas fa-bullseye"></i></button>
            <button @click="logout" class="logout-btn"><i class="fas fa-sign-out-alt"></i></button>
          </div>
        </nav>

        <div class="view-container">
          <MacroCalculator v-if="currentView === 'calculator'" />
          <AddFood v-if="currentView === 'addFood'" />
          <RecipesView v-if="currentView === 'recipes'"/>
          <div v-if="currentView === 'history'">📈 Aquí van tus objetivos diarios</div>
        </div>
      </div>

      <div v-else>
        <img src="/public/logo.png" alt="Kalos Logo" style="width:100px; height: auto; margin:20px;">
        <h2>¡Bienvenido a Kalos!</h2>
        <button @click="login" class="login-button">Iniciar sesión con Google</button>
      </div>
    </div>
  </NNotificationProvider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MacroCalculator from './views/MacroCalculator.vue'
import AddFood from './views/AddFood.vue'
import RecipesView from './views/RecipesView.vue'
import { NNotificationProvider } from 'naive-ui'
import { loginWithGoogle, logout as logoutService, getCurrentUser } from './services/authService'
import type { User } from 'firebase/auth'

const currentView = ref<'calculator' | 'addFood' | 'recipes' | 'history'>('calculator')
const user = ref<User | null>(null)
const loading = ref(true)

onMounted(async () => {
  user.value = await getCurrentUser()
  loading.value = false
})

async function login() {
  try {
    user.value = await loginWithGoogle()
  } catch (error) {
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
  margin: 0 auto;
  background: #1e1e1e;
  font-family: system-ui, sans-serif;
  color: white;
  height: 100vh;
}

.top-bar {
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  z-index: 1000;
}

.nav-title {
  font-size: 18px;
  font-weight: bold;
  flex: 1;
  text-align: left;
  margin-left: 10px;
}

.nav-links {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-links button {
  background: transparent;
  color: white;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;

  flex: 1 1 0;
  max-width: 18vw;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.nav-links button:hover,
.nav-links button.active {
  background-color: rgba(255, 255, 255, 0.2);
}

.logout-btn {
  background-color: #e74c3c;
  padding: 6px 12px;
  border-radius: 4px;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.view-container {
  padding: 20px;
}

.loading {
  text-align: center;
  margin-top: 100px;
  font-size: 18px;
}

.login-button {
  background-color: #3498db;
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
  margin-top: 120px;
}

.login-button:hover {
  background-color: #2980b9;
}
</style>
