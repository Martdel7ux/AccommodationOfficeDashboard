import { CheckCircle2, XCircle, Home, Building2, Hotel, DoorOpen } from 'lucide-react';

export function StatusBadge({ status }) {
  if (status === 'available') {
    return (
      <span className="badge-green">
        <CheckCircle2 size={11} />
        Available
      </span>
    );
  }
  return (
    <span className="badge-red">
      <XCircle size={11} />
      Unavailable
    </span>
  );
}

const TYPE_CONFIG = {
  apartment: { label: 'Apartment', cls: 'badge-blue',   icon: Building2 },
  studio:    { label: 'Studio',    cls: 'badge-purple', icon: Hotel },
  house:     { label: 'House',     cls: 'badge-amber',  icon: Home },
  room:      { label: 'Room',      cls: 'badge-gray',   icon: DoorOpen },
};

export function PropertyTypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || { label: type, cls: 'badge-gray', icon: Building2 };
  const Icon = cfg.icon;
  return (
    <span className={cfg.cls}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

const AUDIENCE_CONFIG = {
  'full-time': { label: 'Full-time',    cls: 'badge-blue' },
  'erasmus':   { label: 'Erasmus',      cls: 'badge-purple' },
  'both':      { label: 'All Students', cls: 'badge-green' },
};

export function AudienceBadge({ audience }) {
  const cfg = AUDIENCE_CONFIG[audience] || { label: audience, cls: 'badge-gray' };
  return <span className={cfg.cls}>{cfg.label}</span>;
}
