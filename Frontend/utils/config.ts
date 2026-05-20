export const getWebSocketUrl = (): string => {
  return process.env.NEXT_PUBLIC_WS_URL ?? '';
};

export const getApiUrl = (): string => {
  const wsUrl = getWebSocketUrl();
  if (!wsUrl) return '';
  return wsUrl.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws', '');
};