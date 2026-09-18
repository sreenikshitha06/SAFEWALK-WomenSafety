# SafeWalk

An emergency SOS app. One tap sends your location as a text message to the
people you chose in advance, and keeps updating that location while you move.

Built with Expo (React Native), Firebase Auth, Firestore, Google Maps and Twilio.

## What's in each file

```
App.js                      navigation + "is someone logged in?"
firebaseConfig.js           your Firebase keys (only place you paste them)
app.json                    permissions + Google Maps key
firestore.rules             database security rules

src/theme.js                every colour and size in the app
src/components/SosButton.js the red button and its 5-second countdown
src/screens/
  LoginScreen.js
  SignupScreen.js
  HomeScreen.js             map + SOS button + "I'm safe" state
  ContactsScreen.js         add / remove trusted contacts
src/services/
  auth.js                   signup, login, logout, friendly error messages
  contacts.js               contacts saved in Firestore
  location.js               GPS permission, current position, live tracking
  sos.js                    the emergency flow, start to finish

functions/index.js          runs on Firebase, sends SMS through Twilio
```

If you want to change something, the services folder is where the logic is and
the screens folder is where the looks are. They don't overlap.

## Setup

**1. Create the project**

```bash
npx create-expo-app safewalk --template blank
cd safewalk
```

Then copy all the files from here into that folder, replacing App.js.

**2. Install the packages**

```bash
npx expo install firebase @react-native-async-storage/async-storage \
  @react-navigation/native @react-navigation/native-stack \
  react-native-screens react-native-safe-area-context \
  react-native-maps expo-location
```

Use `npx expo install` rather than `npm install` — it picks versions that
match your Expo SDK.

**3. Firebase**

- Create a project at console.firebase.google.com
- Authentication → Sign-in method → turn on **Email/Password**
- Firestore Database → Create database
- Firestore → Rules → paste in `firestore.rules`
- Project settings → add a **Web** app → copy the config into `firebaseConfig.js`

**4. Google Maps key**

- Google Cloud Console → enable **Maps SDK for Android** and **Maps SDK for iOS**
- Create an API key, paste it into `app.json` in both places

**5. Twilio (the SMS part)**

Firebase Cloud Functions need the Blaze plan. It's pay-as-you-go and this app
costs roughly nothing at student scale, but a card has to be on file.

```bash
npm install -g firebase-tools
firebase login
firebase init functions        # pick JavaScript, skip overwriting index.js
cd functions && npm install && cd ..
```

Get your Account SID, Auth Token and a phone number from twilio.com, then:

```bash
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_PHONE_NUMBER
firebase deploy --only functions
```

On a free Twilio trial you can only text numbers you've verified in the Twilio
console, and every message gets a "Sent from your Twilio trial account" prefix.
Fine for a demo.

**6. Run it**

```bash
npx expo start
```

Tunnel — if the hotspot isn't an option:

powershell
```bash
npx expo start --tunnel
```

Say yes when it offers to install @expo/ngrok. The address becomes a long .exp.direct URL that routes over the internet. Slower, but it works through any network.

Maps and GPS don't work properly in Expo Go on some setups. If the map is blank,
build a dev client: `npx expo run:android`.

## How the SOS actually works

1. You tap SOS → 5 second countdown (tap again to cancel)
2. App reads your GPS position
3. An alert record is written to Firestore
4. The app calls the `sendSOS` cloud function
5. That function texts each contact a Google Maps link through Twilio
6. Your phone keeps writing new coordinates into the alert as you move
7. You tap "I'm safe now" → tracking stops

## Things to know before you rely on this

- Location updates only run while the app is open. Background tracking needs
  `expo-task-manager` plus extra permissions, which is a bigger job.
- The contact gets one SMS with a link, not a live-updating message. The link
  points at coordinates from the moment you pressed the button. To make the link
  itself live you'd host a small web page that reads the alert from Firestore.
- No phone app is a substitute for emergency services. Keep 112 / 100 in reach.

## Ideas if you want to extend it

- Shake the phone to trigger SOS (`expo-sensors`)
- A fake incoming call to help you leave a situation
- Alert history screen reading from the `alerts` collection
- Let contacts open a live web map instead of a static pin
## PROJECT OUTCOMES
-SIGN UP PAGE
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/347ebf1e-074f-4ffe-8b08-edb753001b68" />
-SIGN IN PAGE
<img width="1080" height="2400" alt="image" src="https://github.com/user-attachments/assets/6209e70c-e71c-42a3-9d3e-370932ff40b0" />
-DASHBOARD
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/f1ab13a8-759b-40fe-aa24-b78ed9a899f1" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/356d2d94-362c-4050-9efc-6beff79a083d" />
<img width="720" height="1600" alt="image" src="https://github.com/user-attachments/assets/2e13b860-3e45-4c4e-a972-1dc73769d771" />
-ADD CONTACTS
<img width="720" height="1600" alt="WhatsApp Image 2026-09-18 at 3 49 03 PM" src="https://github.com/user-attachments/assets/8519f421-0fc8-46fa-ae21-1c495fa5ac9b" />
-NOTIFICATION
<img width="714" height="1584" alt="WhatsApp Image 2026-09-18 at 4 03 08 PM" src="https://github.com/user-attachments/assets/84fcf977-1224-4d2a-beb4-cb727889a591" />

