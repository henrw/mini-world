import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, deleteDoc, setDoc, getDocs, collection, addDoc } from 'firebase/firestore';
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCvKAbxzKERsbI9N1QIROSTUL4wvG-M0Lk",
  authDomain: "pax-scrollbar.firebaseapp.com",
  projectId: "pax-scrollbar",
  storageBucket: "pax-scrollbar.appspot.com",
  messagingSenderId: "210985837664",
  appId: "1:210985837664:web:e1a9461c7aa4ccf5fc8f05",
  measurementId: "G-SDLCPFQ8GR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addData() {
  const userDocRef = doc(db, "users", "test"); // Get a reference to the document
  try {
    await updateDoc(userDocRef, {
      position: { x: 0, y: 0 } // Update the 'position' field
    });
    console.log("Document updated");
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}

let currPageDocID = null;
let prevPageDocID = null;
let userDocID = null;
let currentTab = null;


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "CURSOR_POSITION") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      currentTab = tabs[0];
      const url = new URL(currentTab.url);
      currPageDocID = url.hostname + url.pathname;
      currPageDocID = url.hostname.replace(/\./g, '_') + url.pathname.replace(/\//g, '_');
    });

    // Push data
    if (userDocID === null) {
      const docRef = await addDoc(collection(db, currPageDocID), {
        position: message.position,
        avatarIdx: avatarIdx,
      });

      userDocID = docRef.id;
    }
    else {
      // Delete record if user switch to another doc
      if (currPageDocID !== prevPageDocID && prevPageDocID !== null) {
        // await deleteDoc(doc(db, prevPageDocID, userDocID));
        await setDoc(doc(db, currPageDocID, userDocID), {
          position: message.position
        });
      }
      else {
        await updateDoc(doc(db, currPageDocID, userDocID), {
          position: message.position
        });
      }

      prevPageDocID = currPageDocID;
    }

    // Pull data
    const pageCollectionRef = collection(db, currPageDocID);

    try {
      // Fetch the documents
      const querySnapshot = await getDocs(pageCollectionRef);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        avatarIdx: doc.data().avatarIdx ?? 0,
        position: doc.data().position,
      }));
      chrome.tabs.sendMessage(currentTab.id, { data: data });

    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  }
});

let avatarIdx = 0;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CHANGE_AVATAR") {
    // Assuming you have some way to store or handle the theme in background
    avatarIdx = message.avatarIdx;  // Implement this function to handle theme change
    console.log(`Avatar changed to: ${avatarIdx}`);
  }
});

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');

const openaiApiKey = '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';

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(`Storage key "${key}" in namespace "${namespace}" changed.`);
    console.log(`Old value was "${oldValue}", new value is "${newValue}".`);
  }
});

let isOn = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchChatGPTResponse') {
    (async () => {
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful teaching assistant who tend to make wikipedia learning experience better.',
        },
        { role: 'user', content: request.question },
      ];
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiApiKey}`, // Ensure secure handling of your API key
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: messages,
          }),
        });

        const data = await response.json();
        console.log(data);
        sendResponse({ success: true, response: data.choices[0].message.content }); // Adjust based on actual response structure
      } catch (error) {
        console.error('Error fetching from OpenAI:', error);
        sendResponse({ success: false, error: error.toString() });
      }
    })();
    return true; // Indicates you wish to send a response asynchronously.
  }
});
