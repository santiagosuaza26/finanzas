import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTheme } from '../src/constants/theme';

import { importDatabaseFromJson, exportDatabaseToJson } from '../src/services/backupService';
import { useFinanceStore } from '../src/store/useFinanceStore';

export default function SettingsScreen() {
  const initApp = useFinanceStore((state) => state.initApp);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  async function onExportBackup() {
    setIsExporting(true);

    try {
      const result = await exportDatabaseToJson();

      if (result.shared) {
        Alert.alert('Respaldo exportado', 'La copia de seguridad se genero y se abrio el menu para compartir.');
      } else {
        Alert.alert(
          'Respaldo guardado',
          `La copia se creo correctamente, pero este dispositivo no permite abrir el menu de compartir.\n\nArchivo: ${result.fileUri}`
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo exportar la copia de seguridad.';
      Alert.alert('Error al exportar', message);
    } finally {
      setIsExporting(false);
    }
  }

  async function onImportBackup() {
    setIsImporting(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const selectedFile = result.assets[0];
      await importDatabaseFromJson(selectedFile.uri);
      await initApp();

      Alert.alert('Respaldo restaurado', 'La base de datos se restauro correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo restaurar la copia de seguridad.';
      Alert.alert('Error al restaurar', message);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppTheme.colors.bg }} edges={['top', 'left', 'right']}>
      <LinearGradient colors={AppTheme.gradients.background} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28 }}>
          <LinearGradient colors={AppTheme.gradients.card} style={{ borderRadius: 24, borderWidth: 1, borderColor: AppTheme.colors.border, paddingHorizontal: 20, paddingVertical: 20 }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: AppTheme.colors.text }}>Ajustes de Datos</Text>
            <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 20, color: AppTheme.colors.textMuted }}>
            Protege tu informacion con respaldos JSON y recuperala en segundos cuando lo necesites.
            </Text>
          </LinearGradient>

          <LinearGradient colors={AppTheme.gradients.card} style={{ marginTop: 16, borderRadius: 24, borderWidth: 1, borderColor: AppTheme.colors.border, paddingHorizontal: 20, paddingVertical: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20 }}>⬆️</Text>
              <Text style={{ marginLeft: 8, fontSize: 19, fontWeight: '900', color: AppTheme.colors.text }}>Exportar Respaldo</Text>
            </View>
            <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 20, color: AppTheme.colors.textMuted }}>
            Genera un archivo JSON con todas tus categorias y transacciones para compartirlo con Drive, correo o donde prefieras.
            </Text>

            <Pressable
              onPress={() => {
                void onExportBackup();
              }}
              disabled={isExporting || isImporting}
              style={{
                marginTop: 14,
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingVertical: 14,
                backgroundColor: isExporting || isImporting ? AppTheme.colors.cardAlt : AppTheme.colors.accent,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '900',
                  color: isExporting || isImporting ? AppTheme.colors.textMuted : '#fff1f2',
                }}
              >
                {isExporting ? 'Exportando copia...' : 'Exportar Copia de Seguridad'}
              </Text>
            </Pressable>
          </LinearGradient>

          <LinearGradient colors={AppTheme.gradients.card} style={{ marginTop: 14, borderRadius: 24, borderWidth: 1, borderColor: AppTheme.colors.border, paddingHorizontal: 20, paddingVertical: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20 }}>⬇️</Text>
              <Text style={{ marginLeft: 8, fontSize: 19, fontWeight: '900', color: AppTheme.colors.text }}>Restaurar Respaldo</Text>
            </View>
            <Text style={{ marginTop: 8, fontSize: 13, lineHeight: 20, color: AppTheme.colors.textMuted }}>
            Selecciona un archivo JSON para reemplazar la informacion actual de tu app por el contenido del respaldo.
            </Text>

            <View style={{ marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: '#6b1d1d', backgroundColor: '#2a1111', paddingHorizontal: 12, paddingVertical: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', lineHeight: 18, color: '#fca5a5' }}>
                Importante: la restauracion reemplaza los datos actuales.
              </Text>
            </View>

            <Pressable
              onPress={() => {
                void onImportBackup();
              }}
              disabled={isExporting || isImporting}
              style={{
                marginTop: 14,
                borderRadius: 16,
                paddingHorizontal: 20,
                paddingVertical: 14,
                backgroundColor: isExporting || isImporting ? AppTheme.colors.cardAlt : '#7f1d1d',
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  fontWeight: '900',
                  color: isExporting || isImporting ? AppTheme.colors.textMuted : '#fff1f2',
                }}
              >
                {isImporting ? 'Restaurando copia...' : 'Restaurar Copia de Seguridad'}
              </Text>
            </Pressable>
          </LinearGradient>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
