import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '../../constants/theme';

import { useFinanceStore } from '../store/useFinanceStore';

type TransactionType = 'income' | 'expense';

export default function AddTransactionScreen() {
	const categories = useFinanceStore((state) => state.categories);
	const addNewTransaction = useFinanceStore((state) => state.addNewTransaction);

	const [transactionType, setTransactionType] = useState<TransactionType>('expense');
	const [amount, setAmount] = useState('');
	const [note, setNote] = useState('');
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const filteredCategories = useMemo(
		() => categories.filter((item) => item.type === transactionType),
		[categories, transactionType]
	);

	const canSave = useMemo(() => {
		const numericAmount = Number(amount);
		return Number.isFinite(numericAmount) && numericAmount > 0 && selectedCategoryId !== null;
	}, [amount, selectedCategoryId]);

	async function onSave() {
		if (!canSave || selectedCategoryId === null) {
			Alert.alert('Datos incompletos', 'Completa el monto y selecciona una categoria.');
			return;
		}

		setIsSaving(true);

		try {
			await addNewTransaction(
				Number(amount),
				Date.now(),
				note.trim() ? note.trim() : null,
				selectedCategoryId
			);
			router.replace('/');
		} catch {
			Alert.alert('Error', 'No se pudo guardar la transaccion.');
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: AppTheme.colors.bg }} edges={['top', 'left', 'right']}>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
				<LinearGradient colors={AppTheme.gradients.background} style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 36 }}>
						<Text style={{ color: AppTheme.colors.text, fontSize: 24, fontWeight: '900' }}>Nueva transaccion</Text>
						<Text style={{ marginTop: 4, color: AppTheme.colors.textMuted }}>Registra un movimiento con estilo profesional</Text>

						<View style={{ marginTop: 18, flexDirection: 'row', gap: 10 }}>
						<Pressable
							onPress={() => {
								setTransactionType('expense');
								setSelectedCategoryId(null);
							}}
							style={{
								flex: 1,
								borderRadius: 12,
								paddingVertical: 12,
								alignItems: 'center',
								backgroundColor: transactionType === 'expense' ? AppTheme.colors.accent : AppTheme.colors.cardAlt,
								borderWidth: 1,
								borderColor: AppTheme.colors.border,
							}}
						>
							<Text style={{ fontWeight: '900', color: '#fff1f2' }}>Egreso</Text>
						</Pressable>

						<Pressable
							onPress={() => {
								setTransactionType('income');
								setSelectedCategoryId(null);
							}}
							style={{
								flex: 1,
								borderRadius: 12,
								paddingVertical: 12,
								alignItems: 'center',
								backgroundColor: transactionType === 'income' ? '#ef4444' : AppTheme.colors.cardAlt,
								borderWidth: 1,
								borderColor: AppTheme.colors.border,
							}}
						>
							<Text style={{ fontWeight: '900', color: '#fff1f2' }}>Ingreso</Text>
						</Pressable>
					</View>

					<Text style={{ marginTop: 20, marginBottom: 8, color: AppTheme.colors.textMuted, fontWeight: '700' }}>Monto</Text>
					<TextInput
						value={amount}
						onChangeText={setAmount}
						keyboardType="decimal-pad"
						placeholder="0"
						placeholderTextColor="#64748b"
						style={{
							borderRadius: 14,
							borderWidth: 1,
							borderColor: AppTheme.colors.border,
							backgroundColor: AppTheme.colors.card,
							color: AppTheme.colors.text,
							fontSize: 26,
							fontWeight: '800',
							paddingHorizontal: 16,
							paddingVertical: 14,
						}}
					/>

					<Text style={{ marginTop: 20, marginBottom: 8, color: AppTheme.colors.textMuted, fontWeight: '700' }}>Nota</Text>
					<TextInput
						value={note}
						onChangeText={setNote}
						placeholder="Ej: Almuerzo en oficina"
						placeholderTextColor="#64748b"
						style={{
							borderRadius: 14,
							borderWidth: 1,
							borderColor: AppTheme.colors.border,
							backgroundColor: AppTheme.colors.card,
							color: AppTheme.colors.text,
							paddingHorizontal: 16,
							paddingVertical: 14,
						}}
					/>

					<Text style={{ marginTop: 20, marginBottom: 8, color: AppTheme.colors.textMuted, fontWeight: '700' }}>Categoria</Text>
					<View style={{ gap: 8 }}>
						{filteredCategories.length === 0 ? (
							<View
								style={{
									borderRadius: 14,
									borderWidth: 1,
									borderColor: AppTheme.colors.border,
									borderStyle: 'dashed',
									paddingVertical: 14,
									paddingHorizontal: 12,
									backgroundColor: AppTheme.colors.card,
								}}
							>
								<Text style={{ color: AppTheme.colors.textMuted, textAlign: 'center' }}>No hay categorias para este tipo.</Text>
							</View>
						) : (
							filteredCategories.map((category) => {
								const isSelected = selectedCategoryId === category.id;
								return (
									<Pressable
										key={category.id}
										onPress={() => setSelectedCategoryId(category.id)}
										style={{
											borderRadius: 12,
											borderWidth: 1,
											borderColor: isSelected ? AppTheme.colors.accent : AppTheme.colors.border,
											backgroundColor: isSelected ? '#3f0c13' : AppTheme.colors.card,
											paddingHorizontal: 14,
											paddingVertical: 12,
										}}
									>
										<Text style={{ color: AppTheme.colors.text, fontWeight: '800' }}>{category.name}</Text>
										<Text style={{ color: AppTheme.colors.textMuted, marginTop: 2, fontSize: 12, textTransform: 'uppercase' }}>
											{category.type}
										</Text>
									</Pressable>
								);
							})
						)}
					</View>

					<Pressable
						onPress={onSave}
						disabled={!canSave || isSaving}
						style={{
							marginTop: 24,
							borderRadius: 14,
							backgroundColor: canSave && !isSaving ? AppTheme.colors.accent : AppTheme.colors.cardAlt,
							alignItems: 'center',
							paddingVertical: 14,
						}}
					>
						<Text style={{ color: '#fff1f2', fontWeight: '900', fontSize: 16 }}>
							{isSaving ? 'Guardando...' : 'Guardar'}
						</Text>
					</Pressable>
					</ScrollView>
				</LinearGradient>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
