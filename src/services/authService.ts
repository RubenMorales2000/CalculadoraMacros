import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const provider = new GoogleAuthProvider();

/* Detecta si el navegador es Safari */
const isSafari = (): boolean => {
  const ua = navigator.userAgent;
  return (/Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua) && !/Android/.test(ua));
};

/* Detecta si el navegador está en modo privado */
const isPrivateMode = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const db = indexedDB.open('test');
    db.onerror = () => resolve(true);
    db.onsuccess = () => {
      db.result.close();
      indexedDB.deleteDatabase('test');
      resolve(false);
    };
  });
};

/* Inicia sesión con Google usando redirect */
export const loginWithGoogle = async (): Promise<void> => {
  if (isSafari()) {
    const privateMode = await isPrivateMode();
    if (privateMode) {
      alert('Estás usando Safari en modo privado. Para iniciar sesión, usa Safari en modo normal o cambia a otro navegador como Chrome');
      throw new Error('Modo privado detectado en Safari.');
    }
  }

  // Redirige al usuario a Google
  await signInWithRedirect(auth, provider);
};

/* Debe llamarse al cargar la app para manejar el resultado del redirect */
export const handleRedirectResult = async (): Promise<User | null> => {
  const result = await getRedirectResult(auth);
  const user = result?.user ?? null;

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
