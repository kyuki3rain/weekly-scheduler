import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  appId: process.env.NEXT_PUBLIC_APPID,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
};

export const app = getApps()?.length
  ? getApps()[0]
  : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
