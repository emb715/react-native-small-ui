import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import { createComponentGroup } from 'react-native-small-ui';
import { useTheme } from 'react-native-small-ui/theme';
import {
  Box,
  Center,
  HStack,
  VStack,
  AppText,
  Badge,
  Divider,
} from '@/src/design-system/primitives';
import type { AppTheme } from '@/src/theme/types';
import { getBadgeTextColor } from '@/src/design-system/utils';

// ── Settings row group (module scope) ─────────────────────────────────────────

const { SettingsRow, SettingsDivider } = createComponentGroup({
  SettingsRow: {
    Component: View,
    style: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingVertical: 14,
      paddingHorizontal: 16,
      _light: { backgroundColor: '#ffffff' },
      _dark: { backgroundColor: '#1e1e1e' },
    },
  },
  SettingsDivider: {
    Component: View,
    style: {
      height: 0.5,
      marginLeft: 16,
      _light: { backgroundColor: '#e5e5e5' },
      _dark: { backgroundColor: '#2a2a2a' },
    },
  },
});

// ── Static data ───────────────────────────────────────────────────────────────

const STATS = [
  { value: '142', label: 'Posts' },
  { value: '3.4k', label: 'Followers' },
  { value: '89', label: 'Following' },
];

interface SettingsBadge {
  label: string;
  intent: 'info' | 'success' | 'warning' | 'destructive';
}
interface SettingsRowData {
  label: string;
  value: string;
  badge: SettingsBadge | null;
}
interface SettingsSection {
  title: string;
  rows: SettingsRowData[];
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    title: 'Account',
    rows: [
      { label: 'Display Name', value: 'Alex Rivera', badge: null },
      { label: 'Email', value: 'alex@example.com', badge: null },
      {
        label: 'Plan',
        value: 'Pro',
        badge: { label: 'Active', intent: 'success' },
      },
    ],
  },
  {
    title: 'Preferences',
    rows: [
      { label: 'Notifications', value: 'On', badge: null },
      { label: 'Theme', value: 'System', badge: null },
    ],
  },
];

// ── BadgeLabel component (module scope) ───────────────────────────────────────

function BadgeLabel({
  intent,
  label,
}: {
  intent: SettingsBadge['intent'];
  label: string;
}) {
  const tc = getBadgeTextColor(intent);
  return (
    <Badge intent={intent}>
      <AppText
        preset="small"
        weight="semibold"
        _light={{ color: tc.light }}
        _dark={{ color: tc.dark }}
      >
        {label}
      </AppText>
    </Badge>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const theme = useTheme() as AppTheme;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: 'User Profile' }} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Center
        gap={16}
        padding={24}
        _light={{ backgroundColor: '#ffffff' }}
        _dark={{ backgroundColor: '#0f0f0f' }}
      >
        {/* Avatar ring: outer border uses theme primary, inner circle is fixed */}
        <Box
          width={96}
          height={96}
          borderRadius={48}
          borderWidth={3}
          alignItems="center"
          justifyContent="center"
          _light={{ borderColor: theme.light.primary }}
          _dark={{ borderColor: theme.dark.primary }}
        >
          <Box
            width={80}
            height={80}
            borderRadius={40}
            alignItems="center"
            justifyContent="center"
            _light={{ backgroundColor: '#d4a5e8' }}
            _dark={{ backgroundColor: '#5a2d78' }}
          >
            <AppText
              preset="h2"
              weight="bold"
              _light={{ color: '#fff' }}
              _dark={{ color: '#fff' }}
            >
              A
            </AppText>
          </Box>
        </Box>

        {/* Name + handle */}
        <Center gap={4}>
          <AppText preset="h4" weight="bold">
            Alex Rivera
          </AppText>
          <AppText
            preset="body"
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            @alexr · Senior Engineer
          </AppText>
        </Center>

        {/* Stats */}
        <HStack justifyContent="space-around" width="100%">
          {STATS.map((stat) => (
            <Center key={stat.label} gap={2}>
              <AppText preset="h4" weight="bold">
                {stat.value}
              </AppText>
              <AppText
                preset="caption"
                _light={{ color: '#767676' }}
                _dark={{ color: '#a0a0a0' }}
              >
                {stat.label}
              </AppText>
            </Center>
          ))}
        </HStack>
      </Center>

      <Divider />

      {/* ── Settings ──────────────────────────────────────────────────────── */}
      {SETTINGS_SECTIONS.map((section) => (
        <VStack key={section.title} gap={0}>
          <AppText
            preset="caption"
            weight="semibold"
            paddingHorizontal={16}
            paddingVertical={12}
            _light={{ color: '#767676' }}
            _dark={{ color: '#a0a0a0' }}
          >
            {section.title.toUpperCase()}
          </AppText>

          {section.rows.map((row, idx) => (
            <VStack key={row.label} gap={0}>
              <SettingsRow>
                <AppText preset="body">{row.label}</AppText>
                <HStack gap={8} alignItems="center">
                  <AppText
                    preset="body"
                    _light={{ color: '#767676' }}
                    _dark={{ color: '#a0a0a0' }}
                  >
                    {row.value}
                  </AppText>
                  {row.badge ? (
                    <BadgeLabel
                      intent={row.badge.intent}
                      label={row.badge.label}
                    />
                  ) : null}
                </HStack>
              </SettingsRow>
              {idx < section.rows.length - 1 ? <SettingsDivider /> : null}
            </VStack>
          ))}

          <Divider marginBottom={8} />
        </VStack>
      ))}
    </ScrollView>
  );
}
