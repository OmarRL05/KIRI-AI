import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { ObjectTile } from '@/components/ObjectTile';
import { useApp } from '@/lib/app-context';
import { useTheme } from '@/lib/theme';
import { getLanguage } from '@/lib/types';

type Filter = 'all' | 'new' | 'learned';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'new', label: 'Nuevas' },
  { id: 'learned', label: 'Aprendidas' },
];

const GUTTER = 16;
const SIDE = 20;

export default function CollectionScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { objects, profile } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const inLanguage = useMemo(
    () => objects.filter((o) => o.language === profile.learning),
    [objects, profile.learning],
  );
  const data = useMemo(
    () =>
      inLanguage.filter((o) =>
        filter === 'all' ? true : filter === 'learned' ? o.learned : !o.learned,
      ),
    [inLanguage, filter],
  );
  const learnedCount = inLanguage.filter((o) => o.learned).length;
  const columns = width >= 700 ? 3 : 2;
  const availableWidth = width >= 700 ? width - 88 : width;
  const tileWidth = Math.floor(
    (Math.min(availableWidth, 900) - SIDE * 2 - GUTTER * (columns - 1)) / columns,
  );

  if (inLanguage.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: t.bg,
          paddingTop: insets.top + 24,
          paddingHorizontal: 32,
          justifyContent: 'center',
          gap: 28,
        }}>
        <Animated.View entering={FadeIn.duration(500).easing(Easing.bezier(0.16, 1, 0.3, 1))} style={{ gap: 12 }}>
          <Text
            style={{
              color: t.text,
              fontFamily: 'Geist_600SemiBold',
              fontSize: 36,
              lineHeight: 40,
              letterSpacing: -1.1,
            }}>
            Tu colección empieza con una foto
          </Text>
          <Text style={{ color: t.textMuted, fontSize: 17, lineHeight: 24 }}>
            Cada objeto que fotografíes se guarda aquí con su nombre en{' '}
            {getLanguage(profile.learning).name.toLowerCase()}.
          </Text>
        </Animated.View>
        <Button label="Abrir cámara" variant="primary" onPress={() => router.navigate('/')} />
      </View>
    );
  }

  return (
    <FlatList
      key={columns}
      data={data}
      numColumns={columns}
      keyExtractor={(i) => i.id}
      style={{ backgroundColor: t.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 120,
        paddingHorizontal: SIDE,
        gap: 28,
        alignSelf: 'center',
        width: '100%',
        maxWidth: 900,
      }}
      columnWrapperStyle={{ gap: GUTTER }}
      contentInsetAdjustmentBehavior="automatic"
      ListHeaderComponent={
        <View style={{ gap: 20, paddingBottom: 4 }}>
          <View style={{ gap: 4 }}>
            <Text
              accessibilityRole="header"
              style={{
                color: t.text,
                fontFamily: 'Geist_600SemiBold',
                fontSize: 34,
                lineHeight: 38,
                letterSpacing: -1,
              }}>
              Colección
            </Text>
            <Text style={{ color: t.textMuted, fontSize: 15 }}>
              {inLanguage.length} {inLanguage.length === 1 ? 'objeto' : 'objetos'} · {learnedCount}{' '}
              {learnedCount === 1 ? 'aprendido' : 'aprendidos'}
            </Text>
          </View>
          <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 8 }}>
            {FILTERS.map((f) => {
              const on = filter === f.id;
              return (
                <Pressable
                  key={f.id}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setFilter(f.id);
                  }}
                  style={{
                    minHeight: 44,
                    paddingHorizontal: 16,
                    borderRadius: 22,
                    justifyContent: 'center',
                    backgroundColor: on ? t.text : 'transparent',
                    borderWidth: 1,
                    borderColor: on ? t.text : t.line,
                  }}>
                  <Text style={{ color: on ? t.bg : t.text, fontSize: 15, fontWeight: '500' }}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      }
      ListEmptyComponent={
        <Text style={{ color: t.textMuted, fontSize: 16, paddingTop: 24 }}>
          {filter === 'learned'
            ? 'Aún no marcas ninguna como aprendida.'
            : 'No quedan objetos nuevos. Buen trabajo.'}
        </Text>
      }
      renderItem={({ item, index }) => (
        <ObjectTile
          item={item}
          index={index}
          width={tileWidth}
          onPress={() => router.push({ pathname: '/object/[id]', params: { id: item.id } })}
        />
      )}
    />
  );
}
