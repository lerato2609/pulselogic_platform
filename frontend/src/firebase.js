import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBvGZ57XxqgnxDmX4JaLMKxaKc_2Q_eGyY",
  authDomain: "pulselogic-platform.firebaseapp.com",
  databaseURL: "https://pulselogic-platform-default-rtdb.firebaseio.com",
  projectId: "pulselogic-platform",
  storageBucket: "pulselogic-platform.firebasestorage.app",
  messagingSenderId: "764906514139",
  appId: "1:764906514139:web:6b28c5e588ccf44cad4efe",
  measurementId: "G-4YF14SN9K3"
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

export { app, database };