import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { fetchMyAccess, type EffectiveAccess } from '../services/api/accessApi';
import { useAuth } from './AuthContext';

interface AccessContextType {
  access: EffectiveAccess | null;
  isLoading: boolean;
  /** Check if module is enabled for current user */
  hasModule: (moduleKey: string) => boolean;
  /** Check if capability is allowed for current user */
  hasCap: (capKey: string) => boolean;
  /** Reload access from server */
  reload: () => Promise<void>;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [access, setAccess] = useState<EffectiveAccess | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadAccess = useCallback(async () => {
    if (!isAuthenticated) {
      setAccess(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchMyAccess();
      setAccess(data);
    } catch {
      // If access platform not yet set up, fallback — allow everything
      setAccess(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadAccess();
  }, [loadAccess, user?.id]);

  const hasModule = useCallback((moduleKey: string) => {
    if (!access) return true; // Graceful: no access data = allow all (backward compat)
    return access.modules[moduleKey] !== false;
  }, [access]);

  const hasCap = useCallback((capKey: string) => {
    if (!access) return true;
    const cap = access.capabilities[capKey];
    if (!cap) return true; // Not defined = allow
    return cap.effect === 'allow';
  }, [access]);

  return (
    <AccessContext.Provider value={{ access, isLoading, hasModule, hasCap, reload: loadAccess }}>
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error('useAccess must be used within AccessProvider');
  return ctx;
}
