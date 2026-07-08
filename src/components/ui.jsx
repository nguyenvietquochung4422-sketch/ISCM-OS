import {
  FileText, FileSpreadsheet, FileType, FileCode, Link2, Map as MapIcon, File,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Shared UI primitives — badges, avatars, file-type icons             */
/* ------------------------------------------------------------------ */

const SECURITY_STYLES = {
  Draft: 'bg-gray-100 text-gray-600 border border-gray-200',
  'Internal Open': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Confidential: 'bg-red-50 text-iscm-crimson border border-red-200',
};

export function SecurityBadge({ level }) {
  return <span className={`badge ${SECURITY_STYLES[level] ?? SECURITY_STYLES.Draft}`}>{level}</span>;
}

const STATUS_STYLES = {
  'In Progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  Review: 'bg-amber-50 text-amber-700 border border-amber-200',
  Completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

export function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_STYLES[status] ?? ''}`}>{status}</span>;
}

const ROLE_STYLES = {
  Lead: 'bg-iscm-crimson text-white',
  Manager: 'bg-iscm-charcoal text-white',
  Coordinator: 'bg-amber-100 text-amber-800',
  Host: 'bg-violet-100 text-violet-800',
  Member: 'bg-gray-100 text-gray-600',
};

export function RoleBadge({ role }) {
  return <span className={`badge ${ROLE_STYLES[role] ?? ROLE_STYLES.Member}`}>{role}</span>;
}

/** Circular initials avatar (deterministic tone per name) */
export function Avatar({ name, size = 'md' }) {
  const initials = (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();
  const sizes = { sm: 'h-6 w-6 text-[10px]', md: 'h-8 w-8 text-xs', lg: 'h-10 w-10 text-sm' };
  return (
    <span
      title={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-iscm-charcoal font-barlow font-semibold text-white ${sizes[size]}`}
    >
      {initials}
    </span>
  );
}

/** Icon matched to a digital_assets file_extension */
export function FileIcon({ extension, className = 'h-4 w-4' }) {
  const map = {
    '.docx': [FileText, 'text-blue-600'],
    '.pdf': [FileType, 'text-red-600'],
    '.xlsx': [FileSpreadsheet, 'text-emerald-600'],
    '.pptx': [FileType, 'text-orange-500'],
    '.py': [FileCode, 'text-amber-600'],
    '.ipynb': [FileCode, 'text-orange-600'],
    '.geojson': [MapIcon, 'text-emerald-700'],
    '.shp': [MapIcon, 'text-violet-700'],
    url: [Link2, 'text-blue-500'],
  };
  const [Icon, color] = map[extension] ?? [File, 'text-gray-400'];
  return <Icon className={`${className} ${color}`} />;
}

/** KPI number rendered in Barlow Condensed per the ISCM style guide */
export function KpiNumber({ value, className = '' }) {
  return (
    <span className={`font-barlow-condensed text-5xl font-extrabold leading-none text-iscm-charcoal ${className}`}>
      {value}
    </span>
  );
}
