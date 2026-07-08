import { Landmark, Factory, GraduationCap, ExternalLink, Figma, Presentation, Github } from 'lucide-react';
import { partners as allPartners } from '../../data/mockData.js';
import { SecurityBadge } from '../ui.jsx';

/* ------------------------------------------------------------------ */
/* Tab 3 — Đối tác & Liên kết (CRM Gien)                               */
/* Project partner directory (Academia / Industry / Authority)         */
/* + hyperlinked shortcuts to external Miro/Figma workboards           */
/* ------------------------------------------------------------------ */

const TYPE_META = {
  Authority: { icon: Landmark, badge: 'bg-red-50 text-iscm-crimson border border-red-200', label: 'Authority' },
  Industry: { icon: Factory, badge: 'bg-blue-50 text-blue-700 border border-blue-200', label: 'Industry' },
  Academia: { icon: GraduationCap, badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Academia' },
};

function boardIcon(url = '') {
  if (url.includes('figma')) return Figma;
  if (url.includes('miro')) return Presentation;
  if (url.includes('github')) return Github;
  return ExternalLink;
}

export default function PartnersTab({ projectId, assets }) {
  const partners = allPartners.filter((p) => p.project_id === projectId);
  const workboards = assets.filter((a) => a.asset_type === 'Hyperlink');

  return (
    <div className="space-y-5">
      {/* CRM sheet — stakeholder directory */}
      <div className="glass-card overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="font-barlow text-base font-bold text-iscm-charcoal">Danh bạ Đối tác Dự án</h3>
          <p className="font-ibm text-xs text-gray-500">
            Mạng lưới liên kết đa tầng — Chính quyền · Doanh nghiệp · Học thuật
          </p>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-iscm-surface/60 font-barlow-condensed text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
              <th className="px-5 py-3">Đối tác</th>
              <th className="hidden px-4 py-3 sm:table-cell">Phân tầng</th>
              <th className="hidden px-4 py-3 md:table-cell">Đầu mối liên hệ</th>
              <th className="hidden px-4 py-3 lg:table-cell">Ghi chú hợp tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {partners.map((p) => {
              const meta = TYPE_META[p.partner_type] ?? TYPE_META.Academia;
              const Icon = meta.icon;
              return (
                <tr key={p.id} className="hover:bg-iscm-surface/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-iscm-crimson/10">
                        <Icon className="h-4.5 w-4.5 text-iscm-crimson" />
                      </span>
                      <span className="font-ibm text-sm font-medium text-iscm-charcoal">{p.partner_name}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className={`badge ${meta.badge}`}>{meta.label}</span>
                  </td>
                  <td className="hidden px-4 py-3 font-ibm text-sm text-gray-600 md:table-cell">{p.contact_person}</td>
                  <td className="hidden px-4 py-3 font-ibm text-xs text-gray-500 lg:table-cell">{p.details}</td>
                </tr>
              );
            })}
            {partners.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center font-ibm text-sm text-gray-400">
                  Chưa có đối tác nào trong không gian này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* External workboard shortcuts (Miro / Figma / GitHub) */}
      <div>
        <h3 className="mb-3 font-barlow text-sm font-bold uppercase tracking-wide text-iscm-charcoal">
          Bảng làm việc liên kết ngoài
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {workboards.map((a) => {
            const Icon = boardIcon(a.storage_url);
            return (
              <a
                key={a.id}
                href={a.storage_url}
                target="_blank"
                rel="noreferrer"
                className="glass-card glass-card-hover flex items-center gap-3 p-4"
              >
                <Icon className="h-6 w-6 shrink-0 text-iscm-charcoal" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-ibm text-sm font-medium text-iscm-charcoal">{a.asset_name}</span>
                  <span className="block truncate font-ibm text-xs text-gray-400">{a.storage_url}</span>
                </span>
                <SecurityBadge level={a.security_level} />
                <ExternalLink className="h-4 w-4 shrink-0 text-gray-400" />
              </a>
            );
          })}
          {workboards.length === 0 && (
            <p className="font-ibm text-sm text-gray-400">Chưa đăng ký liên kết ngoài.</p>
          )}
        </div>
      </div>
    </div>
  );
}
