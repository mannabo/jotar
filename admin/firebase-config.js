// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, updatePassword, sendPasswordResetEmail, reauthenticateWithCredential, EmailAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, setDoc, getDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBBLLZKhaCnn9ETyqfo8L-sWU8noaiy1Q4",
    authDomain: "jotar-admin.firebaseapp.com",
    projectId: "jotar-admin",
    storageBucket: "jotar-admin.firebasestorage.app",
    messagingSenderId: "740997360642",
    appId: "1:740997360642:web:86413c7a9cd79dee320b1b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Auth functions
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const checkAuthState = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Database functions
export const addActivity = async (activityData) => {
    try {
        const docRef = await addDoc(collection(db, "activities"), {
            ...activityData,
            timestamp: new Date(),
            createdBy: auth.currentUser?.email || 'admin'
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getActivities = async () => {
    try {
        const q = query(collection(db, "activities"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const activities = [];
        querySnapshot.forEach((doc) => {
            activities.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: activities };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const addMessage = async (messageData) => {
    try {
        const docRef = await addDoc(collection(db, "messages"), {
            ...messageData,
            timestamp: new Date(),
            status: 'unread'
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getMessages = async () => {
    try {
        const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const messages = [];
        querySnapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: messages };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Admin & User Management Functions
export const saveUserProfile = async (userData) => {
    try {
        const userRef = doc(db, 'admin_users', auth.currentUser.uid);
        await setDoc(userRef, {
            ...userData,
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            lastUpdated: new Date(),
            role: 'admin'
        }, { merge: true });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getUserProfile = async (uid = null) => {
    try {
        const userId = uid || auth.currentUser?.uid;
        if (!userId) throw new Error('No user ID provided');
        
        const userRef = doc(db, 'admin_users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            return { success: true, data: userSnap.data() };
        } else {
            return { success: false, error: 'User profile not found' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllAdminUsers = async () => {
    try {
        const q = query(collection(db, 'admin_users'), orderBy('lastUpdated', 'desc'));
        const querySnapshot = await getDocs(q);
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: users };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateUserStatus = async (userId, status) => {
    try {
        const userRef = doc(db, 'admin_users', userId);
        await updateDoc(userRef, {
            status: status,
            lastUpdated: new Date()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteAdminUser = async (userId) => {
    try {
        await deleteDoc(doc(db, 'admin_users', userId));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getSystemSettings = async () => {
    try {
        const settingsRef = doc(db, 'system_settings', 'general');
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
            return { success: true, data: settingsSnap.data() };
        } else {
            // Return default settings if none exist
            return { 
                success: true, 
                data: { 
                    allowRegistration: true,
                    maxAdmins: 10,
                    organizationName: 'JOHOR TANGKAK AGROPRENEUR ROOTS ORGANIZATION'
                } 
            };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateSystemSettings = async (settings) => {
    try {
        const settingsRef = doc(db, 'system_settings', 'general');
        await setDoc(settingsRef, {
            ...settings,
            lastUpdated: new Date()
        }, { merge: true });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Auto-save user profile when they first login
export const initializeUserProfile = async (user) => {
    try {
        const userRef = doc(db, 'admin_users', user.uid);
        const userSnap = await getDoc(userRef);
        
        // Extract additional Google profile data
        const googleProfile = user.providerData.find(p => p.providerId === 'google.com');
        
        if (!userSnap.exists()) {
            // Create new profile for first-time user with Google data
            const profileData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || null,
                role: 'admin',
                status: 'active',
                createdAt: new Date(),
                lastUpdated: new Date(),
                lastLogin: new Date(),
                loginMethod: googleProfile?.providerId || 'email',
                // Additional Google data
                googleProfile: googleProfile ? {
                    displayName: googleProfile.displayName,
                    email: googleProfile.email,
                    photoURL: googleProfile.photoURL,
                    phoneNumber: googleProfile.phoneNumber || null
                } : null,
                // Auto-extracted data from Google
                firstName: user.displayName ? user.displayName.split(' ')[0] : '',
                lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
                profileComplete: false // Mark as incomplete to prompt user to fill additional info
            };
            
            await setDoc(userRef, profileData);
        } else {
            // Update existing profile with latest Google data and login time
            const updateData = {
                lastLogin: new Date(),
                lastUpdated: new Date()
            };
            
            // Update Google profile data if available
            if (googleProfile) {
                updateData.googleProfile = {
                    displayName: googleProfile.displayName,
                    email: googleProfile.email,
                    photoURL: googleProfile.photoURL,
                    phoneNumber: googleProfile.phoneNumber || null
                };
                
                // Update main profile fields if they're empty or Google has newer data
                if (!userSnap.data().displayName || userSnap.data().displayName === userSnap.data().email.split('@')[0]) {
                    updateData.displayName = user.displayName;
                }
                
                if (!userSnap.data().photoURL && user.photoURL) {
                    updateData.photoURL = user.photoURL;
                }
            }
            
            await updateDoc(userRef, updateData);
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Compress image before upload
const compressImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.8) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            // Set canvas size
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob with compression
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
};

// Upload profile picture with auto-compression
export const uploadProfilePicture = async (file) => {
    try {
        // First, compress the image
        const compressedFile = await compressImage(file, 300, 300, 0.8);
        
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const base64Data = reader.result;
                    
                    // Check if still too large (Firestore limit is ~800KB for document with other fields)
                    if (base64Data.length > 800000) {
                        // Try with lower quality
                        const smallerFile = await compressImage(file, 250, 250, 0.6);
                        const smallerReader = new FileReader();
                        
                        smallerReader.onloadend = async () => {
                            try {
                                const smallerBase64 = smallerReader.result;
                                
                                if (smallerBase64.length > 800000) {
                                    resolve({ 
                                        success: false, 
                                        error: 'Image is still too large after compression. Please use a smaller image.' 
                                    });
                                    return;
                                }
                                
                                const userRef = doc(db, 'admin_users', auth.currentUser.uid);
                                await updateDoc(userRef, {
                                    photoURL: smallerBase64,
                                    customPhotoURL: smallerBase64,
                                    lastUpdated: new Date()
                                });
                                resolve({ success: true, photoURL: smallerBase64 });
                            } catch (error) {
                                resolve({ success: false, error: error.message });
                            }
                        };
                        
                        smallerReader.readAsDataURL(smallerFile);
                    } else {
                        // Original compression is fine
                        const userRef = doc(db, 'admin_users', auth.currentUser.uid);
                        await updateDoc(userRef, {
                            photoURL: base64Data,
                            customPhotoURL: base64Data,
                            lastUpdated: new Date()
                        });
                        resolve({ success: true, photoURL: base64Data });
                    }
                } catch (error) {
                    resolve({ success: false, error: error.message });
                }
            };
            reader.readAsDataURL(compressedFile);
        });
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Password Management Functions
export const changePassword = async (currentPassword, newPassword) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('No user logged in');
        }

        // Re-authenticate user with current password
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const sendPasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

console.log('Firebase initialized successfully!');