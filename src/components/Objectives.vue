<template>
  <div class="objectives-container">
    <div class="objective-group">
      <label for="calories">Calorías:</label>
      <input type="number" id="calories" v-model.number="objectives.calories" />
    </div>

    <div class="objective-group">
      <label for="protein">Proteínas (g):</label>
      <input type="number" id="protein" v-model.number="objectives.protein" />
    </div>

    <div class="objective-group">
      <label for="carbs">Carbohidratos (g):</label>
      <input type="number" id="carbs" v-model.number="objectives.carbs" />
    </div>

    <div class="objective-group">
      <label for="fat">Grasas (g):</label>
      <input type="number" id="fat" v-model.number="objectives.fat" />
    </div>

    <button @click="saveObjectives" class="save-btn"><i class="fa-solid fa-floppy-disk"></i> Guardar objetivos </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useNotification } from 'naive-ui'

const notification = useNotification()

const objectives = ref({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0
})

onMounted(loadObjectives)

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

</script>

<style scoped>
.objectives-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.objective-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 4px;
}

input {
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

</style>
