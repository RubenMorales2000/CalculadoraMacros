<template>
  <div class="recetas-container">

    <!-- Lista de recetas creadas -->
    <div v-if="!showForm">
      <ul class="recipe-list">
        <li v-for="recipe in recipes" :key="recipe.id" class="recipe-item">
          <div class="recipe-info">
            <strong>{{ recipe.name }}</strong>
          </div>
          <button class="recipe-action" @click="editRecipe(recipe)"> ✏️ </button>
          <button class="recipe-action" @click="deleteRecipe(recipe.id)"> 🗑️ </button>
        </li>
      </ul>

      <div>
        <button class="action-btn" @click="startNewRecipe" style="font-size: 1.25rem;"><i class="fas fa-plus"></i> Registrar </button>
      </div>
    </div>

    <!-- Formulario para la creacion / edicion de recetas -->
    <div v-else>
      <div class="form-group">
        <label for="recipe-name"> Nombre de la receta: </label>
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
          placeholder="Elija alimento"
          class="ingredient-select"
        />
        <input type="number" min="0" v-model.number="ingredients[index].amount" class="quantity-input"> Gr </input>
        <button @click="removeIngredient(index)" class="ingredient-remove"> 🗑️ </button>
      </div>

      <div class="button-row">
        <div>
          <button @click="addIngredient" class="action-btn"><i class="fa-solid fa-bowl-rice"></i> Añadir ingrediente </button>
        </div>
        <div class="right-buttons">
          <button @click="cancelEdit" class="cancel-btn"><i class="fa-solid fa-xmark"></i> Cancelar </button>
          <button @click="saveRecipe" class="save-btn"><i class="fa-solid fa-floppy-disk"></i> Guardar </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* #region ***********  Contenedores  **************/
.recetas-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 1rem;
}
/* #endregion **************************************/

/* #region *********  Lista de recetas  ************/
.recipe-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.recipe-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

.recipe-info {
  flex: 1;
}

.recipe-action {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 10px;
}
/* #endregion **************************************/

/* #region ************  Formulario  ***************/
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
  font-size: 1rem;
  flex: 0 1 80px;
}

.ingredient-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.button-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.right-buttons {
  display: flex;
  gap: 10px;
}
/* #endregion **************************************/
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { useNotification, NSelect } from 'naive-ui'

//#region *****************************************   Variables   *****************************************
interface FoodItem {
  id: string
  name: string
}

interface Ingredient {
  foodId: string
  amount: number
}

interface Recipe {
  id: string
  name: string
  ingredients: Ingredient[]
}

const foods = ref<FoodItem[]>([])
const recipes = ref<Recipe[]>([])
const recipeName = ref('')
const ingredients = ref<Ingredient[]>([{foodId:'', amount:0}])
const showForm = ref(false)
const isEditing = ref(false)
const editingId = ref('')
const notification = useNotification()
//#endregion **********************************************************************************************

//#region *******************************************   Hooks   *******************************************
onMounted(async () => {
  await loadFoods()
  await loadRecipes()
})
//#endregion **********************************************************************************************

//#region ***************************************   Cargar datos   ****************************************
async function loadFoods() {
  const userId = getAuth().currentUser?.uid
  if (!userId) return

  const snapshot = await getDocs(collection(db, 'users', userId, 'foods'))
  foods.value = snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name
  }))
}

async function loadRecipes() {
  const userId = getAuth().currentUser?.uid
  if (!userId) return

  const snapshot = await getDocs(collection(db, 'users', userId, 'recipes'))
  recipes.value = snapshot.docs.map(doc => ({
    id: doc.id,
    name: doc.data().name,
    ingredients: doc.data().ingredients || []
  }))
}
//#endregion **********************************************************************************************

//#region **************************************   Edicion recetas   **************************************
function addIngredient() {
  ingredients.value.push({ foodId: '', amount: 0 })
}

function removeIngredient(index: number) {
  ingredients.value.splice(index, 1)
}

function startNewRecipe() {
  showForm.value = true
  isEditing.value = false
  editingId.value = ''
  recipeName.value = ''
  ingredients.value = [{ foodId: '', amount: 0 }]
}

function cancelEdit() {
  showForm.value = false
  recipeName.value = ''
  ingredients.value = [{ foodId: '', amount: 0 }]
}

function editRecipe(recipe: Recipe) {
  recipeName.value = recipe.name
  ingredients.value = recipe.ingredients.map(i => ({ ...i }))
  editingId.value = recipe.id
  isEditing.value = true
  showForm.value = true
}

async function saveRecipe() {
  const userId = getAuth().currentUser?.uid
  if (!userId) return

  const validIngredients = ingredients.value.filter(i => i.foodId && i.amount > 0)
  if (!recipeName.value.trim()) {
    notification.error({ title: 'Error', description: 'El nombre de la receta es obligatorio', duration: 3000 })
    return
  }

  if (validIngredients.length === 0) {
    notification.error({ title: 'Error', description: 'Agrega al menos un ingrediente válido.', duration: 3000 })
    return
  }

  try {
    if (isEditing.value && editingId.value) {
      await updateDoc(doc(db, 'users', userId, 'recipes', editingId.value), {
        name: recipeName.value.trim(),
        ingredients: validIngredients
      })
      notification.success({ title: 'Actualizada', description: 'Receta modificada correctamente', duration: 3000 })
    } else {
      await addDoc(collection(db, 'users', userId, 'recipes'), {
        name: recipeName.value.trim(),
        ingredients: validIngredients
      })
      notification.success({ title: 'Guardado', description: '¡Receta guardada correctamente!', duration: 3000 })
    }

    await loadRecipes()
    cancelEdit()
  } catch (err) {
    notification.error({ title: 'Error', description: 'No se pudo guardar la receta.', duration: 3000 })
    console.error(err)
  }
}

async function deleteRecipe(id: string) {
  const userId = getAuth().currentUser?.uid
  if (!userId) return

  try {
    await deleteDoc(doc(db, 'users', userId, 'recipes', id))
    notification.success({ title: 'Eliminada', description: 'Receta borrada correctamente', duration: 3000 })
    await loadRecipes()
  } catch (err) {
    notification.error({ title: 'Error', description: 'No se pudo eliminar la receta.', duration: 3000 })
    console.error(err)
  }
}
//#endregion **********************************************************************************************
</script>

