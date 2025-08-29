<template>
  <!-- Los objetivos diarios del usuario -->
  <div class="objectives-container">
    <div class="objective-group">
      <label for="calories"> Calorías: </label>
      <input type="number" class="number-input-right" id="calories" v-model.number="objectives.calories" />
    </div>

    <div class="objective-group">
      <label for="protein"> Proteínas (g): </label>
      <input type="number" class="number-input-right" id="protein" v-model.number="objectives.protein" />
    </div>

    <div class="objective-group">
      <label for="carbs"> Carbohidratos (g): </label>
      <input type="number" class="number-input-right" id="carbs" v-model.number="objectives.carbs" />
    </div>

    <div class="objective-group">
      <label for="fat"> Grasas (g): </label>
      <input type="number" class="number-input-right" id="fat" v-model.number="objectives.fat" />
    </div>

    <button @click="saveObjectives" class="save-btn save-btn-right"><i class="fa-solid fa-floppy-disk"></i> Guardar objetivos </button>
  </div>
</template>

<style scoped>
/* #region ***********  Contenedores  **************/
.objectives-container {
  width: 70vh;
  max-width: 400px;
  margin: 0 auto;
}

.objective-group {
  margin: 1rem;
  display: flex;
  flex-direction: column;
}
/* #endregion **************************************/

/* #region ************  Formulario  ***************/
.save-btn-right {
  display: block;
  margin-left: auto;
  margin-top: 1rem;
}

.number-input-right{
  text-align: right;
}
/* #endregion **************************************/
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useNotification } from 'naive-ui'

//#region *****************************************   Variables   *****************************************
const notification = useNotification()

const objectives = ref({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0
})
//#endregion **********************************************************************************************

//#region *******************************************   Hooks   *******************************************
onMounted(loadObjectives)
//#endregion **********************************************************************************************

//#region *****************************************   Objetivos   *****************************************
async function loadObjectives() {
  const userId = getAuth().currentUser?.uid
  if (!userId) return

  const docRef = doc(db, 'users', userId, 'objectives', 'daily')
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    objectives.value = {
      calories: docSnap.data().calories ?? 0,
      protein: docSnap.data().protein ?? 0,
      carbs: docSnap.data().carbs ?? 0,
      fat: docSnap.data().fat ?? 0
    }
  }
}

async function saveObjectives() {
  const userId = getAuth().currentUser?.uid
  if (!userId) return

  try {
    await setDoc(doc(db,'users',userId,'objectives','daily'), objectives.value)
    notification.success({title:'Guardado', description:'¡Objetivos guardados!', duration:3000})
  } catch (err) {
    notification.error({title:'Error', description:'No se pudieron guardar los objetivos.', duration:3000})
    console.error(err)
  }
}
//#endregion **********************************************************************************************
</script>

