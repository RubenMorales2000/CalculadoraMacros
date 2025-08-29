<template>
  <div class="app-container">
    <!-- Lista de alimentos -->
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
      <!-- Botones para añadir o escanear -->
      <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
        <button class="action-btn" style="font-size: 1.3rem" @click="showForm = true"><i class="fa-solid fa-plus"></i> Registrar </button>
        <button class="action-btn" style="font-size: 1.3rem" @click="startScanner"><i class="fa-solid fa-barcode"></i> Escanear </button>
      </div>
      <!-- Popup para escanear código EAN -->
      <n-modal v-model:show="scanning" @update:show="handleShowUpdate" preset="dialog" title="Escanear código EAN" style="width:70rem; max-width:80vw;">
        <div id="scanner" style=" margin: auto;"></div>
      </n-modal>
    </div>

    <!-- Formulario para crear/editar un nuevo alimento -->
    <div v-else>
      <h2>{{ editingFood ? 'Editar ingrediente' : 'Registrar ingrediente' }}</h2>
      <form @submit.prevent="saveFood">
        <input class="nombre-ingrediente" placeholder="Nombre" v-model="newFood.name" required />
        <div class="form-group" v-for="field in ['carbs', 'protein', 'fat', 'saturatedFat', 'calories']" :key="field">
          <label :for="field" class="foodInput-label">{{ fieldLabels[field] }}:</label>
          <input class="newFoodInput" :id="field" type="number" v-model.number="(newFood as any)[field]" min="0" step="0.1" required/>
        </div>
        
        <div style="display: flex; justify-content: center; gap: 0.5rem;">
          <button type="button" class="cancel-btn" @click="cancelForm"><i class="fa-solid fa-xmark"></i> Cancelar </button>
          <button type="submit" class="save-btn"><i class="fa-solid fa-floppy-disk"></i> Guardar </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* #region ********  Lista de alimentos  ***********/
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
/* #endregion **************************************/

/* #region *******  Formulario alimentos  **********/
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
/* #endregion **************************************/
</style>

<script lang="ts" setup>
import { reactive, ref, onMounted, nextTick } from 'vue'
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from '../firebase'
import { useNotification, NModal } from 'naive-ui'
import { getAuth } from "firebase/auth"
import { Html5Qrcode } from "html5-qrcode"

//#region *****************************************   Variables   *****************************************
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
const auth = getAuth()
const user = auth.currentUser
const scanning = ref(false)
let html5QrCode: Html5Qrcode | null = null
//#endregion **********************************************************************************************

//#region *******************************************   Hooks   *******************************************
onMounted(loadFoods)
//#endregion **********************************************************************************************

//#region *******************************************   Lista   *******************************************
async function loadFoods() {
  if(user){
    const foodsRef = collection(db, "users", user.uid, "foods")
    const snapshot = await getDocs(foodsRef)
    foods.value = snapshot.docs.map(doc => ({id: doc.id,...doc.data()} as Food))
  }
}
//#endregion **********************************************************************************************

//#region *****************************************   Formulario   ****************************************
async function saveFood() {
  if (!newFood.name.trim()) {
    notification.error({title:'Error', description:"El nombre es obligatorio.", duration:3000})
    return
  }

  if (!user) {
    notification.error({title: 'Error', description:"No hay usuario autenticado.", duration:3000})
    return
  }

  try {
    if (editingFood.value) {
      const foodRef = doc(db, "users", user.uid, "foods", editingFood.value.id)
      await updateDoc(foodRef, { ...newFood })
      notification.success({title: 'Guardado', description:`¡Alimento "${newFood.name}" actualizado!`, duration:3000})
    } 
    else {
      const foodsCollection = collection(db, "users", user.uid, "foods")
      await addDoc(foodsCollection, { ...newFood })
      notification.success({title: 'Guardado', description:`¡Alimento "${newFood.name}" guardado correctamente!`, duration:3000})
    }

    cancelForm()
    await loadFoods()
  } 
  catch (error:any) {
    notification.error({title:'Error', description:'Error guardando el ingrediente: ' + error, duration:3000})
  }
}

function editFood(food: Food) {
  Object.assign(newFood, food)
  editingFood.value = food
  showForm.value = true
}

function cancelForm() {
  Object.assign(newFood, {name:'', carbs:0, protein:0, fat:0, saturatedFat:0, calories:0})
  showForm.value = false
  editingFood.value = null
}

async function deleteFood(id:string) {
  if (!user) {
    notification.error({title:'Error', description:'No hay usuario autenticado.', duration:3000})
    return
  }

  if (confirm("¿Seguro que deseas eliminar este ingrediente?")) {
    try {
      const foodRef = doc(db, "users", user.uid, "foods", id)
      await deleteDoc(foodRef)
      notification.success({ title: 'Alimento Eliminado', description: "Alimento eliminado correctamente", duration: 3000 })
      await loadFoods()
    } 
    catch (error) {
      notification.error({ title: 'Error', description: 'Error eliminando el ingrediente: ' + (error as Error).message, duration: 3000 })
    }
  }
}
//#endregion **********************************************************************************************

//#region ******************************************   Scanner   *****************************************
async function startScanner() {
  scanning.value = true
  await nextTick()

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("scanner")
  }

  const config = {fps:10, qrbox:250}

  try {
    await html5QrCode.start({facingMode:"environment"},config,
      async (eanCode: string) => {
        await html5QrCode?.stop()
        scanning.value = false
        fetchFoodByEAN(eanCode)
      },
      errorMessage => {console.warn("Escaneo fallido:", errorMessage)}
    )
  } catch (err:any) {
    scanning.value = false
    notification.error({title:'Error', description:'No se pudo iniciar el escáner: ' + err, duration:3000})
  }
}

const handleShowUpdate = (value:boolean) => {
  scanning.value = value;
  if (!value) {
    stopScanner();
  }
};

async function stopScanner() {
  scanning.value = false
  if (html5QrCode?.isScanning) {
    await html5QrCode.stop()
  }
}

async function fetchFoodByEAN(ean:string) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${ean}.json`)
    const data = await response.json()

    if (data.status === 1) {
      const p = data.product
      newFood.name = p.product_name || 'Producto sin nombre'
      newFood.carbs = p.nutriments.carbohydrates_100g ?? 0
      newFood.protein = p.nutriments.proteins_100g ?? 0
      newFood.fat = p.nutriments.fat_100g ?? 0
      newFood.saturatedFat = p.nutriments['saturated-fat_100g'] ?? 0
      newFood.calories = p.nutriments['energy-kcal_100g'] ?? 0
      showForm.value = true
      editingFood.value = null

      notification.success({title:'Producto encontrado', description:`Se ha cargado: ${newFood.name}`, duration:3000})
    } else {
      notification.error({title:'No encontrado', description:`No se encontró producto con EAN ${ean}`, duration:3000})
    }
  } catch (error:any) {
    notification.error({title:'Error', description:'No se pudo obtener información del producto:' + error, duration:3000})
  }
}
//#endregion *******************************************************************************************
</script>



