import { Download, Library, FileBadge } from 'lucide-react';
import { templates, assets, projectById } from '../data/mockData.js';
import { FileIcon, SecurityBadge } from '../components/ui.jsx';

/* ------------------------------------------------------------------ */
/* Kho Biểu mẫu Chuẩn — Global Library (KMS Gien)                      */
/*  · Standardized administrative templates (.docx/.xlsx)              */
/*  · Corporate brand assets (.pptx decks, logos, profiles)            */
/*  · Institute-wide 'Internal Open' project knowledge                 */
/* ------------------------------------------------------------------ */

function TemplateCard({ item }) {
  return (
    <a
      href={item.storage_url}
      download
      className="glass-card glass-card-hover flex items-center gap-4 p-4"
      title="Tải về ngay"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-iscm-crimson/10">
        <FileIcon extension={item.file_extension} className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-ibm text-sm font-medium text-iscm-charcoal">{item.asset_name}</span>
        <span className="block font-barlow-condensed text-xs uppercase tracking-wide text-gray-400">
          v{item.version} · {item.file_size_kb >= 1024 ? `${(item.file_size_kb / 1024).toFixed(1)} MB` : `${item.file_size_kb} KB`}
        </span>
      </span>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-iscm-cta text-white transition-colors group-hover:bg-iscm-crimson">
        <Download className="h-4 w-4" />
      </span>
    </a>
  );
}

export default function GlobalLibrary() {
  const categories = [...new Set(templates.map((t) => t.category))];
  const openProjectAssets = assets.filter((a) => a.security_level === 'Internal Open');

  return (
    <div className="w-full space-y-8">
      <header className="border-l-4 border-iscm-crimson pl-4 py-1 mb-2">
        <h1 className="flex items-center gap-2.5 font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
          <Library className="h-6 w-6 text-iscm-crimson" /> Kho Biểu mẫu Chuẩn
        </h1>
        <p className="font-ibm text-xs uppercase tracking-wider text-gray-500 mt-1">
          Global Library — biểu mẫu hành chính chuẩn hóa, brand assets, và tri thức dùng chung toàn Viện.
        </p>
      </header>

      {/* Standardized templates & brand assets, grouped by category */}
      {categories.map((category) => (
        <section key={category}>
          <h2 className="mb-3 font-barlow text-base font-bold text-iscm-charcoal">{category}</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {templates.filter((t) => t.category === category).map((t) => (
              <TemplateCard key={t.id} item={t} />
            ))}
          </div>
        </section>
      ))}

      {/* Institute-wide shared project knowledge (security = Internal Open) */}
      <section className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
          <FileBadge className="h-5 w-5 text-iscm-crimson" />
          <div>
            <h2 className="font-barlow text-base font-bold text-iscm-charcoal">Tri thức dự án chia sẻ toàn Viện</h2>
            <p className="font-ibm text-xs text-gray-500">
              Tài sản được mở mức <span className="font-medium text-emerald-700">Internal Open</span> từ các không gian dự án
            </p>
          </div>
        </div>
        <ul className="divide-y divide-gray-100">
          {openProjectAssets.map((a) => {
            const project = projectById[a.project_id];
            return (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-iscm-surface/40">
                <FileIcon extension={a.file_extension} className="h-5 w-5" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-ibm text-sm font-medium text-iscm-charcoal">{a.asset_name}</span>
                  <span className="block truncate font-ibm text-xs text-gray-400">
                    {project?.project_code} · {project?.project_name}
                  </span>
                </span>
                {a.version && (
                  <span className="font-barlow-condensed text-xs text-gray-400">v{a.version}</span>
                )}
                <SecurityBadge level={a.security_level} />
                <a href={a.storage_url} className="rounded-lg border border-gray-200 p-2 text-iscm-charcoal hover:border-iscm-crimson hover:text-iscm-crimson">
                  <Download className="h-4 w-4" />
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
