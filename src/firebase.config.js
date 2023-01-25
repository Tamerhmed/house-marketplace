
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtuk0GKdFlJYqWsG8Gb1XXTpNMYB08OiE",
  authDomain: "house-marketplace-app-a1015.firebaseapp.com",
  projectId: "house-marketplace-app-a1015",
  storageBucket: "house-marketplace-app-a1015.appspot.com",
  messagingSenderId: "444877300807",
  appId: "1:444877300807:web:b48ee08ca917f967e9bd62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();