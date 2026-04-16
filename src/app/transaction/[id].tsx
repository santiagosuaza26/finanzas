import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
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

import { AppTheme } from '../../../constants/theme';

import { useFinanceStore } from '../../store/useFinanceStore';

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

export default function TransactionDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const transactions = useFinanceStore((state) => state.transactions);
	const categories = useFinanceStore((state) => state.categories);
	const updateExistingTransaction = useFinanceStore((state) => state.updateExistingTransaction);
	const deleteExistingTransaction = useFinanceStore((state) => state.deleteExistingTransaction);

	const transaction = useMemo(() => transactions.find((item) => item.id === Number(id)), [transactions, id]);

	const [isEditing, setIsEditing] = useState(false);
	const [amount, setAmount] = useState('');
	const [note, setNote] = useState('');
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (transaction) {
			setAmount(String(transaction.amount));
			setNote(transaction.note || '');
			setSelectedCategoryId(transaction.category_id);
		}
	}, [transaction]);

	const filteredCategories = useMemo(() => {
		if (!transaction) {
			return [];
		}
		return categories.filter((item) => item.type === transaction.category_type);
	}, [categories, transaction]);

	const canSave = useMemo(() => {
		const numericAmount = Number(amount);
		return Number.isFinite(numericAmount) && numericAmount > 0 && selectedCategoryId !== null;
	}, [amount, selectedCategoryId]);

	if (!transaction) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: AppTheme.colors.bg }} edges={['top', 'left', 'right']}>
				<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
					<Text style={{ color: AppTheme.colors.text, fontSize: 16 }}>Transaccion no encontrada</Text>
					<Pressable
						onPress={() => router.replace('/')}
						style={{ marginTop: 16, backgroundColor: AppTheme.colors.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}
					>
						<Text style={{ color: '#fff1f2', fontWeight: '800' }}>Volver</Text>
					</Pressable>
				</View>
			</SafeAreaView>
		);
	}

	const currentTransaction = transaction;

	async function onSave() {
		if (!canSave || selectedCategoryId === null) {
			Alert.alert('Datos incompletos', 'Completa el monto y selecciona una categoria.');
			return;
		}

		setIsSaving(true);

		try {
			await updateExistingTransaction(
				currentTransaction.id,
				Number(amount),
				currentTransaction.date,
				note.trim() || null,
				selectedCategoryId
			);
			setIsEditing(false);
			Alert.alert('Exito', 'Transaccion actualizada.');
		} catch {
			Alert.alert('Error', 'No se pudo actualizar la transaccion.');
		} finally {
			setIsSaving(false);
		}
	}

	function onDelete() {
		Alert.alert('Confirmar borrado', 'Deseas eliminar esta transaccion?', [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Borrar',
				style: 'destructive',
				onPress: async () => {
					try {
						await deleteExistingTransaction(currentTransaction.id);
						router.replace('/');
					} catch {
						Alert.alert('Error', 'No se pudo borrar la transaccion.');
					}
				},
			},
		]);
	}

	const isIncome = currentTransaction.category_type === 'income';

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: AppTheme.colors.bg }} edges={['top', 'left', 'right']}>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
				<LinearGradient colors={AppTheme.gradients.background} style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 34 }}>
					{!isEditing ? (
						<>
							<LinearGradient
								colors={AppTheme.gradients.card}
								style={{
									borderRadius: 16,
									borderWidth: 1,
									borderColor: AppTheme.colors.border,
									padding: 18,
								}}
							>
								<Text style={{ color: AppTheme.colors.textMuted, textTransform: 'uppercase', fontSize: 12 }}>Categoria</Text>
								<Text style={{ marginTop: 6, color: AppTheme.colors.text, fontSize: 24, fontWeight: '800' }}>
									{transaction.category_name}
								</Text>

								<Text style={{ marginTop: 14, color: AppTheme.colors.textMuted, textTransform: 'uppercase', fontSize: 12 }}>
									Monto
								</Text>
								<Text
									style={{
										marginTop: 8,
										color: isIncome ? '#fda4af' : AppTheme.colors.accent,
										fontSize: 36,
										fontWeight: '900',
									}}
								>
									{isIncome ? '+' : '-'}{currencyFormatter.format(currentTransaction.amount)}
								</Text>

								<Text style={{ marginTop: 14, color: AppTheme.colors.textMuted, textTransform: 'uppercase', fontSize: 12 }}>Nota</Text>
								<Text style={{ marginTop: 6, color: '#e5e5e5', fontSize: 15 }}>{currentTransaction.note || 'Sin nota'}</Text>

								<Text style={{ marginTop: 14, color: AppTheme.colors.textMuted, textTransform: 'uppercase', fontSize: 12 }}>
									Fecha
								</Text>
								<Text style={{ marginTop: 6, color: '#e5e5e5', fontSize: 15 }}>{formatDate(currentTransaction.date)}</Text>
							</LinearGradient>

							<Pressable
								onPress={() => setIsEditing(true)}
								style={{ marginTop: 16, backgroundColor: AppTheme.colors.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center' }}
							>
								<Text style={{ color: '#fff1f2', fontWeight: '900' }}>Editar</Text>
							</Pressable>

							<Pressable
								onPress={onDelete}
								style={{ marginTop: 10, backgroundColor: '#991b1b', borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#7f1d1d' }}
							>
								<Text style={{ color: '#fff1f2', fontWeight: '900' }}>Borrar</Text>
							</Pressable>
						</>
					) : (
						<>
							<Text style={{ marginBottom: 8, color: AppTheme.colors.textMuted, fontWeight: '700' }}>Monto</Text>
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
									fontSize: 25,
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
								{filteredCategories.map((category) => {
									const isSelected = category.id === selectedCategoryId;
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
											<Text style={{ marginTop: 2, color: AppTheme.colors.textMuted, fontSize: 12, textTransform: 'uppercase' }}>
												{category.type}
											</Text>
										</Pressable>
									);
								})}
							</View>

							<View style={{ marginTop: 22, flexDirection: 'row', gap: 10 }}>
								<Pressable
									onPress={() => setIsEditing(false)}
									style={{
										flex: 1,
										borderRadius: 12,
										backgroundColor: AppTheme.colors.cardAlt,
										alignItems: 'center',
										paddingVertical: 13,
									}}
								>
									<Text style={{ color: '#f5f5f5', fontWeight: '800' }}>Cancelar</Text>
								</Pressable>

								<Pressable
									onPress={onSave}
									disabled={!canSave || isSaving}
									style={{
										flex: 1,
										borderRadius: 12,
										backgroundColor: canSave && !isSaving ? AppTheme.colors.accent : AppTheme.colors.cardAlt,
										alignItems: 'center',
										paddingVertical: 13,
									}}
								>
									<Text style={{ color: '#fff1f2', fontWeight: '800' }}>{isSaving ? 'Guardando...' : 'Guardar'}</Text>
								</Pressable>
							</View>
						</>
					)}
					</ScrollView>
				</LinearGradient>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
