import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBgyzpEhlPlxPgky7AO5rHwiwTxdhenqAc',
  authDomain: 'jardim-de-desejos-michele.firebaseapp.com',
  projectId: 'jardim-de-desejos-michele',
  storageBucket: 'jardim-de-desejos-michele.firebasestorage.app',
  messagingSenderId: '401496097800',
  appId: '1:401496097800:web:82f2963bafab39e0c3bdbd'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
