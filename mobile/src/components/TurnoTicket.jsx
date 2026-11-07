import PropTypes from 'prop-types';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { EstadoBadge } from './Badges';
import { colors, radius, urgencia } from '../theme/colors';
import { codigoTurno, formatFechaHora, formatMinutos } from '../utils/formatters';
import { PREFIJO_QR } from '../utils/constants';

/** El ticket del turno: código grande, franja de urgencia, posición y QR para el médico. */
export default function TurnoTicket({ turno, posicion, showQr = false }) {
  const franja = turno.nivelUrgencia ? urgencia[turno.nivelUrgencia].color : colors.line;
  return (
    <View style={styles.ticket} accessibilityLabel={`Turno ${codigoTurno(turno.id)}`}>
      <View style={[styles.franja, { backgroundColor: franja }]} />
      <View style={styles.top}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.centro}>{turno.centro}</Text>
            <Text style={styles.especialidad}>{turno.especialidad}</Text>
          </View>
          <EstadoBadge estado={turno.estado} />
        </View>
        <Text style={styles.codigo}>{codigoTurno(turno.id)}</Text>
        <Text style={styles.fecha}>{formatFechaHora(turno.fechaHora)}</Text>
      </View>
      <View style={styles.cutRow}>
        <View style={[styles.notch, { marginLeft: -12 }]} />
        <View style={styles.dashes} />
        <View style={[styles.notch, { marginRight: -12 }]} />
      </View>
      <View style={styles.bottom}>
        {posicion ? (
          <View style={{ flexDirection: 'row', gap: 28 }}>
            <View>
              <Text style={styles.small}>Tu lugar</Text>
              <Text style={styles.big}>{posicion.posicion}°</Text>
            </View>
            <View>
              <Text style={styles.small}>Espera aprox.</Text>
              <Text style={styles.big}>{formatMinutos(posicion.minutosEstimados)}</Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.small, { flex: 1 }]}>{turno.medico ? `Te atiende: ${turno.medico}` : 'Muestra este código en ventanilla.'}</Text>
        )}
        {showQr && (
          <View style={styles.qr}>
            <QRCode value={`${PREFIJO_QR}${turno.id}`} size={72} />
          </View>
        )}
      </View>
    </View>
  );
}

TurnoTicket.propTypes = {
  turno: PropTypes.shape({
    id: PropTypes.number.isRequired,
    centro: PropTypes.string,
    especialidad: PropTypes.string,
    fechaHora: PropTypes.string,
    estado: PropTypes.string.isRequired,
    nivelUrgencia: PropTypes.string,
    medico: PropTypes.string,
  }).isRequired,
  posicion: PropTypes.shape({ posicion: PropTypes.number, minutosEstimados: PropTypes.number }),
  showQr: PropTypes.bool,
};

const styles = StyleSheet.create({
  ticket: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  franja: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 8 },
  top: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  centro: { color: colors.inkSoft, fontSize: 14 },
  especialidad: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  codigo: { color: colors.ink, fontSize: 46, fontWeight: '800', letterSpacing: -1, marginTop: 10 },
  fecha: { color: colors.inkSoft, fontSize: 15 },
  cutRow: { flexDirection: 'row', alignItems: 'center' },
  notch: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  dashes: { flex: 1, borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.line, marginHorizontal: 4 },
  bottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 20, gap: 12 },
  small: { color: colors.inkSoft, fontSize: 13 },
  big: { color: colors.ink, fontSize: 32, fontWeight: '800' },
  qr: { backgroundColor: '#fff', padding: 6, borderRadius: 8 },
});
