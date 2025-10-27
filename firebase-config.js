// Firebase Configuration - PPB Cobranza
const firebaseConfig = {
    apiKey: "AIzaSyCqDkYDT2RDNkYOAvUoAd8RMT7AQ37EVWg",
    authDomain: "quake-cobranzas.firebaseapp.com",
    databaseURL: "https://quake-cobranzas-default-rtdb.firebaseio.com",
    projectId: "quake-cobranzas",
    storageBucket: "quake-cobranzas.firebasestorage.app",
    messagingSenderId: "278570669788",
    appId: "1:278570669788:web:50fba7fce26e0489784619"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Make available globally
window.firebaseAuth = auth;
window.firebaseDatabase = database;
console.log('Firebase configurado correctamente para PPB Cobranza');
