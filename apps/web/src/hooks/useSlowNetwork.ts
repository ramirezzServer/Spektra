import { useEffect, useState } from 'react';

type NetworkConnection = EventTarget & {
  effectiveType?: string;
  saveData?: boolean;
};

function getConnection(): NetworkConnection | undefined {
  if (typeof navigator === 'undefined') return undefined;
  return (navigator as Navigator & { connection?: NetworkConnection; mozConnection?: NetworkConnection; webkitConnection?: NetworkConnection }).connection
    ?? (navigator as Navigator & { mozConnection?: NetworkConnection }).mozConnection
    ?? (navigator as Navigator & { webkitConnection?: NetworkConnection }).webkitConnection;
}

function getSlowNetworkState() {
  const connection = getConnection();
  const effectiveType = connection?.effectiveType;
  const saveData = Boolean(connection?.saveData);

  return {
    effectiveType,
    saveData,
    isSlowNetwork: saveData || effectiveType === 'slow-2g' || effectiveType === '2g',
  };
}

export function useSlowNetwork() {
  const [state, setState] = useState(getSlowNetworkState);

  useEffect(() => {
    const connection = getConnection();
    if (!connection) return;

    function updateState() {
      setState(getSlowNetworkState());
    }

    connection.addEventListener('change', updateState);
    updateState();

    return () => connection.removeEventListener('change', updateState);
  }, []);

  return state;
}
