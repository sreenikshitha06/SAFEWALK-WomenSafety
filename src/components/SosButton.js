import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, spacing } from '../theme';

// Press the button and a 5 second countdown starts.
// This is on purpose: a pocket-press should be cancellable,
// but a real emergency should not need a confirmation dialog.

const COUNTDOWN_SECONDS = 5;

export default function SosButton({ onTrigger, sending }) {
  const [counting, setCounting] = useState(false);
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!counting) return;

    if (seconds === 0) {
      setCounting(false);
      setSeconds(COUNTDOWN_SECONDS);
      onTrigger();
      return;
    }

    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [counting, seconds]);

  function start() {
    setSeconds(COUNTDOWN_SECONDS);
    setCounting(true);
  }

  function cancel() {
    setCounting(false);
    setSeconds(COUNTDOWN_SECONDS);
  }

  if (sending) {
    return (
      <View style={[styles.button, styles.sending]}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={styles.label}>Sending</Text>
      </View>
    );
  }

  if (counting) {
    return (
      <View style={styles.wrap}>
        <TouchableOpacity style={[styles.button, styles.counting]} onPress={cancel}>
          <Text style={styles.count}>{seconds}</Text>
          <Text style={styles.label}>Tap to cancel</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Sending your location in {seconds}s</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <TouchableOpacity style={styles.button} onPress={start} activeOpacity={0.85}>
        <Text style={styles.sos}>SOS</Text>
        <Text style={styles.label}>Hold nothing, just tap</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>You get 5 seconds to cancel</Text>
    </View>
  );
}

const SIZE = 190;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: colors.dangerDark,
  },
  counting: { backgroundColor: colors.dangerDark },
  sending: { backgroundColor: colors.dangerDark, alignSelf: 'center' },
  sos: { color: '#fff', fontSize: 46, fontWeight: '800', letterSpacing: 2 },
  count: { color: '#fff', fontSize: 64, fontWeight: '800' },
  label: { color: '#ffffffcc', fontSize: 13, marginTop: 4 },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm },
});
