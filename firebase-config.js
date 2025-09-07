// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDrM6tf4oM9H7ripw0yqrsRPBYjhIfQpUI",
    authDomain: "la-moda-crista.firebaseapp.com",
    projectId: "la-moda-crista",
    storageBucket: "la-moda-crista.firebasestorage.app",
    messagingSenderId: "793861335070",
    appId: "1:793861335070:web:7bddd5c0bb4371b2cea60f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportar para uso em outros arquivos
window.firebase = {
    db,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
};

console.log('Firebase inicializado com sucesso!');
