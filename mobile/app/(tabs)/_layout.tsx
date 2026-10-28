import { Tabs, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '@/components/Icon';
import { useTheme } from '@/lib/theme';

const ITEMS: { name: string; href: '/' | '/collection' | '/profile'; title: string; icon: IconName }[] = [
  { name: 'index', href: '/', title: 'Cámara', icon: 'camera' },
  { name: 'collection', href: '/collection', title: 'Colección', icon: 'grid' },
  { name: 'profile', href: '/profile', title: 'Perfil', icon: 'user' },
];

/**
 * Unified tab bar across iOS, Android, and Web so the scene container always
 * ends cleanly above the bottom bar (never covering the camera shutter button)
 * and SVG tab icons render reliably in Expo Go without missing native drawables.
 */
export default function TabsLayout() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 700;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: isTablet ? { paddingLeft: 88 } : undefined,
      }}
      tabBar={({ state }) => {
        if (isTablet) {
          return (
            <View
              accessibilityRole="tablist"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 88,
                backgroundColor: t.surface,
                borderRightWidth: 1,
                borderRightColor: t.line,
                paddingTop: Math.max(insets.top, 28),
                paddingBottom: Math.max(insets.bottom, 24),
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  color: t.text,
                  fontFamily: 'Geist_600SemiBold',
                  fontSize: 16,
                  letterSpacing: -0.4,
                }}>
                KIRI
              </Text>
              <View style={{ gap: 12, width: '100%', paddingHorizontal: 10 }}>
                {ITEMS.map((item, idx) => {
                  const focused = state.index === idx;
                  const color = focused ? t.text : t.textMuted;
                  return (
                    <Pressable
                      key={item.name}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: focused }}
                      accessibilityLabel={item.title}
                      onPress={() => {
                        Haptics.selectionAsync();
                        router.navigate(item.href);
                      }}
                      style={{
                        minHeight: 56,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        backgroundColor: focused ? t.surfaceMuted : 'transparent',
                      }}>
                      <Icon name={item.icon} size={22} color={color} />
                      <Text
                        style={{
                          color,
                          fontFamily: 'Geist_500Medium',
                          fontSize: 11,
                          lineHeight: 14,
                          fontWeight: '500',
                        }}>
                        {item.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ height: 20 }} />
            </View>
          );
        }

        return (
          <View
            accessibilityRole="tablist"
            style={{
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom, 10),
              backgroundColor: t.surface,
              borderTopWidth: 1,
              borderTopColor: t.line,
              flexDirection: 'row',
            }}>
            {ITEMS.map((item, idx) => {
              const focused = state.index === idx;
              const color = focused ? t.text : t.textMuted;
              return (
                <Pressable
                  key={item.name}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: focused }}
                  accessibilityLabel={item.title}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.navigate(item.href);
                  }}
                  style={{
                    flex: 1,
                    minHeight: 52,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}>
                  <Icon name={item.icon} size={22} color={color} />
                  <Text
                    style={{
                      color,
                      fontFamily: 'Geist_500Medium',
                      fontSize: 12,
                      lineHeight: 16,
                      fontWeight: '500',
                    }}>
                    {item.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        );
      }}>
      <Tabs.Screen name="index" options={{ title: 'Cámara' }} />
      <Tabs.Screen name="collection" options={{ title: 'Colección' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
