import { Download } from 'lucide-react';
import { FileIcon, SecurityBadge, Avatar } from '../ui.jsx';
import { userById } from '../../data/mockData.js';

/* ------------------------------------------------------------------ */
/* Tab 2 — Office Documents (.docx / .xlsx / .pdf) structured table    */
/* ------------------------------------------------------------------ */

const OFFICE_EXTENSIONS = ['.docx', '.xlsx', '.pdf', '.pptx'];

export default function OfficeDocsTab({ assets }) {
  const docs = assets.filter((a) => OFFICE_EXTENSIONS.includes(a.file_extension));

  return (
    <div className="glass-card overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-200 bg-iscm-surface/60 font-barlow-condensed text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            <th className="px-4 py-3">Document</th>
            <th className="hidden px-4 py-3 sm:table-cell">Upload log</th>
            <th className="hidden px-4 py-3 md:table-cell">Version</th>
            <th className="hidden px-4 py-3 md:table-cell">Size</th>
            <th className="px-4 py-3">Security</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {docs.map((doc) => {
            const owner = userById[doc.uploaded_by];
            return (
              <tr key={doc.id} className="hover:bg-iscm-surface/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileIcon extension={doc.file_extension} className="h-5 w-5" />
                    <div>
                      <div className="font-ibm text-sm font-medium text-iscm-charcoal">{doc.asset_name}</div>
                      <div className="font-ibm text-xs text-gray-400">{doc.created_at}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <div className="flex items-center gap-2">
                    <Avatar name={owner?.full_name} size="sm" />
                    <div className="leading-tight">
                      <div className="font-ibm text-sm text-gray-600">{owner?.full_name}</div>
                      <div className="font-ibm text-[11px] text-gray-400">tải lên {doc.created_at}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className="badge border border-gray-200 bg-iscm-surface font-barlow-condensed text-gray-600">
                    v{doc.version ?? 1}
                  </span>
                </td>
                <td className="hidden px-4 py-3 font-barlow-condensed text-sm text-gray-500 md:table-cell">
                  {doc.file_size_kb ? `${(doc.file_size_kb / 1024).toFixed(1)} MB` : '—'}
                </td>
                <td className="px-4 py-3"><SecurityBadge level={doc.security_level} /></td>
                <td className="px-4 py-3 text-right">
                  <a href={doc.storage_url} className="btn-primary !px-3 !py-1.5" download>
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                </td>
              </tr>
            );
          })}
          {docs.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-10 text-center font-ibm text-sm text-gray-400">
              No administrative documents in this project yet.
            </td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
