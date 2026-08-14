# Firebase Integration Setup - Complete Guide

This project includes a complete Firebase integration with authentication, Firestore database, and Cloud Storage services.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- Google Cloud account with Firebase project
- Git for version control

---

## 🔧 Firebase Project Setup

### 1. Create Firebase Project

```bash
# Option 1: Via Firebase Console
# Go to https://console.firebase.google.com/ → Add Project

# Option 2: Via Firebase CLI
firebase login
firebase projects:create mischtisch-sachsen --display-name "Mischtisch Sachsen"
```

### 2. Enable Required Services

In Firebase Console (https://console.firebase.google.com/):

| Service | Configuration |
|---------|---------------|
| **Authentication** | Enable Email/Password provider |
| **Firestore Database** | Create database in production mode |
| **Cloud Storage** | Set up default bucket |
| **Hosting** | Optional, for deployment |

### 3. Get Firebase Config

Project Settings → General → Your Apps → Web App → Config

---

## 📁 Project Configuration

### Environment Variables

Create `.env` in frontend directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# EmailJS (optional)
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

---

## 🔥 Firestore Security Rules

**File:** `firestore.rules` (copy to Firebase Console → Firestore → Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    function signedIn() {
      return request.auth != null;
    }

    function isPasswordUser() {
      return signedIn()
        && request.auth.token.firebase.sign_in_provider == 'password';
    }

    function isAdmin() {
      return signedIn() && request.auth.token.admin == true;
    }

    function isVenueHost(venueId) {
      return isPasswordUser()
        && exists(/databases/$(database)/documents/venues/$(venueId))
        && get(/databases/$(database)/documents/venues/$(venueId)).data.hostUid == request.auth.uid;
    }

    // ============================================
    // VENUES COLLECTION
    // ============================================
    match /venues/{venueId} {
      // Public read access for all venues
      allow read: if true;
      
      // Only authenticated password users can create, must be the host
      allow create: if isPasswordUser()
        && request.resource.data.hostUid == request.auth.uid;
      
      // Admin or venue host can update (hostUid cannot change)
      allow update: if isAdmin()
        || (isVenueHost(venueId)
          && request.resource.data.hostUid == resource.data.hostUid);
      
      // Admin or venue host can delete
      allow delete: if isAdmin() || isVenueHost(venueId);
    }

    // ============================================
    // HOST PROFILES
    // ============================================
    match /hostProfiles/{uid} {
      // User can read own profile, admin can read all
      allow get: if (isPasswordUser() && request.auth.uid == uid) || isAdmin();
      
      // User can manage own profile
      allow create, update, delete: if isPasswordUser()
        && request.auth.uid == uid;
      
      // Admin can list all profiles
      allow list: if isAdmin();
    }

    // ============================================
    // GUEST PROFILES
    // ============================================
    match /guests/{uid} {
      // Full CRUD for own profile only
      allow read, create, update, delete: if signedIn()
        && request.auth.uid == uid;
    }

    // ============================================
    // RESERVATIONS
    // ============================================
    match /reservations/{reservationId} {
      // Create: authenticated user, must be guest, locId required
      allow create: if signedIn()
        && request.resource.data.guestUid == request.auth.uid
        && request.resource.data.locId is string;
      
      // Read/Delete: guest owner, venue host, or admin
      allow read, delete: if signedIn()
        && (
          resource.data.guestUid == request.auth.uid
          || isVenueHost(resource.data.locId)
          || isAdmin()
        );
      
      // Update: guest can update own (guestUid & locId immutable),
      // host can update guestUid/locId, admin full access
      allow update: if signedIn()
        && (
          (resource.data.guestUid == request.auth.uid
            && request.resource.data.guestUid == request.auth.uid
            && request.resource.data.locId == resource.data.locId)
          || (isVenueHost(resource.data.locId)
            && request.resource.data.guestUid == resource.data.guestUid
            && request.resource.data.locId == resource.data.locId)
          || isAdmin()
        );
    }

    // ============================================
    // OCCUPANCY (Real-time seat availability)
    // ============================================
    match /occupancy/{occupancyId} {
      allow read: if true;
      allow create, update, delete: if signedIn();
    }

    // ============================================
    // NOTIFICATIONS
    // ============================================
    match /notifications/{notificationId} {
      // Create: authenticated user, must be creator, venueId required
      allow create: if signedIn()
        && request.resource.data.createdByUid == request.auth.uid
        && request.resource.data.venueId is string;
      
      // Read/Update/Delete: creator, venue host, or admin
      allow read, update, delete: if signedIn()
        && (
          resource.data.createdByUid == request.auth.uid
          || isVenueHost(resource.data.venueId)
          || isAdmin()
        );
    }

    // ============================================
    // VENUE PHOTOS
    // ============================================
    match /venuePhotos/{venueId} {
      allow read: if true;
      allow create, update, delete: if isVenueHost(venueId) || isAdmin();
    }

    // ============================================
    // REGISTRATIONS (Venue onboarding)
    // ============================================
    match /registrations/{registrationId} {
      // Create: password user, must be creator/host, betriebId required
      allow create: if isPasswordUser()
        && request.resource.data.createdByUid == request.auth.uid
        && request.resource.data.hostUid == request.auth.uid
        && request.resource.data.betriebId is string;
      
      // Get: creator or admin
      allow get: if (isPasswordUser()
        && resource.data.createdByUid == request.auth.uid) || isAdmin();
      
      // List/Update/Delete: admin only
      allow list, update, delete: if isAdmin();
    }

    // ============================================
    // TABLE SHAPE SUBMISSIONS
    // ============================================
    match /tableShapeSubmissions/{submissionId} {
      // Create: authenticated user, must be creator
      allow create: if signedIn()
        && request.resource.data.createdByUid == request.auth.uid;
      
      // Get: creator or admin
      allow get: if signedIn()
        && (resource.data.createdByUid == request.auth.uid || isAdmin());
      
      // List/Update/Delete: admin only
      allow list, update, delete: if isAdmin();
    }

    // ============================================
    // SETTINGS - Registration Counter
    // ============================================
    match /settings/regCounter {
      allow read: if isPasswordUser();
      
      // Create: only allow value = 1
      allow create: if isPasswordUser()
        && request.resource.data.value == 1;
      
      // Update: only increment by 1
      allow update: if isPasswordUser()
        && request.resource.data.value == resource.data.value + 1;
      
      allow delete: if isAdmin();
    }

    // ============================================
    // SETTINGS - General (Public read, admin write)
    // ============================================
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // ============================================
    // EMAIL TEMPLATES (Admin only write)
    // ============================================
    match /emailTemplates/{templateId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### Rule Deployment Commands

```bash
# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Deploy with project specified
firebase deploy --only firestore:rules --project mischtisch-sachsen

# Verify rules syntax locally (optional)
firebase firestore:rules:get --project mischtisch-sachsen
```

---

## 📦 Cloud Storage Security Rules

**File:** `storage.rules` (copy to Firebase Console → Storage → Rules)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    function isPasswordUser() {
      return request.auth != null
        && request.auth.token.firebase.sign_in_provider == 'password';
    }

    // ============================================
    // VENUE IMAGES
    // Path: /venues/{venueId}/*
    // ============================================
    match /venues/{venueId}/{allPaths=**} {
      // Public read access
      allow read: if true;
      
      // Write: admin or venue host (verified via Firestore)
      allow write: if isAdmin()
        || (isPasswordUser()
          && firestore.exists(/databases/(default)/documents/venues/$(venueId))
          && firestore.get(/databases/(default)/documents/venues/$(venueId)).data.hostUid == request.auth.uid);
    }

    // ============================================
    // OPTIONAL: User Avatars
    // Path: /avatars/{userId}/*
    // ============================================
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // ============================================
    // OPTIONAL: Host Documents
    // Path: /hostDocuments/{userId}/*
    // ============================================
    match /hostDocuments/{userId}/{allPaths=**} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rule Deployment

```bash
# Deploy Storage rules only
firebase deploy --only storage

# Deploy with project specified
firebase deploy --only storage --project mischtisch-sachsen
```

---

## 🚀 Deployment Commands

### Initial Setup

```bash
# 1. Login to Firebase
firebase login

# 2. Initialize Firebase in project (if not done)
firebase init

# Select: Firestore, Storage, Hosting (optional)
# Use existing project: mischtisch-sachsen
```

### Deploy All Services

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore:rules,storage,hosting

# Deploy with project flag
firebase deploy --project mischtisch-sachsen
```

### Build & Deploy Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or deploy everything
firebase deploy
```

### Preview Before Deploy

```bash
# Local preview of hosting
firebase serve --only hosting

# Or use Vite preview
cd frontend && npm run preview
```

---

## ✅ Verification Steps

### 1. Verify Firestore Rules

```bash
# Check deployed rules
firebase firestore:rules:get --project mischtisch-sachsen

# Test rules with Firebase Rules Playground (Console)
# Go to: Console → Firestore → Rules → Playground
```

**Test Cases to Verify:**
| Test | Expected |
|------|----------|
| Anonymous read venues | ✅ Allow |
| Anonymous create venue | ❌ Deny |
| Authenticated user create venue (hostUid=uid) | ✅ Allow |
| Authenticated user create venue (hostUid≠uid) | ❌ Deny |
| Venue host update own venue | ✅ Allow |
| Venue host update other venue | ❌ Deny |
| Admin update any venue | ✅ Allow |
| Guest create reservation | ✅ Allow |
| Guest read own reservation | ✅ Allow |
| Host read venue reservations | ✅ Allow |
| Guest delete own reservation | ✅ Allow |
| Unauthorized delete reservation | ❌ Deny |

### 2. Verify Storage Rules

```bash
# Check deployed rules
firebase storage:rules:get --project mischtisch-sachsen
```

**Test Cases:**
| Test | Expected |
|------|----------|
| Public read venue images | ✅ Allow |
| Anonymous upload | ❌ Deny |
| Venue host upload to own venue | ✅ Allow |
| Venue host upload to other venue | ❌ Deny |
| Admin upload anywhere | ✅ Allow |

### 3. Verify Frontend Integration

```bash
# Start development server
cd frontend && npm run dev

# Check browser console for:
# - "Firebase configured with service: ..."
# - No CORS errors
# - Auth state persistence works
```

### 4. Test Authentication Flow

```bash
# In browser dev tools:
# 1. Register new user
# 2. Verify email/password auth works
# 3. Check user document created in /guests/{uid}
# 4. Login/logout flow
# 5. Auth state persists on refresh
```

### 5. Test Database Operations

```bash
# In browser console (with auth):
# Create venue
await addDocument('venues', { name: 'Test', hostUid: auth.currentUser.uid })

# Read venues
const { data } = await getDocuments('venues')

# Create reservation
await addDocument('reservations', { guestUid: auth.currentUser.uid, locId: 'venue1' })

# Real-time listener
subscribeToCollection('venues', (venues) => console.log(venues))
```

### 6. Test Storage Operations

```bash
# In browser console (with auth):
# Upload venue image
const file = document.querySelector('input[type=file]').files[0]
const ref = storage.ref(`venues/${venueId}/photo.jpg`)
await ref.put(file)

# Get download URL
const url = await ref.getDownloadURL()
```

---

## 🔐 Admin Setup

### Grant Admin Access

```bash
# Option 1: Custom Claims via Admin SDK (Node.js)
const admin = require('firebase-admin');
admin.initializeApp();

async function setAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`Admin claims set for ${uid}`);
}

setAdmin('USER_UID_HERE');
```

```bash
# Option 2: Firebase Console
# Authentication → Users → Select User → Custom Claims → Add: {"admin": true}
```

### Verify Admin Claims

```bash
# In browser console (after login):
const token = await auth.currentUser.getIdTokenResult()
console.log(token.claims.admin) // Should be true for admins
```

---

## 📊 Firestore Indexes

**Required composite indexes** (auto-created or via Console):

```json
{
  "indexes": [
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "locId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reservations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "guestUid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "venueId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "venuePhotos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "venueId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **CORS errors on Storage** | Configure CORS: `gsutil cors set cors.json gs://your-bucket` |
| **Rules permission denied** | Check rules syntax, user auth state, document paths |
| **Index missing error** | Create index via link in error message or `firebase deploy --only firestore:indexes` |
| **Auth not persisting** | Check `auth.setPersistence()` in auth.js, ensure cookies enabled |
| **CORS on Firestore** | Not needed for Firestore, only Storage |

### Debug Commands

```bash
# View Firebase project config
firebase projects:list

# View current project
firebase use

# Switch project
firebase use mischtisch-sachsen

# View deployed functions/rules
firebase deploy --dry-run

# Check CLI version
firebase --version

# Update CLI
npm install -g firebase-tools@latest
```

---

## 📝 Quick Reference Card

### Essential Files
| File | Purpose | Location |
|------|---------|----------|
| `firestore.rules` | Database security | `firestore.rules` / Console |
| `storage.rules` | File storage security | `storage.rules` / Console |
| `firestore.indexes.json` | Query indexes | `firestore.indexes.json` / Console |
| `.env` | Frontend config | `frontend/.env` |
| `firebase.json` | Firebase CLI config | Project root |

### Key Commands
```bash
# Full deploy
firebase deploy

# Rules only
firebase deploy --only firestore:rules,storage

# Hosting only
firebase deploy --only hosting

# View logs
firebase hosting:channel:deploy preview

# Emulator suite (local dev)
firebase emulators:start
```

---



