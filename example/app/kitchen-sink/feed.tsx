import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import {
  Card,
  Box,
  HStack,
  VStack,
  AppText,
  Badge,
  Button,
} from '@/src/design-system/primitives';
import { getBadgeTextColor } from '@/src/design-system/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TagData {
  label: string;
  intent: 'info' | 'success' | 'warning' | 'destructive';
}

interface PostData {
  id: string;
  author: string;
  handle: string;
  timestamp: string;
  body: string;
  tags: TagData[];
  likes: number;
  comments: number;
  avatarColor: { light: string; dark: string };
}

// ── Data ──────────────────────────────────────────────────────────────────────

const POSTS: PostData[] = [
  {
    id: '1',
    author: 'Alex Rivera',
    handle: '@alexr',
    timestamp: '2h ago',
    body: 'Just shipped the new design system tokens. Dark mode parity across every component. Really happy with how the color ramp turned out.',
    tags: [
      { label: 'Design', intent: 'info' },
      { label: 'Open Source', intent: 'success' },
    ],
    likes: 142,
    comments: 38,
    avatarColor: { light: '#d4a5e8', dark: '#5a2d78' },
  },
  {
    id: '2',
    author: 'Sam Chen',
    handle: '@samchen',
    timestamp: '5h ago',
    body: 'React Native performance tip: stop putting createComponent inside render functions. I profiled an app doing this — 40ms render became 4ms after moving it to module scope.',
    tags: [
      { label: 'Performance', intent: 'warning' },
      { label: 'React Native', intent: 'info' },
    ],
    likes: 89,
    comments: 21,
    avatarColor: { light: '#a8d5b5', dark: '#2d5a3d' },
  },
  {
    id: '3',
    author: 'Mia Torres',
    handle: '@miat',
    timestamp: '1d ago',
    body: 'Hot take: the best component libraries give you zero components. Give me a factory, give me tokens, let me build. Stop shipping opinionated UI I have to fight.',
    tags: [{ label: 'Hot Take', intent: 'destructive' }],
    likes: 317,
    comments: 94,
    avatarColor: { light: '#f5c5a3', dark: '#7a3a18' },
  },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function FeedScreen() {
  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
    >
      <Stack.Screen options={{ title: 'Social Feed' }} />

      {POSTS.map((post) => (
        <Card key={post.id}>
          <Card.Header>
            <HStack gap={12}>
              <Box
                width={44}
                height={44}
                borderRadius={22}
                alignItems="center"
                justifyContent="center"
                _light={{ backgroundColor: post.avatarColor.light }}
                _dark={{ backgroundColor: post.avatarColor.dark }}
              >
                <AppText
                  weight="bold"
                  _light={{ color: '#fff' }}
                  _dark={{ color: '#fff' }}
                >
                  {post.author[0]}
                </AppText>
              </Box>
              <VStack gap={2} flex={1}>
                <AppText preset="h6" weight="semibold">
                  {post.author}
                </AppText>
                <HStack gap={4}>
                  <AppText
                    preset="small"
                    _light={{ color: '#767676' }}
                    _dark={{ color: '#a0a0a0' }}
                  >
                    {post.handle}
                  </AppText>
                  <AppText
                    preset="small"
                    _light={{ color: '#767676' }}
                    _dark={{ color: '#a0a0a0' }}
                  >
                    ·
                  </AppText>
                  <AppText
                    preset="small"
                    _light={{ color: '#767676' }}
                    _dark={{ color: '#a0a0a0' }}
                  >
                    {post.timestamp}
                  </AppText>
                </HStack>
              </VStack>
            </HStack>
          </Card.Header>

          <Card.Body>
            <VStack gap={12}>
              <AppText preset="body">{post.body}</AppText>
              <HStack gap={6} flexWrap="wrap">
                {post.tags.map((tag) => {
                  const textColor = getBadgeTextColor(tag.intent);
                  return (
                    <Badge key={tag.label} intent={tag.intent}>
                      <AppText
                        preset="small"
                        weight="semibold"
                        _light={{ color: textColor.light }}
                        _dark={{ color: textColor.dark }}
                      >
                        {tag.label}
                      </AppText>
                    </Badge>
                  );
                })}
              </HStack>
            </VStack>
          </Card.Body>

          <Card.Footer justifyContent="space-between">
            <Button intent="ghost" size="sm">
              <AppText
                preset="caption"
                _light={{ color: '#6b3d82' }}
                _dark={{ color: '#c084dc' }}
              >
                ♥ {post.likes}
              </AppText>
            </Button>
            <Button intent="ghost" size="sm">
              <AppText
                preset="caption"
                _light={{ color: '#767676' }}
                _dark={{ color: '#a0a0a0' }}
              >
                💬 {post.comments}
              </AppText>
            </Button>
            <Button intent="ghost" size="sm">
              <AppText
                preset="caption"
                _light={{ color: '#767676' }}
                _dark={{ color: '#a0a0a0' }}
              >
                ↗ Share
              </AppText>
            </Button>
          </Card.Footer>
        </Card>
      ))}
    </ScrollView>
  );
}
