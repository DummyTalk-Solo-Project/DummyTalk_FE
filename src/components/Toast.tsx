import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import styled, { keyframes } from 'styled-components';

export type ToastType = 'success' | 'error' | 'info';

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// ── Animation ────────────────────────────────────────────────
const slideUp = keyframes`
  from { opacity: 0; transform: translateX(-50%) translateY(16px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
`;

// ── Styled ───────────────────────────────────────────────────
const Wrapper = styled.div<{ $type: ToastType }>`
  position: fixed;
  bottom: var(--dt-space-8);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;

  display: flex;
  align-items: center;
  gap: var(--dt-space-3);

  padding: var(--dt-space-4) var(--dt-space-6);
  max-width: min(var(--dt-content-width), calc(100vw - var(--dt-space-8)));

  background: var(--dt-bg-elevated);
  border: 1px solid
    ${({ $type }) =>
      $type === 'success'
        ? 'rgba(111, 217, 168, 0.30)'
        : $type === 'error'
        ? 'rgba(224, 122, 142, 0.30)'
        : 'var(--dt-stroke-accent)'};
  border-radius: var(--dt-radius-lg);

  box-shadow:
    ${({ $type }) =>
      $type === 'success'
        ? '0 4px 24px rgba(111,217,168,0.12)'
        : $type === 'error'
        ? '0 4px 24px rgba(224,122,142,0.12)'
        : 'var(--dt-glow-soft)'},
    var(--dt-shadow-md);

  animation: ${slideUp} var(--dt-dur-soft) var(--dt-ease-rise) both;
`;

const Icon = styled.span<{ $type: ToastType }>`
  flex-shrink: 0;
  font-size: var(--dt-size-md);
  color: ${({ $type }) =>
    $type === 'success'
      ? 'var(--dt-success)'
      : $type === 'error'
      ? 'var(--dt-danger)'
      : 'var(--dt-accent)'};
`;

const Message = styled.p`
  margin: 0;
  font-family: var(--dt-font-sans);
  font-size: var(--dt-size-sm);
  font-weight: var(--dt-weight-medium);
  line-height: var(--dt-leading-snug);
  color: var(--dt-fg-primary);
  text-align: left;
  white-space: pre-wrap;
  word-break: keep-all;
`;

// ── ToastItem ────────────────────────────────────────────────
const ICON_MAP: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: '◈',
};

const ToastItem: React.FC<{
  message: string;
  type: ToastType;
  onDone: () => void;
}> = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <Wrapper $type={type}>
      <Icon $type={type}>{ICON_MAP[type]}</Icon>
      <Message>{message}</Message>
    </Wrapper>
  );
};

// ── Provider ─────────────────────────────────────────────────
interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      setToast({ message, type, id: Date.now() });
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <ToastItem
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
};
