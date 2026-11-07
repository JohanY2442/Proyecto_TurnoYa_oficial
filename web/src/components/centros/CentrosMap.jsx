import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';

const LIMA = [-12.1211, -77.0297];

function AjustarVista({ puntosKey }) {
  const map = useMap();
  useEffect(() => {
    const puntos = JSON.parse(puntosKey);
    if (puntos.length === 1) map.setView(puntos[0], 15);
    else if (puntos.length > 1) map.fitBounds(puntos, { padding: [40, 40] });
  }, [map, puntosKey]);
  return null;
}

AjustarVista.propTypes = { puntosKey: PropTypes.string.isRequired };

/** Mapa de centros con OpenStreetMap (API externa, sin API key). */
export default function CentrosMap({ centros, ubicacion, height = 360 }) {
  const conCoords = centros.filter((c) => c.latitud != null && c.longitud != null);
  const puntos = conCoords.map((c) => [c.latitud, c.longitud]);
  if (ubicacion) puntos.push([ubicacion.latitud, ubicacion.longitud]);

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-line">
      <MapContainer center={LIMA} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AjustarVista puntosKey={JSON.stringify(puntos)} />
        {conCoords.map((c) => (
          <CircleMarker
            key={c.id}
            center={[c.latitud, c.longitud]}
            radius={10}
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#0B6E5F', fillOpacity: 1 }}
          >
            <Popup>
              <strong>{c.nombre}</strong>
              <br />
              {c.direccion}
              <br />
              <Link to={`/centros/${c.id}`}>Ver centro y reservar</Link>
            </Popup>
          </CircleMarker>
        ))}
        {ubicacion && (
          <CircleMarker
            center={[ubicacion.latitud, ubicacion.longitud]}
            radius={8}
            pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#F2C14E', fillOpacity: 1 }}
          >
            <Popup>Estás aquí</Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}

CentrosMap.propTypes = {
  centros: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number.isRequired, nombre: PropTypes.string, direccion: PropTypes.string, latitud: PropTypes.number, longitud: PropTypes.number }),
  ).isRequired,
  ubicacion: PropTypes.shape({ latitud: PropTypes.number, longitud: PropTypes.number }),
  height: PropTypes.number,
};
