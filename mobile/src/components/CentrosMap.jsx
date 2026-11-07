import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors, radius } from '../theme/colors';

const LIMA = { latitude: -12.1211, longitude: -77.0297, latitudeDelta: 0.08, longitudeDelta: 0.08 };

/** Mapa nativo con los centros (Google Maps en Android, Apple Maps en iOS). */
export default function CentrosMap({ centros, ubicacion, onSelect, height = 260 }) {
  const region = ubicacion
    ? { latitude: ubicacion.latitud, longitude: ubicacion.longitud, latitudeDelta: 0.06, longitudeDelta: 0.06 }
    : LIMA;
  return (
    <View style={[styles.wrap, { height }]}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={region} showsUserLocation={!!ubicacion}>
        {centros
          .filter((c) => c.latitud != null && c.longitud != null)
          .map((c) => (
            <Marker
              key={c.id}
              coordinate={{ latitude: c.latitud, longitude: c.longitud }}
              title={c.nombre}
              description={c.direccion}
              pinColor={colors.brand}
              onCalloutPress={() => onSelect?.(c)}
            />
          ))}
      </MapView>
    </View>
  );
}

CentrosMap.propTypes = {
  centros: PropTypes.array.isRequired,
  ubicacion: PropTypes.shape({ latitud: PropTypes.number, longitud: PropTypes.number }),
  onSelect: PropTypes.func,
  height: PropTypes.number,
};

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.line },
});
