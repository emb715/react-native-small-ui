import { ScrollView, TouchableOpacity, Text as RNText } from 'react-native';
import { Stack } from 'expo-router';
import { createComponent } from 'react-native-small-ui';
import { useColorMode } from 'react-native-small-ui/colormode';
import { ShowcaseSection } from '@/src/components';
import { VStack } from '@/src/design-system/primitives';

// Slot components — created at module scope, passed to .withSlots()
const SlottedButtonText = createComponent(RNText, {
  base: {
    fontSize: 15,
    fontWeight: '600',
  },
  variants: {
    intent: {
      primary: { _light: { color: '#fff' }, _dark: { color: '#fff' } },
      ghost: { _light: { color: '#007AFF' }, _dark: { color: '#0A84FF' } },
    },
  },
  defaultVariants: { intent: 'primary' },
});

const SlottedButtonIcon = createComponent(RNText, {
  base: {
    fontSize: 16,
    marginRight: 6,
  },
  variants: {
    intent: {
      primary: { _light: { color: '#fff' }, _dark: { color: '#fff' } },
      ghost: { _light: { color: '#007AFF' }, _dark: { color: '#0A84FF' } },
    },
  },
  defaultVariants: { intent: 'primary' },
});

// Button with slots — as defined in Button.mdx, created at module scope
const SlottedButton = createComponent(TouchableOpacity, {
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  variants: {
    intent: {
      primary: {
        _light: { backgroundColor: '#007AFF' },
        _dark: { backgroundColor: '#0A84FF' },
      },
      ghost: {
        backgroundColor: 'transparent',
        _light: { borderWidth: 1, borderColor: '#007AFF' },
        _dark: { borderWidth: 1, borderColor: '#0A84FF' },
      },
    },
    size: {
      md: { paddingVertical: 10, paddingHorizontal: 20 },
    },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
})
  .withSlots({
    Text: SlottedButtonText,
    Icon: SlottedButtonIcon,
  })
  .withVariantContext('intent');

export default function ButtonSlotOverrideScreen() {
  const { isDark } = useColorMode();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#ffffff' }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <Stack.Screen options={{ title: 'Slot Override', headerShown: false }} />

      <ShowcaseSection
        title="withVariantContext"
        description="intent on Button flows to Button.Text and Button.Icon automatically via context."
      >
        <VStack>
          <SlottedButton intent="primary">
            <SlottedButton.Icon>✓</SlottedButton.Icon>
            <SlottedButton.Text>
              Primary — slots inherit intent
            </SlottedButton.Text>
          </SlottedButton>

          <SlottedButton intent="ghost">
            <SlottedButton.Text>
              Ghost — slots inherit intent
            </SlottedButton.Text>
          </SlottedButton>
        </VStack>
      </ShowcaseSection>

      <ShowcaseSection
        title="Explicit slot prop overrides context"
        description="Button.Icon intent='primary' overrides the ghost context from the parent."
      >
        <SlottedButton intent="ghost">
          <SlottedButton.Icon intent="primary">→</SlottedButton.Icon>
          <SlottedButton.Text>Continue</SlottedButton.Text>
        </SlottedButton>
      </ShowcaseSection>
    </ScrollView>
  );
}
