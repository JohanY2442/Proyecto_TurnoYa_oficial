import { useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import Card from '../../components/Card';
import { colors, radius } from '../../theme/colors';
import { PREFIJO_QR } from '../../utils/constants';

/**
 * El médico escanea el QR del ticket del paciente para abrir su turno y
 * atenderlo. Si no hay cámara o no hay permiso, puede escribir el código.
 */
export default function EscanearScreen() {
  const router = useRouter();
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [activa, setActiva] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState(null);
  const procesando = useRef(false);

  // Solo una cámara puede estar activa: se apaga al salir de la pestaña.
  useFocusEffect(
    useCallback(() => {
      setActiva(true);
      procesando.current = false;
      return () => setActiva(false);
    }, []),
  );

  const abrirTurno = (id) => {
    procesando.current = true;
    setError(null);
    router.push(`/turno/${id}`);
  };

  const alEscanear = ({ data }) => {
    if (procesando.current) return;
    if (!data?.startsWith(PREFIJO_QR)) {
      setError('Este QR no es de un turno de TurnoYa.');
      return;
    }
    abrirTurno(data.slice(PREFIJO_QR.length));
  };

  const abrirManual = () => {
    const id = codigo.replace(/\D/g, '');
    if (!id) {
      setError('Escribe el código del ticket, por ejemplo T-00012.');
      return;
    }
    abrirTurno(String(Number(id)));
  };

  const camaraDisponible = Platform.OS !== 'web';

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      {!camaraDisponible ? null : !permiso ? (
        <View style={styles.camara} />
      ) : !permiso.granted ? (
        <Card style={{ gap: 10 }}>
          <Text style={styles.title}>Activa la cámara para escanear</Text>
          <Text style={styles.text}>La usamos solo para leer el QR del ticket del paciente.</Text>
          {permiso.canAskAgain ? (
            <Button title="Permitir cámara" icon="camera-outline" onPress={pedirPermiso} />
          ) : (
            <Text style={styles.text}>Diste permiso negado antes. Actívalo en Ajustes, o escribe el código abajo.</Text>
          )}
        </Card>
      ) : (
        <View style={styles.camara}>
          {activa && (
            <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={alEscanear} />
          )}
          <View style={styles.marco} pointerEvents="none" />
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Card style={{ gap: 12 }}>
        <TextField label="O escribe el código del ticket" value={codigo} onChangeText={setCodigo} placeholder="T-00012" autoCapitalize="characters" />
        <Button title="Abrir turno" variant="outline" onPress={abrirManual} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  camara: { height: 320, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  marco: { width: 210, height: 210, borderWidth: 3, borderColor: colors.sun, borderRadius: 20 },
  title: { fontSize: 18, fontWeight: '800', color: colors.ink },
  text: { color: colors.inkSoft, fontSize: 15 },
  error: { color: colors.danger, fontWeight: '700' },
});
