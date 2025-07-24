import { useState } from 'react';

export function useSessionId(): string {
  const [sessionId] = useState(() => {
    // Generate a simple session ID based on timestamp and random number
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  });

  return sessionId;
}
