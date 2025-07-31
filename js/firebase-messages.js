// Firebase Messages Handler
class FirebaseMessagesHandler {
    constructor() {
        this.db = null;
        this.auth = null;
        this.isFirebaseReady = false;
        this.initializationPromise = this.init();
    }
    
    async init() {
        try {
            // Wait for Firebase to be available
            if (typeof window.initializeFirebase !== 'function') {
                console.log('Firebase initialization function not available yet, waiting...');
                await new Promise(resolve => {
                    const checkFirebase = () => {
                        if (typeof window.initializeFirebase === 'function') {
                            resolve();
                        } else {
                            setTimeout(checkFirebase, 100);
                        }
                    };
                    checkFirebase();
                });
            }
            
            // Initialize Firebase
            const firebase = await window.initializeFirebase();
            if (firebase && firebase.db) {
                this.db = firebase.db;
                this.auth = firebase.auth;
                this.isFirebaseReady = true;
                console.log('Firebase Messages Handler ready with auth');
            } else {
                console.log('Firebase not available, using localStorage fallback');
            }
        } catch (error) {
            console.error('Error initializing Firebase Messages Handler:', error);
        }
    }
    
    async waitForInit() {
        await this.initializationPromise;
    }
    
    async saveMessage(messageData) {
        await this.waitForInit();
        
        if (this.isFirebaseReady && this.db) {
            return await this.saveToFirebase(messageData);
        } else {
            console.error('Firebase not ready');
            return { success: false, error: 'Firebase not ready' };
        }
    }
    
    async saveToFirebase(messageData) {
        try {
            const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
            
            // Add server timestamp
            const docData = {
                ...messageData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            const docRef = await addDoc(collection(this.db, 'contactMessages'), docData);
            console.log('Message saved to Firebase with ID:', docRef.id);
            
            return {
                success: true,
                id: docRef.id
            };
        } catch (error) {
            console.error('Error saving to Firebase:', error);
            return { success: false, error: error.message };
        }
    }
    
    saveToLocalStorage(messageData) {
        try {
            let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            messages.unshift(messageData);
            
            if (messages.length > 100) {
                messages = messages.slice(0, 100);
            }
            
            localStorage.setItem('contactMessages', JSON.stringify(messages));
            
            const unreadCount = messages.filter(msg => msg.status === 'unread').length;
            localStorage.setItem('unreadMessageCount', unreadCount.toString());
            
            console.log('Message saved to localStorage');
            return {
                success: true,
                id: messageData.id
            };
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async getMessages() {
        await this.waitForInit();
        
        if (this.isFirebaseReady && this.db) {
            return await this.getFromFirebase();
        } else {
            console.error('Firebase not ready');
            return [];
        }
    }
    
    async getFromFirebase() {
        try {
            const { collection, getDocs, query, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
            
            // Check if user is authenticated
            if (!this.auth || !this.auth.currentUser) {
                console.log('User not authenticated, cannot access Firebase');
                return [];
            }
            
            console.log('Loading messages for authenticated user:', this.auth.currentUser.email);
            
            const q = query(
                collection(this.db, 'contactMessages'), 
                orderBy('createdAt', 'desc'),
                limit(100)
            );
            
            const querySnapshot = await getDocs(q);
            const messages = [];
            
            querySnapshot.forEach((doc) => {
                messages.push({
                    firebaseId: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('Messages loaded from Firebase:', messages.length);
            return messages;
        } catch (error) {
            console.error('Error loading from Firebase:', error);
            if (error.code === 'permission-denied') {
                console.error('Permission denied - user may not be authenticated or authorized');
            }
            return [];
        }
    }
    
    getFromLocalStorage() {
        try {
            const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            console.log('Messages loaded from localStorage:', messages.length);
            return messages;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return [];
        }
    }
    
    async updateMessageStatus(messageId, status) {
        if (this.isFirebaseReady && this.db) {
            return await this.updateInFirebase(messageId, status);
        } else {
            console.error('Firebase not ready');
            return { success: false, error: 'Firebase not ready' };
        }
    }
    
    async updateInFirebase(messageId, status) {
        try {
            const { doc, updateDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
            
            const messageRef = doc(this.db, 'contactMessages', messageId);
            await updateDoc(messageRef, {
                status: status,
                updatedAt: serverTimestamp()
            });
            
            console.log('Message status updated in Firebase');
            return { success: true };
        } catch (error) {
            console.error('Error updating in Firebase:', error);
            return { success: false, error: error.message };
        }
    }
    
    updateInLocalStorage(messageId, status) {
        try {
            let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            const messageIndex = messages.findIndex(msg => msg.id === messageId);
            
            if (messageIndex !== -1) {
                messages[messageIndex].status = status;
                localStorage.setItem('contactMessages', JSON.stringify(messages));
                
                const unreadCount = messages.filter(msg => msg.status === 'unread').length;
                localStorage.setItem('unreadMessageCount', unreadCount.toString());
                
                console.log('Message status updated in localStorage');
                return { success: true };
            }
            
            return { success: false, error: 'Message not found' };
        } catch (error) {
            console.error('Error updating in localStorage:', error);
            return { success: false, error: error.message };
        }
    }
    
    async deleteMessage(messageId) {
        if (this.isFirebaseReady && this.db) {
            return await this.deleteFromFirebase(messageId);
        } else {
            console.error('Firebase not ready');
            return { success: false, error: 'Firebase not ready' };
        }
    }
    
    async deleteFromFirebase(messageId) {
        try {
            const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
            
            const messageRef = doc(this.db, 'contactMessages', messageId);
            await deleteDoc(messageRef);
            
            console.log('Message deleted from Firebase');
            return { success: true };
        } catch (error) {
            console.error('Error deleting from Firebase:', error);
            return { success: false, error: error.message };
        }
    }
    
    deleteFromLocalStorage(messageId) {
        try {
            let messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            const filteredMessages = messages.filter(msg => msg.id !== messageId);
            
            localStorage.setItem('contactMessages', JSON.stringify(filteredMessages));
            
            const unreadCount = filteredMessages.filter(msg => msg.status === 'unread').length;
            localStorage.setItem('unreadMessageCount', unreadCount.toString());
            
            console.log('Message deleted from localStorage');
            return { success: true };
        } catch (error) {
            console.error('Error deleting from localStorage:', error);
            return { success: false, error: error.message };
        }
    }
    
    async setupRealTimeListener(callback) {
        if (this.isFirebaseReady && this.db) {
            try {
                const { collection, onSnapshot, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
                
                const q = query(
                    collection(this.db, 'contactMessages'),
                    orderBy('timestamp', 'desc')
                );
                
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const messages = [];
                    querySnapshot.forEach((doc) => {
                        messages.push({
                            firebaseId: doc.id,
                            ...doc.data()
                        });
                    });
                    
                    console.log('Real-time update received:', messages.length, 'messages');
                    callback(messages);
                });
                
                return unsubscribe;
            } catch (error) {
                console.error('Error setting up real-time listener:', error);
                return null;
            }
        }
        return null;
    }
}

// Create global instance
window.firebaseMessages = new FirebaseMessagesHandler();