// Trusted contacts are stored per-user in Firestore at:
//   users/{userId}/contacts/{contactId}

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

function contactsRef() {
  const uid = auth.currentUser.uid;
  return collection(db, 'users', uid, 'contacts');
}

export async function addContact(name, phone) {
  return addDoc(contactsRef(), {
    name: name.trim(),
    phone: phone.trim(),
    createdAt: Date.now(),
  });
}

export async function deleteContact(contactId) {
  const uid = auth.currentUser.uid;
  return deleteDoc(doc(db, 'users', uid, 'contacts', contactId));
}

// One-time fetch. Used right before sending an SOS.
export async function getContacts() {
  const snap = await getDocs(contactsRef());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Live updates. The contacts screen uses this so the list refreshes by itself.
// Returns an "unsubscribe" function — call it when the screen closes.
export function watchContacts(callback) {
  const q = query(contactsRef(), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
