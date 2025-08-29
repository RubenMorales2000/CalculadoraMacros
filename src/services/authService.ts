import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const provider = new GoogleAuthProvider();

/** Login a FireBase mediante la cuenta de Google */
export const loginWithGoogle = async (): Promise<User> => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  if (user) {
    await ensureUserDoc(user);
  }

  return user;
};

/** Crea un nuevo usuario con correo y contraseña */
export const registerWithEmail = async (email:string, password:string, name?:string): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  await ensureUserDoc(user, name);
  return user;
};

/** Login a FireBase mediante correo y contraseña */
export const loginWithEmail = async (email:string, password:string): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;

  if (user) {
    await ensureUserDoc(user);
  }
  return user;
};

/** Cierra la sesion de FireBase activa en este dispositivo */
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

/** Devuelve la información del usuario actual, si lo hubiese */
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

/** Crea Doc de un nuevo usuario, si no existe */
const ensureUserDoc = async (user:User, name?:string) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: name || user.displayName || '',
      createdAt: serverTimestamp(),
    });
  }
};
