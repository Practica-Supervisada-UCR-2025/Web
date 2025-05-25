import { initializeApp, getApps} from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export function getSecondaryAuth(): { auth: ReturnType<typeof getAuth>, app: FirebaseApp } {
  const SECONDARY_APP_NAME = 'SecondaryApp';
  const secondaryApp = getApps().find(app => app.name === SECONDARY_APP_NAME)
    || initializeApp(firebaseConfig, SECONDARY_APP_NAME);

  const secondaryAuth = getAuth(secondaryApp);
  return { auth: secondaryAuth, app: secondaryApp };
}

export { auth }; 