import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop — deep blur over the glass UI */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(15,10,20,0.38)',
          backdropFilter: 'blur(12px) saturate(160%)',
          WebkitBackdropFilter: 'blur(12px) saturate(160%)',
        }}
        onClick={onClose}
      />

      {/* Modal panel — liquid glass */}
      <div
        className={`relative w-full ${sizes[size]} animate-slide-up overflow-hidden`}
        style={{
          borderRadius: 24,
          background: 'linear-gradient(170deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.60) 100%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          border: '1px solid rgba(255,255,255,0.55)',
          borderTopColor: 'rgba(255,255,255,0.95)',
          boxShadow: [
            '0 24px 80px rgba(0,0,0,0.20)',
            '0 8px 24px rgba(0,0,0,0.10)',
            'inset 0 1px 0 rgba(255,255,255,0.98)',
            'inset 0 -1px 0 rgba(255,255,255,0.15)',
          ].join(', '),
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.40)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 100%)',
          }}
        >
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '99px',
              background: 'rgba(255,255,255,0.50)',
              border: '1px solid rgba(255,255,255,0.70)',
              borderTopColor: 'rgba(255,255,255,0.90)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.80)',
              color: '#94a3b8',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.80)';
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.50)';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
