# Firebase Setup Instructions for JOTAR Website

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `jotar-website`
4. Continue through setup steps
5. Choose "Default Account for Firebase"
6. Create project

## Step 2: Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for now)
4. Select location closest to Malaysia (asia-southeast1)
5. Click "Done"

## Step 3: Get Firebase Configuration

1. In Firebase Console, go to "Project Settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Web" icon (</>)
4. Register app with nickname: "JOTAR Website"
5. Copy the `firebaseConfig` object

## Step 4: Update Firebase Configuration

Replace the placeholder values in `js/firebase-config.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

## Step 5: Configure Firestore Security Rules

1. In Firebase Console, go to "Firestore Database"
2. Click "Rules" tab
3. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to contactMessages
    match /contactMessages/{document} {
      allow read, write: if true;
    }
  }
}
```

**Note**: These rules allow public access. For production, implement proper authentication.

## Step 6: Test Firebase Integration

1. Deploy your website
2. Fill out the contact form
3. Check Firebase Console > Firestore Database
4. Verify messages appear in `contactMessages` collection
5. Check admin panel to see messages from Firebase

## Features Enabled

✅ **Real-time message sync** across devices
✅ **Persistent storage** (no more localStorage limitations)
✅ **Automatic fallback** to localStorage if Firebase fails
✅ **Server timestamps** for accurate message ordering
✅ **Scalable message storage** (no 100 message limit)

## Fallback Behavior

If Firebase is not configured or fails:
- Contact form automatically falls back to localStorage
- Admin panel reads from localStorage
- No functionality is lost
- Console logs indicate fallback usage

## Security Considerations

For production use, consider:
- Implementing Firebase Authentication
- Adding proper security rules
- Setting up Firebase Functions for server-side validation
- Adding rate limiting for form submissions