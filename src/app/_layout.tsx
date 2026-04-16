import '../../global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '../../constants/theme';

import { useFinanceStore } from '../store/useFinanceStore';

export default function RootLayout() {
	const initApp = useFinanceStore((state) => state.initApp);
	const isLoading = useFinanceStore((state) => state.isLoading);

	useEffect(() => {
		void initApp();
	}, [initApp]);

	return (
		<SafeAreaProvider>
			{isLoading ? (
				<SafeAreaView style={{ flex: 1, backgroundColor: AppTheme.colors.bg }}>
					<LinearGradient
						colors={AppTheme.gradients.background}
						style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}
					>
						<View style={{ height: 84, width: 84, borderRadius: 999, backgroundColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#363636' }}>
							<ActivityIndicator size="large" color={AppTheme.colors.accent} />
						</View>
						<Text style={{ marginTop: 18, color: AppTheme.colors.text, fontSize: 18, fontWeight: '800' }}>
							Cargando finanzas...
						</Text>
						<Text style={{ marginTop: 6, color: AppTheme.colors.textMuted, fontSize: 13 }}>
							Preparando tu tablero personalizado
						</Text>
					</LinearGradient>
				</SafeAreaView>
			) : (
				<Stack
					screenOptions={{
						headerBackButtonDisplayMode: 'minimal',
					}}
				>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen
						name="add"
						options={{
							title: 'Nueva transaccion',
							headerStyle: { backgroundColor: AppTheme.colors.bgSoft },
							headerTintColor: AppTheme.colors.text,
							headerTitleStyle: { fontWeight: '800' },
						}}
					/>
					<Stack.Screen
						name="transaction/[id]"
						options={{
							title: 'Detalles',
							headerStyle: { backgroundColor: AppTheme.colors.bgSoft },
							headerTintColor: AppTheme.colors.text,
							headerTitleStyle: { fontWeight: '800' },
						}}
					/>
					<Stack.Screen
						name="settings"
						options={{
							title: 'Ajustes de Datos',
							headerStyle: { backgroundColor: AppTheme.colors.bgSoft },
							headerTintColor: AppTheme.colors.text,
							headerTitleStyle: { fontWeight: '800' },
						}}
					/>
				</Stack>
			)}
		</SafeAreaProvider>
	);
}
