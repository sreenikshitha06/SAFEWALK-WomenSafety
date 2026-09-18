// Everything to do with logging in / out.
// Screens call these functions so they don't have to know about Firebase.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export async function signUp(name, email, password, phone) {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = result.user;

  // Store the display name on the Firebase account
  await updateProfile(user, { displayName: name });

  // Keep a copy in Firestore so we can show it later
  await setDoc(doc(db, 'users', user.uid), {
    name,
    email: email.trim(),
    phone: phone || '',
    createdAt: new Date().toISOString(),
  });

  return user;
}

export async function logIn(email, password) {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function logOut() {
  await signOut(auth);
}


// Firebase errors look like "auth/invalid-credential".
// This turns them into something a normal person can read.
export function readableError(error) {
  const code = error?.code || '';
  if (code.includes('invalid-email')) return 'That email address does not look right.';
  if (code.includes('email-already-in-use')) return 'An account already uses this email. Try logging in.';
  if (code.includes('weak-password')) return 'Password needs to be at least 6 characters.';
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Email or password is incorrect.';
  if (code.includes('user-not-found')) return 'No account found for this email.';
  if (code.includes('network')) return 'No internet connection. Check your network and try again.';
  return 'Something went wrong. Please try again.';
}