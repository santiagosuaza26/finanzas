import '../global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useFinanceStore } from '../src/store/useFinanceStore';

export default function RootLayout() {
	const initApp = useFinanceStore((state) => state.initApp);
	const isLoading = useFinanceStore((state) => state.isLoading);

	useEffect(() => {
		void initApp();
	}, [initApp]);

	return (
		<SafeAreaProvider>
			{isLoading ? (
				<SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }}>
					<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
						<ActivityIndicator size="large" color="#38bdf8" />
						<Text style={{ marginTop: 14, color: '#cbd5e1', fontSize: 16, fontWeight: '600' }}>
							Cargando finanzas...
						</Text>
					</View>
				</SafeAreaView>
			) : (
				<Stack>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen name="add" options={{ title: 'Nueva transaccion' }} />
					<Stack.Screen name="transaction/[id]" options={{ title: 'Detalles' }} />
				</Stack>
			)}
		</SafeAreaProvider>
	);
}
