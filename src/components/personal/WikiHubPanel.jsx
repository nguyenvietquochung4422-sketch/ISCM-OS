import { useMemo, useState } from 'react';
import { Search, FileText, BadgeCheck, BadgeAlert, ChevronDown, ChevronRight } from 'lucide-react';
import { WIKI_BRANCHES, isNameCompliant } from '../../data/wikiHub.js';

/* Wiki Hub — one branch (Guidelines/Policies/Regulations/Start) per view.
   Every listed file gets a live [Date][Project Name][Document Title]
   compliance badge; non-conformant names are flagged red. */

export default function WikiHubPanel({ branch }) {
  const data = WIKI_BRANCHES[branch];
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState({});

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.sections;
    return data.sections
      .map((s) => ({
        ...s,
        topics: s.topics.filter((t) => t.toLowerCase().includes(q)),
        docs: s.docs.filter((d) => d.name.toLowerCase().includes(q)),
        _match: s.section.toLowerCase().includes(q),
      }))
      .filter((s) => s._match || s.topics.length > 0 || s.docs.length > 0);
  }, [data, query]);

  const toggle = (name) => setOpen((p) => ({ ...p, [name]: !p[name] }));
  const isOpen = (name) => open[name] ?? true;

  return (
    <div className="space-y-3">
      <p className="font-ibm text-xs text-gray-500">{data.blurb}</p>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Tìm trong ${data.label}…`}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 font-ibm text-xs focus:border-iscm-crimson focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {sections.map((s) => (
          <section key={s.section} className="rounded-xl border border-gray-100 bg-white/60">
            <button onClick={() => toggle(s.section)}
              className="flex w-full items-center justify-between px-3 py-2 text-left font-barlow text-xs font-bold text-iscm-charcoal hover:bg-iscm-surface/60">
              {s.section}
              {isOpen(s.section) ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
            </button>
            {isOpen(s.section) && (
              <div className="space-y-2 px-3 pb-3">
                <div className="flex flex-wrap gap-1">
                  {s.topics.map((t) => (
                    <span key={t} className="rounded-full bg-iscm-surface px-2 py-0.5 font-ibm text-[10px] text-gray-600">{t}</span>
                  ))}
                </div>
                <ul className="space-y-1">
                  {s.docs.map((d) => {
                    const ok = isNameCompliant(d.name);
                    return (
                      <li key={d.name} className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-iscm-crimson" />
                        <span className="min-w-0 flex-1 truncate font-ibm text-[11px] text-iscm-charcoal" title={d.name}>{d.name}</span>
                        <span className="font-barlow-condensed text-[10px] text-gray-400">{d.updated}</span>
                        {ok ? (
                          <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 font-ibm text-[9px] font-medium text-emerald-700">
                            <BadgeCheck className="h-3 w-3" /> Naming OK
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 font-ibm text-[9px] font-medium text-iscm-crimson"
                            title="Vi phạm chuẩn [Date][Project Name][Document Title]">
                            <BadgeAlert className="h-3 w-3" /> Non-compliant
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        ))}
        {sections.length === 0 && (
          <p className="py-8 text-center font-ibm text-xs text-gray-400">Không có mục nào khớp từ khóa.</p>
        )}
      </div>
    </div>
  );
}
