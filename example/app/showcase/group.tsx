import { ScrollView, TextInput, Text } from 'react-native';
import { Stack } from 'expo-router';
import { createComponentGroup } from 'react-native-small-ui';
import { ShowcaseSection } from '@/src/components';
import { VStack } from '@/src/design-system/primitives';

// ── Module-level group ───────────────────────────────────────────────────────

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
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      fontSize: 14,
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

// ── Screen ───────────────────────────────────────────────────────────────────

export default function GroupScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
      <Stack.Screen options={{ title: 'createComponentGroup' }} />

      <ShowcaseSection
        title="createComponentGroup"
        description="Sibling components sharing the same reactive context — no Provider needed."
      >
        <VStack gap={20}>
          <VStack gap={0}>
            <FormLabel>Email address</FormLabel>
            <FormInput
              placeholder="you@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormHint>We'll never share your email.</FormHint>
          </VStack>

          <VStack gap={0}>
            <FormLabel>Username</FormLabel>
            <FormInput
              placeholder="Choose a username"
              placeholderTextColor="#999"
            />
            <FormError>Username already taken.</FormError>
          </VStack>
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
