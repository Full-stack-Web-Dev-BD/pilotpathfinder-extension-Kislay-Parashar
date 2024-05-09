import {initializeApp} from  './lib/firebase-app.js';
import { getAuth } from './lib/firebase-auth.js';
import { getFirestore } from './lib/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyD7n9ky8PTc_ZGPGEvES6s3NdxaCP0fbPQ",
    authDomain: "pathfinder-92d8f.firebaseapp.com",
    projectId: "pathfinder-92d8f",
    storageBucket: "pathfinder-92d8f.appspot.com",
    messagingSenderId: "162748083199",
    appId: "1:162748083199:web:f42db597fd8d9b8e9ad5ca",
    measurementId: "G-MNENDJS307"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Example Firebase usage
const auth = getAuth(app);
const db =  getFirestore(app);
export { auth, db }
export default app
