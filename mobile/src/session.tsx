import { createContext, useContext } from 'react';

export interface Session {
  token: string;
  signOut: () => void;
}

export const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession used outside a signed-in screen');
  return session;
}
