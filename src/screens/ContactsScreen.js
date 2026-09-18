import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { addContact, deleteContact, watchContacts } from '../services/contacts';
import { colors, spacing, radius } from '../theme';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const stop = watchContacts(setContacts);
    return stop;
  }, []);

  async function handleAdd() {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Almost there', 'A contact needs both a name and a phone number.');
      return;
    }
    // Twilio needs the country code, e.g. +919812345678
    if (!phone.trim().startsWith('+')) {
      Alert.alert(
        'Add the country code',
        'Write the number with its country code, like +919812345678.'
      );
      return;
    }
    try {
      await addContact(name, phone);
      setName('');
      setPhone('');
    } catch (e) {
      Alert.alert('Could not save', 'Check your connection and try again.');
    }
  }

  function handleDelete(contact) {
    Alert.alert('Remove contact', `${contact.name} will no longer get your alerts.`, [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteContact(contact.id),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.form}>
        <Text style={styles.heading}>Trusted contacts</Text>
        <Text style={styles.sub}>
          These are the people who get a text with your location when you press SOS.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone with country code (+919812345678)"
          placeholderTextColor={colors.textMuted}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add contact</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nobody added yet. Start with one person you'd call first.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowPhone}>{item.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)}>
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  form: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  heading: { color: colors.text, fontSize: 24, fontWeight: '700' },
  sub: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 21,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.accent,
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowName: { color: colors.text, fontSize: 16, fontWeight: '600' },
  rowPhone: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  remove: { color: colors.danger, fontSize: 14 },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 22,
  },
});
