import { router } from 'expo-router';
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

import { useFinanceStore } from '../src/store/useFinanceStore';

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
		<SafeAreaView style={{ flex: 1, backgroundColor: '#020617' }} edges={['top', 'left', 'right']}>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 36 }}>
					<Text style={{ color: '#f8fafc', fontSize: 24, fontWeight: '800' }}>Nueva transaccion</Text>

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
								backgroundColor: transactionType === 'expense' ? '#f43f5e' : '#334155',
							}}
						>
							<Text style={{ fontWeight: '800', color: '#f8fafc' }}>Egreso</Text>
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
								backgroundColor: transactionType === 'income' ? '#10b981' : '#334155',
							}}
						>
							<Text style={{ fontWeight: '800', color: '#f8fafc' }}>Ingreso</Text>
						</Pressable>
					</View>

					<Text style={{ marginTop: 20, marginBottom: 8, color: '#94a3b8', fontWeight: '700' }}>Monto</Text>
					<TextInput
						value={amount}
						onChangeText={setAmount}
						keyboardType="decimal-pad"
						placeholder="0"
						placeholderTextColor="#64748b"
						style={{
							borderRadius: 14,
							borderWidth: 1,
							borderColor: '#334155',
							backgroundColor: '#0f172a',
							color: '#f8fafc',
							fontSize: 26,
							fontWeight: '800',
							paddingHorizontal: 16,
							paddingVertical: 14,
						}}
					/>

					<Text style={{ marginTop: 20, marginBottom: 8, color: '#94a3b8', fontWeight: '700' }}>Nota</Text>
					<TextInput
						value={note}
						onChangeText={setNote}
						placeholder="Ej: Almuerzo en oficina"
						placeholderTextColor="#64748b"
						style={{
							borderRadius: 14,
							borderWidth: 1,
							borderColor: '#334155',
							backgroundColor: '#0f172a',
							color: '#f8fafc',
							paddingHorizontal: 16,
							paddingVertical: 14,
						}}
					/>

					<Text style={{ marginTop: 20, marginBottom: 8, color: '#94a3b8', fontWeight: '700' }}>Categoria</Text>
					<View style={{ gap: 8 }}>
						{filteredCategories.length === 0 ? (
							<View
								style={{
									borderRadius: 14,
									borderWidth: 1,
									borderColor: '#334155',
									borderStyle: 'dashed',
									paddingVertical: 14,
									paddingHorizontal: 12,
								}}
							>
								<Text style={{ color: '#94a3b8', textAlign: 'center' }}>No hay categorias para este tipo.</Text>
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
											borderColor: isSelected ? '#38bdf8' : '#334155',
											backgroundColor: isSelected ? '#0c4a6e' : '#0f172a',
											paddingHorizontal: 14,
											paddingVertical: 12,
										}}
									>
										<Text style={{ color: '#f8fafc', fontWeight: '700' }}>{category.name}</Text>
										<Text style={{ color: '#94a3b8', marginTop: 2, fontSize: 12, textTransform: 'uppercase' }}>
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
							backgroundColor: canSave && !isSaving ? '#38bdf8' : '#334155',
							alignItems: 'center',
							paddingVertical: 14,
						}}
					>
						<Text style={{ color: '#082f49', fontWeight: '900', fontSize: 16 }}>
							{isSaving ? 'Guardando...' : 'Guardar'}
						</Text>
					</Pressable>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
