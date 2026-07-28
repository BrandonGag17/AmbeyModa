import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDm19-GHArO6skcg6uabiDuJBod6xHWBIk",
    authDomain: "ambey-moda.firebaseapp.com",
    projectId: "ambey-moda",
    storageBucket: "ambey-moda.firebasestorage.app",
    messagingSenderId: "1054443367391",
    appId: "1:1054443367391:web:336dbab1962079f4a6b26a",
    measurementId: "G-QGDDC75DE4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };