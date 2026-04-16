import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { AppTheme } from '../constants/theme';
import { useBalanceChartData } from '../store/useFinanceStore';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export default function ExpenseChart() {
  const chartData = useBalanceChartData();

  if (!chartData || chartData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay movimientos en este periodo</Text>
      </View>
    );
  }

  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Balance: Ingresos vs Gastos</Text>
      <View style={styles.chartWrapper}>
        <PieChart
          data={chartData}
          donut
          radius={75}
          innerRadius={45}
          innerCircleColor={AppTheme.colors.card}
          backgroundColor="transparent"
          centerLabelComponent={() => {
            return (
              <View style={styles.centerLabel}>
                <Text style={styles.centerTextTotal}>Total</Text>
                <Text style={styles.centerTextValue}>
                  {currencyFormatter.format(totalAmount)}
                </Text>
              </View>
            );
          }}
        />

        <View style={styles.legendContainer}>
          {chartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <View style={styles.legendTextWrapper}>
                <Text style={styles.legendText} numberOfLines={1}>{item.text}</Text>
                <Text style={styles.legendValue}>{currencyFormatter.format(item.value)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: AppTheme.colors.text,
    marginBottom: 12,
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerTextTotal: {
    fontSize: 10,
    color: AppTheme.colors.textMuted,
    fontWeight: 'bold',
  },
  centerTextValue: {
    fontSize: 12,
    color: AppTheme.colors.text,
    fontWeight: '900',
    marginTop: 2,
  },
  legendContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    height: 12,
    width: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendTextWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 12,
    color: AppTheme.colors.text,
    flex: 1,
    paddingRight: 4,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '700',
    color: AppTheme.colors.textMuted,
  },
  emptyContainer: {
    marginTop: 20,
    backgroundColor: AppTheme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: AppTheme.colors.border,
    borderStyle: 'dashed',
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: AppTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});