import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Fail clearly if required configuration is missing
const required = ["apiKey", "authDomain", "projectId", "appId"];
for (const key of required) {
  if (!firebaseConfig[key]) {
    throw new Error(
      `Missing Firebase config: ${key}. Check VITE_FIREBASE_* environment variables in .env.local`
    );
  }
}

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);
