import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFinanceStore } from '../src/store/useFinanceStore';

const currencyFormatter = new Intl.NumberFormat('es-CO', {
	style: 'currency',
	currency: 'COP',
	maximumFractionDigits: 0,
});

function formatDate(timestamp: number) {
	return new Date(timestamp).toLocaleDateString('es-CO', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

export default function HomeScreen() {
	const transactions = useFinanceStore((state) => state.transactions);

	const balance = useMemo(() => {
		return transactions.reduce((acc, item) => {
			if (item.category_type === 'income') {
				return acc + item.amount;
			}
			return acc - item.amount;
		}, 0);
	}, [transactions]);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }} edges={['top', 'left', 'right']}>
			<View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
				<Text style={{ fontSize: 26, fontWeight: '800', color: '#f8fafc' }}>Mis Finanzas</Text>
				<Text style={{ marginTop: 4, fontSize: 14, color: '#94a3b8' }}>Controla tus ingresos y egresos</Text>

				<View
					style={{
						marginTop: 18,
						borderRadius: 18,
						backgroundColor: '#0f172a',
						borderWidth: 1,
						borderColor: '#1e293b',
						padding: 18,
					}}
				>
					<Text style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.7 }}>
						Balance Total
					</Text>
					<Text
						style={{
							marginTop: 10,
							fontSize: 34,
							fontWeight: '900',
							color: balance >= 0 ? '#34d399' : '#fb7185',
						}}
					>
						{currencyFormatter.format(balance)}
					</Text>
				</View>

				<View style={{ marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
					<Text style={{ fontSize: 18, fontWeight: '700', color: '#f1f5f9' }}>Movimientos</Text>
					<Pressable
						onPress={() => router.push('/add')}
						style={{
							borderRadius: 12,
							backgroundColor: '#38bdf8',
							paddingHorizontal: 12,
							paddingVertical: 8,
						}}
					>
						<Text style={{ fontSize: 13, fontWeight: '800', color: '#082f49' }}>+ Agregar</Text>
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
								borderColor: '#334155',
								borderStyle: 'dashed',
								paddingVertical: 28,
								paddingHorizontal: 16,
							}}
						>
							<Text style={{ textAlign: 'center', color: '#94a3b8' }}>Aun no tienes movimientos.</Text>
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
									backgroundColor: '#0f172a',
									borderWidth: 1,
									borderColor: '#1e293b',
									paddingHorizontal: 14,
									paddingVertical: 12,
								}}
							>
								<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
									<View style={{ flex: 1, paddingRight: 8 }}>
										<Text style={{ color: '#f8fafc', fontSize: 15, fontWeight: '700' }}>{item.category_name}</Text>
										<Text style={{ marginTop: 3, color: '#94a3b8', fontSize: 12 }}>{formatDate(item.date)}</Text>
										<Text style={{ marginTop: 6, color: '#cbd5e1', fontSize: 13 }} numberOfLines={1}>
											{item.note || 'Sin nota'}
										</Text>
									</View>
									<Text style={{ color: isIncome ? '#34d399' : '#fb7185', fontSize: 16, fontWeight: '800' }}>
										{isIncome ? '+' : '-'}{currencyFormatter.format(item.amount)}
									</Text>
								</View>
							</Pressable>
						);
					}}
				/>
			</View>
		</SafeAreaView>
	);
}
