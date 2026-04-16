import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '../../constants/theme';

import { useFinanceStore, type TimeFilter } from '../store/useFinanceStore';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const timeFilters: { label: string; value: TimeFilter }[] = [
  { label: 'Hoy', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Todo', value: 'all' },
];

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function HomeScreen() {
  const transactions = useFinanceStore((state) => state.transactions);
  const timeFilter = useFinanceStore((state) => state.timeFilter);
  const setTimeFilter = useFinanceStore((state) => state.setTimeFilter);

  const balance = useMemo(() => {
    return transactions.reduce((acc, item) => {
      if (item.category_type === 'income') {
        return acc + item.amount;
      }
      return acc - item.amount;
    }, 0);
  }, [transactions]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppTheme.colors.bg }} edges={['top', 'left', 'right']}>
      <LinearGradient colors={AppTheme.gradients.background} style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: AppTheme.colors.text }}>Mis Finanzas</Text>
          <Pressable
            onPress={() => router.push('/settings')}
            style={{
              height: 42,
              width: 42,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 999,
              borderWidth: 1,
              borderColor: AppTheme.colors.border,
              backgroundColor: AppTheme.colors.card,
            }}
          >
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </Pressable>
        </View>
        <Text style={{ marginTop: 4, fontSize: 14, color: AppTheme.colors.textMuted }}>Controla tus ingresos y egresos</Text>

        <LinearGradient
          colors={AppTheme.gradients.card}
          style={{
            marginTop: 18,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: AppTheme.colors.border,
            padding: 18,
          }}
        >
          <Text style={{ fontSize: 12, color: AppTheme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.9 }}>
            Balance Total
          </Text>
          <Text
            style={{
              marginTop: 10,
              fontSize: 34,
              fontWeight: '900',
              color: balance >= 0 ? '#fca5a5' : AppTheme.colors.accent,
            }}
          >
            {currencyFormatter.format(balance)}
          </Text>
        </LinearGradient>

        <View style={{ marginTop: 14, flexDirection: 'row', borderRadius: 999, borderWidth: 1, borderColor: AppTheme.colors.border, backgroundColor: AppTheme.colors.card, padding: 4 }}>
          {timeFilters.map((filter) => {
            const isActive = timeFilter === filter.value;

            return (
              <Pressable
                key={filter.value}
                onPress={() => {
                  void setTimeFilter(filter.value);
                }}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  backgroundColor: isActive ? AppTheme.colors.accent : AppTheme.colors.cardAlt,
                }}
              >
                <Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '800', color: isActive ? '#ffe4e6' : AppTheme.colors.textMuted }}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: AppTheme.colors.text }}>Movimientos</Text>
          <Pressable
            onPress={() => router.push('/add')}
            style={{
              borderRadius: 12,
              backgroundColor: AppTheme.colors.accent,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#fff1f2' }}>+ Agregar</Text>
          </Pressable>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
          ListEmptyComponent={
            <View
              style={{
                marginTop: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: AppTheme.colors.border,
                borderStyle: 'dashed',
                paddingVertical: 28,
                paddingHorizontal: 16,
                backgroundColor: AppTheme.colors.card,
              }}
            >
              <Text style={{ textAlign: 'center', color: AppTheme.colors.textMuted }}>Aun no tienes movimientos.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isIncome = item.category_type === 'income';
            return (
              <Pressable
                onPress={() => router.push(`/transaction/${item.id}`)}
                style={{
                  marginBottom: 10,
                  borderRadius: 14,
                  backgroundColor: AppTheme.colors.card,
                  borderWidth: 1,
                  borderColor: AppTheme.colors.border,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={{ color: AppTheme.colors.text, fontSize: 15, fontWeight: '700' }}>{item.category_name}</Text>
                    <Text style={{ marginTop: 3, color: AppTheme.colors.textMuted, fontSize: 12 }}>{formatDate(item.date)}</Text>
                    <Text style={{ marginTop: 6, color: '#d4d4d4', fontSize: 13 }} numberOfLines={1}>
                      {item.note || 'Sin nota'}
                    </Text>
                  </View>
                  <Text style={{ color: isIncome ? '#fda4af' : AppTheme.colors.accent, fontSize: 16, fontWeight: '900' }}>
                    {isIncome ? '+' : '-'}
                    {currencyFormatter.format(item.amount)}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}
