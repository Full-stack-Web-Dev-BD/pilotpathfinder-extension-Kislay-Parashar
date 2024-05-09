// This assumes you have set up firebase-config.js to export an initialized 'auth' object
import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from './lib/firebase-auth.js';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from './lib/firebase-firestore.js';

document.getElementById('login').addEventListener('click', function () {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('autofill').style.display = 'block';
      document.getElementById('createDatabase').style.display = 'block';
      document.getElementById('sign-out').style.display = 'block';
    })
    .catch(error => {
      document.getElementById('error-message').textContent = error.message;
    });
});

function getUserData(uid) {
  getDocs(collection(db, `users/${uid}/inputs`))
    .then(inputDocs => {
      console.log('input docs', inputDocs);
      const data = inputDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('sent data', data);
      sendAutofillData(data);
    })
    .catch(error => {
      console.error('Error getting user data:', error);
    });
}
function sendAutofillData(data) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ['autofill.js'],
      },
      () => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'autofill', data: data });
      }
    );
  });
}
// document.getElementById('sign-out').addEventListener('click', function () {
//   signOut(auth)
//     .then(() => {
//       document.getElementById('login-form').style.display = 'block';
//       document.getElementById('autofill').style.display = 'none';
//       document.getElementById('sign-out').style.display = 'none';
//     })
//     .catch(error => {
//       console.error('Error signing out:', error);
//     });
// });
document.getElementById('autofill').addEventListener('click', function () {
  const user = auth.currentUser;
  console.log('cred user', user);
  if (user) {
    getUserData(user.uid); // Fetch and autofill data only when button is clicked
  } else {
    console.log('User not logged in or session expired');
  }
});
// =====================
document
  .getElementById('createDatabase')
  .addEventListener('click', function () {
    // Get the current tab's URL
    console.log('working ... ');
    getCurrentTabUrl(function (currentTabUrl) {
      // Check if currentTabUrl is valid
      if (currentTabUrl) {
        const userData = {
          field1: 'value1',
          field2: 'value2',
          formURL: currentTabUrl, // Set the formURL property to the current tab's URL
        };

        const user = auth.currentUser;
        if (user) {
          const uid = user.uid;
          storeUserData(uid, userData);
        } else {
          console.log('User not logged in or session expired');
        }
      } else {
        console.error('Error: Unable to retrieve current tab URL.');
      }
    });
  });

function getCurrentTabUrl(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url) {
      const currentTabUrl = currentTab.url;
      callback(currentTabUrl);
    } else {
      callback(null); // Pass null if unable to retrieve the current tab's URL
    }
  });
}
async function storeUserData(uid, inputData) {
  console.log('processing store user data');
  const userInputsRef = collection(db, `users/${uid}/inputs`);

  // Check if formURL is defined in inputData
  if (!inputData.formURL) {
    console.error('formURL is not defined in inputData.');
    return;
  }

  // Normalize formURL by removing trailing slashes and URL parameters
  const normalizedFormURL = inputData.formURL.replace(/\/+$/, '').split('?')[0];

  // Check if a document with the same formURL already exists
  const formURLQuery = query(
    userInputsRef,
    where('formURL', '==', normalizedFormURL)
  );
  const querySnapshot = await getDocs(formURLQuery);

  if (!querySnapshot.empty) {
    const err = 'A document with the same formURL already exists.';
    document.getElementById('error-message').textContent = err;
    console.log(err);
    return; // Exit the function if a document with the same formURL exists
  }

  // Add the new document if no document with the same formURL exists
  addDoc(userInputsRef, inputData)
    .then(docRef => {
      console.log('Document written with ID: ', docRef.id);
      // Optionally, you can perform any additional actions after storing the data
    })
    .catch(error => {
      console.error('Error adding document: ', error);
    });
}
