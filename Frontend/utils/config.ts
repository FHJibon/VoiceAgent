export const getWebSocketUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const queryBackend = urlParams.get('backend');
    if (queryBackend) {
      let formattedUrl = queryBackend;
      if (!formattedUrl.startsWith('ws://') && !formattedUrl.startsWith('wss://')) {
        if (formattedUrl.startsWith('http://')) {
          formattedUrl = formattedUrl.replace('http://', 'ws://');
        } else if (formattedUrl.startsWith('https://')) {
          formattedUrl = formattedUrl.replace('https://', 'wss://');
        } else {
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          formattedUrl = `${protocol}//${formattedUrl}`;
        }
      }
      if (!formattedUrl.endsWith('/ws')) {
        formattedUrl = formattedUrl.endsWith('/') ? `${formattedUrl}ws` : `${formattedUrl}/ws`;
      }

      try {
        localStorage.setItem('NEXT_PUBLIC_WS_URL', formattedUrl);
        console.log('Backend URL overridden via query param:', formattedUrl);
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
      return formattedUrl;
    }
    try {
      const storedUrl = localStorage.getItem('NEXT_PUBLIC_WS_URL');
      if (storedUrl) {
        return storedUrl;
      }
    } catch (e) { }
    // Always use the env var if explicitly set (even if it points to localhost for local dev)
    if (envUrl) {
      return envUrl;
    }
    // Fallback: auto-detect from current page's hostname
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const isIpOrLocalhost = host === 'localhost' || host === '127.0.0.1';
    if (isIpOrLocalhost) {
      return `${protocol}//${host}:8000/ws`;
    }
    return `${protocol}//${host}:8000/ws`;
  }
  return envUrl || 'ws://localhost:8000/ws';
};

export const getApiUrl = (): string => {
  const wsUrl = getWebSocketUrl();
  return wsUrl.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws', '');
};