<template>
  <NNotificationProvider placement="top">
    <div class="app-container">
      <div v-if="loading" class="loading">Cargando...</div>
      <!-- Si el usuario tiene la sesión iniciada -->
      <div v-else-if="user">
        <!-- Barra superior -->
        <nav class="top-bar" aria-label="Barra superior de navegación">
          <div class="left-section">
            <img src="/public/logo.png" alt="Kalos Logo" style="width:10vh; max-width:40px; height:auto;">
            <div class="app-name">Kalos</div>
          </div>
          <div class="page-title">{{ viewTitle }}</div>
        </nav>

        <!-- Contenido de la vista -->
        <div class="view-container">
          <MacroCalculator v-if="currentView === 'calculator'" />
          <AddFood v-if="currentView === 'addFood'" />
          <RecipesView v-if="currentView === 'recipes'" />
          <ObjectivesView v-if="currentView === 'objetives'"/>
        </div>

        <!-- Barra inferior -->
        <nav class="bottom-bar"  aria-label="Barra inferior de navegación">
          <button :class="{active:currentView === 'calculator'}" @click="currentView = 'calculator'"><i class="fas fa-calculator"></i></button>
          <button :class="{active:currentView === 'addFood' }" @click="currentView = 'addFood'"><i class="fas fa-apple-alt"></i></button>
          <button :class="{active:currentView === 'recipes' }" @click="currentView = 'recipes'"><i class="fas fa-utensils"></i></button>
          <button :class="{active:currentView === 'objetives' }" @click="currentView = 'objetives'"><i class="fas fa-weight-scale"></i></button>
          <button @click="logout" class="logout-btn"><i class="fas fa-arrow-right-from-bracket"></i></button>
        </nav>
      </div>
      
      <!-- Si el usuario no ha iniciado sesión  --> 
      <div v-else>
        <img src="/public/logo.png" alt="Kalos Logo" style="width:6vw; height:auto; margin-top:8rem;">
        <h2> ¡Bienvenido a Kalos! </h2>
        <h3 style="margin-top:5rem;"> Inicie sesión para poder empezar a usar la aplicación </h3>
        <button @click="login" class="login-button"> Iniciar sesión con Google </button>
      </div>
    </div>
  </NNotificationProvider>
</template>

<script setup lang="ts">
import { ref, onMounted, computed  } from 'vue'
import MacroCalculator from './views/MacroCalculator.vue'
import AddFood from './views/AddFood.vue'
import RecipesView from './views/RecipesView.vue'
import ObjectivesView from './views/ObjectivesView.vue'
import { NNotificationProvider } from 'naive-ui'
import { loginWithGoogle, logout as logoutService, getCurrentUser } from './services/authService'
import type { User } from 'firebase/auth'

const currentView = ref<'calculator' | 'addFood' | 'recipes' | 'objetives'>('calculator')
const user = ref<User | null>(null)
const loading = ref(true)

const viewTitle = computed(() => {
  switch (currentView.value) {
    case 'calculator': return 'Calculadora de Macros';
    case 'addFood': return 'Lista de Ingredientes';
    case 'recipes': return 'Lista de Recetas';
    case 'objetives': return 'Objetivos Diarios';
    default: return '';
  }
})

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
/* #region ***********  Contenedores  **************/
.app-container {
  margin: 0 auto;
  background: #1e1e1e;
  font-family: system-ui, sans-serif;
  color: white;
  height: max-content;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.view-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  margin-bottom: 4rem; 
}
/* #endregion **************************************/

/* #region **********  Barra superior  *************/
.top-bar {
  position: relative;
  height: 3.5rem;
  display: flex;
  align-items: center;
  padding: 0 0.8rem;
  background-color: #1e1e1e;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  z-index: 1000;
}
.left-section {
  display: flex;
  align-items: center;
}
.app-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-left: 0.5rem;
  pointer-events: none;
}
.page-title {
  margin-left: auto;
  white-space: nowrap;        
  font-size: 1.5rem;
  font-weight: 400;
  color: #ccc;
  pointer-events: none;
  overflow: hidden;
  text-overflow: ellipsis;   
  padding-right: 1rem;
}
/* #endregion **************************************/

/* #region **********  Barra inferior  *************/
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 10vh;
  max-height: 4rem;
  background-color: #3498db;
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 1000;
  box-shadow: 0 -2px 6px rgba(0,0,0,0.1);
}

.bottom-bar button {
  background: transparent;
  color: white;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.bottom-bar button:hover,
.bottom-bar button.active {
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
/* #endregion **************************************/

/* #region **************  Login  ******************/
.loading {
  text-align: center;
  margin-top: 10rem;
  font-size: 2rem;
}

.login-button {
  background-color: #3498db;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.2s ease;
  margin-top: 2rem;
}

.login-button:hover {
  background-color: #2980b9;
}
/* #endregion **************************************/
</style>
