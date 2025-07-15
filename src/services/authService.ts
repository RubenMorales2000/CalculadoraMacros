import { auth, db } from '../firebase';
import {GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged,type User} from 'firebase/auth';
import {doc,setDoc,getDoc,serverTimestamp} from 'firebase/firestore';

const provider = new GoogleAuthProvider();

/* Inicia sesión con Google y crea el documento de usuario si no existe */
export const loginWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  if (user) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        createdAt: serverTimestamp(),
      });
    }
  }

  return user;
};

/* Cierra la sesión del usuario */
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

/* Escucha el estado de autenticación del usuario */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};
