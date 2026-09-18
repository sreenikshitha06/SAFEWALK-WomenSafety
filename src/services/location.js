// Anything to do with the phone's GPS.

import * as Location from 'expo-location';

// Ask the user for permission. Returns true / false.
export async function askForLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

// Get one position right now.
export async function getCurrentLocation() {
  const granted = await askForLocationPermission();
  if (!granted) throw new Error('Location permission was not given.');

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };
}

// Keep watching the position and call onUpdate every time it changes.
// Returns an object with a .remove() method — call it to stop watching.
export async function watchLocation(onUpdate) {
  const granted = await askForLocationPermission();
  if (!granted) throw new Error('Location permission was not given.');

  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,   // at most one update every 5 seconds
      distanceInterval: 10, // or every 10 metres moved
    },
    (position) => {
      onUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    }
  );
}

// Turns coordinates into a link anyone can open in Google Maps.
export function mapsLink(latitude, longitude) {
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}
