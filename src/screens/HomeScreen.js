import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { auth } from '../../firebaseConfig';
import { getCurrentLocation } from '../services/location';
import { startSOS, followUser, markSafe } from '../services/sos';
import { watchContacts } from '../services/contacts';
import { logOut } from '../services/auth';
import SosButton from '../components/SosButton';
import { colors, spacing, radius } from '../theme';

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [contactCount, setContactCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);

  const watcher = useRef(null);

  useEffect(() => {
    getCurrentLocation()
      .then(setLocation)
      .catch(() =>
        Alert.alert(
          'Location is off',
          'This app needs your location to send it to your contacts. Turn it on in settings.'
        )
      );
  }, []);

  useEffect(() => {
    const stop = watchContacts((list) => setContactCount(list.length));
    return stop;
  }, []);

  useEffect(() => {
    return () => {
      if (watcher.current) watcher.current.remove();
    };
  }, []);

  async function handleSOS() {
    setSending(true);
    try {
      const result = await startSOS();
      setLocation(result.location);
      setActiveAlert(result);
      watcher.current = await followUser(result.alertId);

      const failedCount = result.failed?.length || 0;
      Alert.alert(
        'Alert sent',
        failedCount > 0
          ? `${result.delivered} contact(s) were messaged. ${failedCount} could not be reached.`
          : `${result.delivered} contact(s) now have your location.`
      );
    } catch (e) {
      Alert.alert('Could not send', e.message);
    }
    setSending(false);
  }

  async function handleSafe() {
    if (watcher.current) {
      watcher.current.remove();
      watcher.current = null;
    }
    await markSafe(activeAlert.alertId);
    setActiveAlert(null);
    Alert.alert('Good to hear', 'Your contacts will stop getting location updates.');
  }

  const firstName = (auth.currentUser?.displayName || 'there').split(' ')[0];

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      {/* Top bar */}
      <View style={styles.header}>
        <Text style={styles.hello}>Hi {firstName}</Text>
        <TouchableOpacity onPress={logOut} hitSlop={10}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Contacts row. Always visible, always tappable. */}
      <TouchableOpacity
        style={styles.contactsBar}
        onPress={() => navigation.navigate('Contacts')}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.contactsBarTitle}>
            {contactCount === 0
              ? 'No trusted contacts yet'
              : `${contactCount} trusted contact${contactCount > 1 ? 's' : ''}`}
          </Text>
          <Text style={styles.contactsBarSub}>
            {contactCount === 0 ? 'Tap to add someone' : 'Tap to manage'}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      {/* Map fills whatever space is left over */}
      <View style={styles.mapBox}>
        {location ? (
          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
              pinColor={activeAlert ? colors.danger : colors.accent}
            />
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.placeholderText}>Finding your location…</Text>
          </View>
        )}
      </View>

      {/* Fixed height so it can never be pushed off screen */}
      <View style={styles.bottom}>
        {activeAlert ? (
          <View style={styles.activeBox}>
            <Text style={styles.activeTitle}>Alert is live</Text>
            <Text style={styles.activeText}>
              Your contacts can see where you are, and it keeps updating as you move.
            </Text>
            <TouchableOpacity style={styles.safeButton} onPress={handleSafe}>
              <Text style={styles.safeButtonText}>I'm safe now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <SosButton onTrigger={handleSOS} sending={sending} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  hello: { color: colors.text, fontSize: 22, fontWeight: '700' },
  logout: { color: colors.textMuted, fontSize: 14 },

  contactsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactsBarTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  contactsBarSub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  chevron: { color: colors.textMuted, fontSize: 26, marginLeft: spacing.sm },

  mapBox: {
    flex: 1,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: { flex: 1 },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: colors.textMuted },

  bottom: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
  },
  activeTitle: { color: colors.danger, fontSize: 19, fontWeight: '700' },
  activeText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 21,
  },
  safeButton: {
    backgroundColor: colors.safe,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    marginTop: spacing.md,
  },
  safeButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
