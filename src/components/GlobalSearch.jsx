import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Landmark, Factory, GraduationCap } from 'lucide-react';
import { assets, templates, partners, projectById, userById } from '../data/mockData.js';
import { FileIcon, SecurityBadge } from './ui.jsx';
import { supabase, isLive } from '../lib/supabaseClient.js';

/* ------------------------------------------------------------------ */
/* Integrated Intelligent Search — one index across ALL internal text: */
/* project assets (KMS), standardized templates (Global Library), and  */
/* the partner network (CRM). Try: "MOU", "Grab", ".xlsx", "Nha Trang" */
/* ------------------------------------------------------------------ */

const PARTNER_ICONS = { Authority: Landmark, Industry: Factory, Academia: GraduationCap };

/** Build the unified search corpus once for fallback mode */
function buildCorpus() {
  return [
    ...assets.map((a) => {
      const project = projectById[a.project_id];
      const owner = userById[a.uploaded_by];
      return {
        kind: 'asset', id: `a-${a.id}`, ...a,
        title: a.asset_name,
        subtitle: `${project?.project_name} · ${project?.location} · ${owner?.full_name}`,
        haystack: [a.asset_name, a.asset_type, a.file_extension, project?.location,
          project?.project_name, project?.project_code, owner?.full_name, owner?.base_functional_group],
      };
    }),
    ...templates.map((t) => ({
      kind: 'template', id: `t-${t.id}`, ...t,
      title: t.asset_name,
      subtitle: `Kho Biểu mẫu Chuẩn · ${t.category} · v${t.version}`,
      haystack: [t.asset_name, t.asset_type, t.file_extension, t.category, 'template', 'biểu mẫu'],
    })),
    ...partners.map((p) => {
      const project = projectById[p.project_id];
      return {
        kind: 'partner', id: `p-${p.id}`, ...p,
        title: p.partner_name,
        subtitle: `${p.partner_type} · ${project?.project_name} · ${p.contact_person ?? ''}`,
        haystack: [p.partner_name, p.partner_type, p.contact_person, p.details, project?.project_name],
      };
    }),
  ];
}

export default function GlobalSearch({ onOpenAsset }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef(null);
  
  // Fallback local corpus
  const fallbackCorpus = useMemo(buildCorpus, []);
  const [liveResults, setLiveResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced search effect for Supabase live mode
  useEffect(() => {
    if (!isLive) return;
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setLiveResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        // Query assets
        const { data: assetsData } = await supabase
          .from('digital_assets')
          .select('*, projects(project_name, location_tag)')
          .ilike('asset_name', `%${q}%`)
          .limit(5);

        // Query partners
        const { data: partnersData } = await supabase
          .from('project_partners')
          .select('*, projects(project_name)')
          .ilike('partner_name', `%${q}%`)
          .limit(5);

        const formattedAssets = (assetsData || []).map((a) => ({
          kind: a.project_id ? 'asset' : 'template',
          id: `a-${a.id}`,
          ...a,
          title: a.asset_name,
          subtitle: a.project_id 
            ? `${a.projects?.project_name ?? ''} · ${a.projects?.location_tag ?? ''}` 
            : `Kho Biểu mẫu Chuẩn · v${a.version}`,
        }));

        const formattedPartners = (partnersData || []).map((p) => ({
          kind: 'partner',
          id: `p-${p.id}`,
          ...p,
          title: p.partner_name,
          subtitle: `${p.partner_type} · ${p.projects?.project_name ?? ''}`,
        }));

        setLiveResults([...formattedAssets, ...formattedPartners].slice(0, 8));
      } catch (err) {
        console.error('Error during database search:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [query]);

  // Determine which search results to show
  const results = useMemo(() => {
    if (isLive) {
      return liveResults;
    }
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return fallbackCorpus
      .filter((entry) => entry.haystack.filter(Boolean).some((f) => f.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [query, isLive, liveResults, fallbackCorpus]);

  const open = focused && results.length > 0;

  return (
    <div className="relative">
      {/* Rounded pill matching the public-site "Tìm kiếm…" input */}
      <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 ring-1 ring-white/10 focus-within:ring-iscm-crimson-light">
        <Search className="h-4 w-4 text-white/50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { clearTimeout(blurTimer.current); setFocused(true); }}
          onBlur={() => { blurTimer.current = setTimeout(() => setFocused(false), 150); }}
          placeholder="Tìm tài liệu, biểu mẫu, đối tác…"
          className="w-full bg-transparent font-ibm text-sm text-white placeholder:text-white/40 focus:outline-none"
        />
        {loading && <span className="h-2 w-2 animate-ping rounded-full bg-iscm-crimson" />}
      </div>

      {open && (
        <div className="glass-card absolute right-0 top-11 max-h-96 w-96 max-w-[85vw] overflow-y-auto bg-white/95 p-2 text-iscm-charcoal z-50">
          {results.map((entry) => {
            const PartnerIcon = PARTNER_ICONS[entry.partner_type];
            return (
              <button
                key={entry.id}
                onMouseDown={() => onOpenAsset?.(entry)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-iscm-surface"
              >
                {entry.kind === 'partner'
                  ? (PartnerIcon ? <PartnerIcon className="h-5 w-5 shrink-0 text-iscm-crimson" /> : <Landmark className="h-5 w-5 shrink-0 text-iscm-crimson" />)
                  : <FileIcon extension={entry.file_extension} className="h-5 w-5 shrink-0" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-ibm text-sm font-medium">{entry.title}</span>
                  <span className="block truncate font-ibm text-xs text-gray-500">{entry.subtitle}</span>
                </span>
                {entry.security_level && <SecurityBadge level={entry.security_level} />}
                {entry.kind === 'template' && (
                  <span className="badge bg-iscm-crimson/10 text-iscm-crimson">Template</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
