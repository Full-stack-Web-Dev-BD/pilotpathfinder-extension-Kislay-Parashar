// This assumes you have set up firebase-config.js to export an initialized 'auth' object
import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from './lib/firebase-auth.js';
import { getDocs } from './lib/firebase-firestore.js';
import { collection } from './lib/firebase-firestore.js';


document.getElementById('login').addEventListener('click', function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('autofill').style.display = 'block';
            document.getElementById('sign-out').style.display = 'block';
        })
        .catch((error) => {
            document.getElementById('error-message').textContent = error.message;
        });
});

function getUserData(uid) {
    getDocs(collection(db, `users/${uid}/inputs`)).then((inputDocs) => {
        console.log("input docs", inputDocs)
        const data = inputDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("sent data", data)
        sendAutofillData(data);
    }).catch((error) => {
        console.error("Error getting user data:", error);
    });
}

function sendAutofillData(data) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['autofill.js']
        }, () => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "autofill", data: data });
        });
    });
}
document.getElementById('sign-out').addEventListener('click', function() {
    signOut(auth).then(() => {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('autofill').style.display = 'none';
        document.getElementById('sign-out').style.display = 'none';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
});
document.getElementById('autofill').addEventListener('click', function() {
    const user = auth.currentUser;
    console.log("cred user", user)
    if (user) {
        getUserData(user.uid);  // Fetch and autofill data only when button is clicked
    } else {
        console.log('User not logged in or session expired');
    }
});

