import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { login, ApiError } from '../api';
import { theme } from '../theme';

export function LoginScreen({ onAuthenticated }: { onAuthenticated: (token: string) => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      onAuthenticated(await login(password));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.box}>
        <Text style={styles.eyebrow}>ANIRUDHBELWADI.COM</Text>
        <Text style={styles.title}>Portfolio analytics</Text>
        <Text style={styles.body}>Sign in with the admin password to see visitor activity.</Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          value={password}
          onChangeText={(next) => { setPassword(next); setError(null); }}
          placeholder="Admin password"
          placeholderTextColor={theme.color.textMuted}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={submit}
          editable={!busy}
          accessibilityLabel="Admin password"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, (busy || !password) && styles.buttonDisabled, pressed && styles.buttonPressed]}
          onPress={submit}
          disabled={busy || !password}
          accessibilityRole="button"
        >
          {busy ? <ActivityIndicator color="#0b1a2e" /> : <Text style={styles.buttonText}>Sign in</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.background, justifyContent: 'center', padding: theme.space(6) },
  box: { gap: theme.space(3) },
  eyebrow: { ...theme.text.label, color: theme.color.series1 },
  title: { ...theme.text.display, color: theme.color.textPrimary },
  body: { ...theme.text.body, color: theme.color.textSecondary, marginBottom: theme.space(2) },
  input: {
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space(4),
    paddingVertical: theme.space(3.5),
    color: theme.color.textPrimary,
    fontSize: 16,
  },
  inputError: { borderColor: theme.color.danger },
  error: { ...theme.text.body, color: theme.color.danger },
  button: {
    backgroundColor: theme.color.series1,
    borderRadius: theme.radius.md,
    paddingVertical: theme.space(3.5),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.85 },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#0b1a2e' },
});
