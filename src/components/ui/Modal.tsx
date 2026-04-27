import { X } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const ANIM_DURATION = 160;

interface ModalProps {
  title: string;
  onClose: () => void;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ title, onClose, size = 'md', children, footer }: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, ANIM_DURATION);
  }, [onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleClose]);

  const backdropStyle: React.CSSProperties = {
    animation: isClosing
      ? `backdrop-out ${ANIM_DURATION}ms ease-in forwards`
      : `backdrop-in ${ANIM_DURATION}ms ease-out`,
  };

  const panelStyle: React.CSSProperties = {
    animation: isClosing
      ? `modal-out ${ANIM_DURATION}ms cubic-bezier(0.4, 0, 1, 1) forwards`
      : `modal-in ${ANIM_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`,
  };

  return (
    <>
      <div
        style={backdropStyle}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          style={panelStyle}
          className={[
            'w-full rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh] pointer-events-auto',
            SIZES[size],
          ].join(' ')}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6 flex-1">{children}</div>

          {/* Footer opcional */}
          {footer && (
            <div className="shrink-0 border-t border-gray-100 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
