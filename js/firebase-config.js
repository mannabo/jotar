// Firebase Configuration for JOTAR Website
// Replace these values with your actual Firebase project config

const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "jotar-website.firebaseapp.com",
    projectId: "jotar-website",
    storageBucket: "jotar-website.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
let app, db;

async function initializeFirebase() {
    try {
        // Import Firebase modules
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
        
        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        
        console.log('Firebase initialized successfully');
        return { app, db };
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        // Fallback to localStorage if Firebase fails
        return null;
    }
}

// Export for use in other files
window.initializeFirebase = initializeFirebase;