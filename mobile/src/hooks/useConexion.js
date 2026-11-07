import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/** true cuando el celular no tiene internet. */
export function useSinConexion() {
  const [sinConexion, setSinConexion] = useState(false);
  useEffect(
    () =>
      NetInfo.addEventListener((estado) => {
        setSinConexion(estado.isConnected === false || estado.isInternetReachable === false);
      }),
    [],
  );
  return sinConexion;
}
