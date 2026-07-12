import { ScrollView, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import type { ComponentProps } from 'react';
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { VStack } from '@/src/design-system/primitives';

// ── InputBase — createComponent handles all style props ───────────────────────
const InputBase = createComponent(TextInput, {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 8,
  borderWidth: 1,
  fontSize: 15,
  _light: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
    color: '#1a1a1a',
  },
  _dark: {
    backgroundColor: '#1e1e1e',
    borderColor: '#2a2a2a',
    color: '#f0f0f0',
  },
});

// ── StatusInputBase — flat style props in base:, variants alongside ────────────
const StatusInputBase = createComponent(TextInput, {
  base: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    _light: { backgroundColor: '#ffffff', color: '#1a1a1a' },
    _dark: { backgroundColor: '#1e1e1e', color: '#f0f0f0' },
  },
  variants: {
    status: {
      default: {
        _light: { borderColor: '#e5e5e5' },
        _dark: { borderColor: '#2a2a2a' },
      },
      error: {
        _light: { borderColor: '#e00c2c', backgroundColor: '#fff5f5' },
        _dark: { borderColor: '#ff6b80', backgroundColor: '#2a0a0a' },
      },
      success: {
        _light: { borderColor: '#79a964' },
        _dark: { borderColor: '#8fc477' },
      },
    },
  },
  defaultVariants: { status: 'default' },
});

type InputProps = ComponentProps<typeof InputBase> & { isDark?: boolean };
type StatusInputProps = ComponentProps<typeof StatusInputBase> & {
  isDark?: boolean;
};

// ── Thin wrappers — handle non-style props ────────────────────────────────────
function Input({ isDark, ...props }: InputProps) {
  return (
    <InputBase
      placeholderTextColor={isDark ? '#6b6b6b' : '#a0a0a0'}
      selectionColor={isDark ? '#a070b8' : '#8b59a0'}
      {...props}
    />
  );
}

function StatusInput({ isDark, ...props }: StatusInputProps) {
  return (
    <StatusInputBase
      placeholderTextColor={isDark ? '#6b6b6b' : '#a0a0a0'}
      selectionColor={isDark ? '#a070b8' : '#8b59a0'}
      {...props}
    />
  );
}

export default function InputDemoScreen() {
  const { isDark } = useColorMode();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Input', headerShown: false }} />

      <ShowcaseSection
        title="Basic"
        description="createComponent wraps TextInput. placeholderTextColor passed via wrapper."
      >
        <Input
          isDark={isDark}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="status variant"
        description="Validation state via variants — border and background change per status."
      >
        <VStack gap={10}>
          <StatusInput
            isDark={isDark}
            status="default"
            placeholder="Default state"
          />
          <StatusInput
            isDark={isDark}
            status="error"
            placeholder="Invalid email"
          />
          <StatusInput
            isDark={isDark}
            status="success"
            placeholder="Confirmed"
          />
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="Other types"
        description="All TextInput props pass through — no wrapping needed."
      >
        <VStack gap={10}>
          <Input isDark={isDark} placeholder="Password" secureTextEntry />
          <Input
            isDark={isDark}
            placeholder="Search..."
            returnKeyType="search"
          />
        </VStack>
      </ShowcaseSection>
    </ScrollView>
  );
}
