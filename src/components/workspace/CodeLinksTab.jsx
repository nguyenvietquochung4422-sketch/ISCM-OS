import { ExternalLink, Download, Github, Figma, Presentation } from 'lucide-react';
import { FileIcon, SecurityBadge } from '../ui.jsx';
import { userById } from '../../data/mockData.js';

/* ------------------------------------------------------------------ */
/* Tab 3 — Code & Technical Links (.py/.ipynb + GitHub/Figma/Miro)     */
/* ------------------------------------------------------------------ */

function linkBrandIcon(url = '') {
  if (url.includes('github')) return Github;
  if (url.includes('figma')) return Figma;
  if (url.includes('miro')) return Presentation;
  return ExternalLink;
}

function AssetRow({ asset }) {
  const owner = userById[asset.uploaded_by];
  const isLink = asset.file_extension === 'url';
  const BrandIcon = linkBrandIcon(asset.storage_url);

  return (
    <li className="glass-card glass-card-hover flex items-center gap-3 p-4">
      {isLink
        ? <BrandIcon className="h-6 w-6 shrink-0 text-iscm-charcoal" />
        : <FileIcon extension={asset.file_extension} className="h-6 w-6 shrink-0" />}
      <div className="min-w-0 flex-1">
        <div className="truncate font-ibm text-sm font-medium text-iscm-charcoal">{asset.asset_name}</div>
        <div className="truncate font-ibm text-xs text-gray-400">
          {isLink ? asset.storage_url : `${asset.file_extension} · ${owner?.full_name} · ${asset.created_at}`}
        </div>
      </div>
      <SecurityBadge level={asset.security_level} />
      <a
        href={asset.storage_url}
        target={isLink ? '_blank' : undefined}
        rel="noreferrer"
        className="rounded-lg border border-gray-200 p-2 text-iscm-charcoal transition-colors hover:border-iscm-crimson hover:text-iscm-crimson"
        title={isLink ? 'Open external link' : 'Download file'}
      >
        {isLink ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      </a>
    </li>
  );
}

export default function CodeLinksTab({ assets }) {
  const scripts = assets.filter((a) => a.asset_type === 'Source Code');
  const links = assets.filter((a) => a.asset_type === 'Hyperlink');

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <h3 className="mb-3 font-barlow text-sm font-bold uppercase tracking-wide text-iscm-charcoal">
          Scripts &amp; Notebooks
        </h3>
        <ul className="space-y-3">
          {scripts.map((a) => <AssetRow key={a.id} asset={a} />)}
          {scripts.length === 0 && <li className="font-ibm text-sm text-gray-400">No scripts uploaded.</li>}
        </ul>
      </section>
      <section>
        <h3 className="mb-3 font-barlow text-sm font-bold uppercase tracking-wide text-iscm-charcoal">
          External Boards &amp; Repositories
        </h3>
        <ul className="space-y-3">
          {links.map((a) => <AssetRow key={a.id} asset={a} />)}
          {links.length === 0 && <li className="font-ibm text-sm text-gray-400">No external links registered.</li>}
        </ul>
      </section>
    </div>
  );
}
