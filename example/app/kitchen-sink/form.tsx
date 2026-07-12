import { useState } from 'react';
import { ScrollView, Text, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { createComponentGroup } from 'react-native-small-ui';
import { VStack, Button, AppText } from '@/src/design-system/primitives';

// ── Form field group (module scope — never inside a component) ─────────────────

const { FormLabel, FormInput, FormHint, FormError } = createComponentGroup({
  FormLabel: {
    Component: Text,
    style: {
      fontSize: 13,
      fontWeight: '600' as const,
      marginBottom: 4,
      _light: { color: '#1a1a1a' },
      _dark: { color: '#f0f0f0' },
    },
  },
  FormInput: {
    Component: TextInput,
    style: {
      base: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        fontSize: 14,
      },
      variants: {
        status: {
          idle: {
            _light: {
              borderColor: '#e5e5e5',
              backgroundColor: '#ffffff',
              color: '#1a1a1a',
            },
            _dark: {
              borderColor: '#2a2a2a',
              backgroundColor: '#1a1a1a',
              color: '#f0f0f0',
            },
          },
          error: {
            _light: {
              borderColor: '#e00c2c',
              backgroundColor: '#fff5f5',
              color: '#1a1a1a',
            },
            _dark: {
              borderColor: '#ff6b80',
              backgroundColor: '#2a1a1a',
              color: '#f0f0f0',
            },
          },
          success: {
            _light: {
              borderColor: '#4caf50',
              backgroundColor: '#f5fff5',
              color: '#1a1a1a',
            },
            _dark: {
              borderColor: '#7ec87e',
              backgroundColor: '#1a2a1a',
              color: '#f0f0f0',
            },
          },
        },
      },
      defaultVariants: { status: 'idle' },
    },
  },
  FormHint: {
    Component: Text,
    style: {
      fontSize: 12,
      marginTop: 4,
      _light: { color: '#767676' },
      _dark: { color: '#a0a0a0' },
    },
  },
  FormError: {
    Component: Text,
    style: {
      fontSize: 12,
      fontWeight: '600' as const,
      marginTop: 4,
      _light: { color: '#e00c2c' },
      _dark: { color: '#ff6b80' },
    },
  },
});

// ── Field status helper (module scope) ────────────────────────────────────────

function fieldStatus(
  submitted: boolean,
  errors: Record<string, string>,
  field: string,
  value: string
): 'idle' | 'error' | 'success' {
  if (!submitted) return 'idle';
  if (errors[field] !== undefined) return 'error';
  if (value.length > 0) return 'success';
  return 'idle';
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function FormScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit() {
    const newErrors: Record<string, string> = {};
    if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }
    if (confirm.length === 0) {
      newErrors.confirm = 'Please confirm your password.';
    } else if (confirm !== password) {
      newErrors.confirm = 'Passwords do not match.';
    }
    setErrors(newErrors);
    setSubmitted(true);
  }

  const hasErrors = submitted && Object.keys(errors).length > 0;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
    >
      <Stack.Screen options={{ title: 'Registration Form' }} />

      {/* Header */}
      <VStack gap={4}>
        <AppText preset="h4" weight="bold">
          Create your account
        </AppText>
        <AppText
          preset="body"
          _light={{ color: '#767676' }}
          _dark={{ color: '#a0a0a0' }}
        >
          Fill in your details to get started.
        </AppText>
      </VStack>

      {/* Email field */}
      <VStack gap={0}>
        <FormLabel>Email address</FormLabel>
        <FormInput
          value={email}
          onChangeText={setEmail}
          status={fieldStatus(submitted, errors, 'email', email)}
          placeholder="you@example.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <FormHint>We'll never share your email.</FormHint>
        {submitted && errors.email !== undefined ? (
          <FormError>{errors.email}</FormError>
        ) : null}
      </VStack>

      {/* Password field */}
      <VStack gap={0}>
        <FormLabel>Password</FormLabel>
        <FormInput
          value={password}
          onChangeText={setPassword}
          status={fieldStatus(submitted, errors, 'password', password)}
          placeholder="Min. 8 characters"
          placeholderTextColor="#999"
          secureTextEntry
        />
        {submitted && errors.password !== undefined ? (
          <FormError>{errors.password}</FormError>
        ) : null}
      </VStack>

      {/* Confirm password field */}
      <VStack gap={0}>
        <FormLabel>Confirm password</FormLabel>
        <FormInput
          value={confirm}
          onChangeText={setConfirm}
          status={fieldStatus(submitted, errors, 'confirm', confirm)}
          placeholder="Re-enter your password"
          placeholderTextColor="#999"
          secureTextEntry
        />
        {submitted && errors.confirm !== undefined ? (
          <FormError>{errors.confirm}</FormError>
        ) : null}
      </VStack>

      {/* Submit */}
      <Button
        intent={hasErrors ? 'destructive' : 'primary'}
        onPress={handleSubmit}
        marginTop={8}
      >
        <AppText
          preset="body"
          weight="semibold"
          _light={{ color: '#fff' }}
          _dark={{ color: '#fff' }}
        >
          {hasErrors ? 'Fix errors above' : 'Create Account'}
        </AppText>
      </Button>
    </ScrollView>
  );
}
