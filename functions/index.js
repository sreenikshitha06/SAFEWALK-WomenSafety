// This runs on Firebase's servers, not on the phone.
// The Twilio keys stay here so nobody can pull them out of the app.

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const twilio = require('twilio');

// These are set once from your terminal, see README step 5
const TWILIO_SID = defineSecret('TWILIO_ACCOUNT_SID');
const TWILIO_TOKEN = defineSecret('TWILIO_AUTH_TOKEN');
const TWILIO_FROM = defineSecret('TWILIO_PHONE_NUMBER');

exports.sendSOS = onCall(
  { secrets: [TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM] },
  async (request) => {
    // Only a logged-in user can send an alert
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be logged in.');
    }

    const { name, link, contacts } = request.data;

    if (!contacts || contacts.length === 0) {
      throw new HttpsError('invalid-argument', 'No contacts were given.');
    }

    const client = twilio(TWILIO_SID.value(), TWILIO_TOKEN.value());

    // Keep the message short and clear. Panic is not the time for paragraphs.
    const body =
      `${name} pressed the SOS button in SafeWalk and may need help.\n\n` +
      `Live location: ${link}\n\n` +
      `Please call them now.`;

    let sent = 0;
    const failed = [];

    // Send one by one so a single bad number doesn't stop the rest
    for (const contact of contacts) {
      try {
        await client.messages.create({
          body,
          from: TWILIO_FROM.value(),
          to: contact.phone,
        });
        sent += 1;
      } catch (error) {
        console.error(`SMS to ${contact.phone} failed:`, error.message);
        failed.push({ name: contact.name, phone: contact.phone });
      }
    }

    return { sent, failed };
  }
);
