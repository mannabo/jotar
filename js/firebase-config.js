// Firebase Configuration for JOTAR Website
// Replace these values with your actual Firebase project config

const firebaseConfig = {
    apiKey: "AIzaSyBBLLZKhaCnn9ETyqfo8L-sWU8noaiy1Q4",
    authDomain: "jotar-admin.firebaseapp.com",
    projectId: "jotar-admin",
    storageBucket: "jotar-admin.firebasestorage.app",
    messagingSenderId: "740997360642",
    appId: "1:740997360642:web:86413c7a9cd79dee320b1b"
};

// Initialize Firebase
let app, db, auth;

async function initializeFirebase() {
    try {
        // Import Firebase modules
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
        
        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        console.log('Firebase initialized successfully with auth');
        return { app, db, auth };
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        // Fallback to localStorage if Firebase fails
        return null;
    }
}

// Export for use in other files
window.initializeFirebase = initializeFirebase;