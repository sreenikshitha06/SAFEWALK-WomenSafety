// The emergency logic, using the phone's own SMS app.
//
// What happens when the SOS fires:
//   1. Get the current location
//   2. Save an "alert" record in Firestore
//   3. Open the messaging app with all contacts and the message filled in
//   4. Keep updating the alert's location until the user marks themselves safe
//
// Step 3 needs one tap from the user to actually send. That is the trade-off
// for not running a paid SMS service. If you later switch to Twilio, only this
// file changes — nothing else in the app knows how the message goes out.

import * as SMS from 'expo-sms';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { getContacts } from './contacts';
import { getCurrentLocation, watchLocation, mapsLink } from './location';

export async function startSOS() {
  const user = auth.currentUser;

  const contacts = await getContacts();
  if (contacts.length === 0) {
    throw new Error('Add at least one trusted contact before using SOS.');
  }

  // Some devices and all simulators have no SMS app
  const canSend = await SMS.isAvailableAsync();
  if (!canSend) {
    throw new Error('This device cannot send text messages.');
  }

  const location = await getCurrentLocation();
  const link = mapsLink(location.latitude, location.longitude);
  const name = user.displayName || 'A WomenSafety user';

  // Keep a record of the alert, and somewhere to push location updates
  const alertDoc = await addDoc(collection(db, 'alerts'), {
    userId: user.uid,
    userName: name,
    status: 'active',
    startedAt: Date.now(),
    location,
    sentTo: contacts.map((c) => ({ name: c.name, phone: c.phone })),
  });

  // Short and clear. Panic is not the time for paragraphs.
  const message =
    `${name} pressed the SOS button and may need help.\n\n` +
    `Location: ${link}\n\n` +
    `Please call now.`;

  const { result } = await SMS.sendSMSAsync(
    contacts.map((c) => c.phone),
    message
  );

  // Android usually reports "unknown" even on success, so only a clear
  // cancel counts as a failure.
  if (result === 'cancelled') {
    await updateDoc(doc(db, 'alerts', alertDoc.id), { status: 'cancelled' });
    throw new Error('Message was not sent. Tap SOS again to retry.');
  }

  return {
    alertId: alertDoc.id,
    location,
    contacts,
    delivered: contacts.length,
    failed: [],
  };
}

// While the alert is active, push new coordinates into the same record.
export async function followUser(alertId) {
  return watchLocation(async (location) => {
    await updateDoc(doc(db, 'alerts', alertId), {
      location,
      updatedAt: Date.now(),
    });
  });
}

export async function markSafe(alertId) {
  await updateDoc(doc(db, 'alerts', alertId), {
    status: 'safe',
    endedAt: Date.now(),
  });
}