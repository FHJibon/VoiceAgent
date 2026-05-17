export const getWebSocketUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_WS_URL;
  
  // If we are in the browser, dynamically resolve the WebSocket URL
  if (typeof window !== 'undefined') {
    // If the env variable is specified and is NOT localhost, use it
    if (envUrl && !envUrl.includes('localhost')) {
      return envUrl;
    }
    
    // Otherwise, dynamically construct it based on the current hostname
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    return `${protocol}//${host}:8000/ws`;
  }
  
  // Server-side fallback
  return envUrl || 'ws://localhost:8000/ws';
};

export const getApiUrl = (): string => {
  const wsUrl = getWebSocketUrl();
  return wsUrl.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws', '');
};
