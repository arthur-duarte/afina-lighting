'use client';

export function SymbolIcon({ type, colorHex = '#38bdf8', size = 16 }: { type: string; colorHex?: string; size?: number }) {
  const stroke = colorHex;

  switch (type) {
    case 'ellipsoidal':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 19 21 5 21 12 2" />
          <circle cx="12" cy="14" r="3" fill={stroke} fillOpacity="0.3" />
        </svg>
      );

    case 'fresnel':
    case 'pc':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill={stroke} />
        </svg>
      );

    case 'par64':
    case 'par56':
    case 'par38':
    case 'par_led':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <circle cx="12" cy="12" r="4" fill={stroke} fillOpacity="0.4" />
        </svg>
      );

    case 'moving_spot':
    case 'moving_beam':
    case 'moving_wash':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="7" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );

    case 'bar_led':
    case 'lightingbar':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="8" width="20" height="8" rx="2" fill={stroke} fillOpacity="0.2" />
          <circle cx="6" cy="12" r="1.5" fill={stroke} />
          <circle cx="12" cy="12" r="1.5" fill={stroke} />
          <circle cx="18" cy="12" r="1.5" fill={stroke} />
        </svg>
      );

    case 'truss_q25':
    case 'truss_q30':
    case 'truss_q50':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <line x1="3" y1="5" x2="21" y2="19" />
          <line x1="3" y1="19" x2="21" y2="5" />
        </svg>
      );

    case 'tripod':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="2" x2="12" y2="14" />
          <line x1="12" y1="14" x2="4" y2="22" />
          <line x1="12" y1="14" x2="20" y2="22" />
          <circle cx="12" cy="4" r="2" fill={stroke} />
        </svg>
      );

    case 'tower':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="2" width="12" height="20" rx="1" />
          <line x1="6" y1="2" x2="18" y2="22" />
          <line x1="6" y1="22" x2="18" y2="2" />
        </svg>
      );

    case 'floor_base':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="4" x2="12" y2="16" />
          <line x1="4" y1="20" x2="12" y2="16" />
          <line x1="20" y1="20" x2="12" y2="16" />
          <circle cx="12" cy="4" r="3" fill={stroke} />
        </svg>
      );

    case 'scenery_rect':
    case 'custom_stage':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="12" rx="2" fill={stroke} fillOpacity="0.2" />
        </svg>
      );

    case 'scenery_circle':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" fill={stroke} fillOpacity="0.2" />
        </svg>
      );

    case 'scenery_platform':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="10" rx="1" fill={stroke} fillOpacity="0.2" />
          <line x1="2" y1="7" x2="22" y2="17" />
          <line x1="2" y1="17" x2="22" y2="7" />
        </svg>
      );

    case 'scenery_curtain':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 4c2 2 4 2 6 0s4-2 6 0 4 2 6 0" />
          <line x1="2" y1="4" x2="2" y2="20" />
          <line x1="22" y1="4" x2="22" y2="20" />
        </svg>
      );

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
  }
}
