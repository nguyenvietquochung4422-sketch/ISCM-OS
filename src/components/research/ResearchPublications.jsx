import { useState, useMemo, useEffect } from 'react';
import { Search, ExternalLink, Clipboard, Check, ChevronDown, ChevronRight, CheckSquare, Square, Download } from 'lucide-react';
import { PUBLICATIONS_DATA } from '../../data/publicationsData.js';
import { supabase, isLive } from '../../lib/supabaseClient.js';
import { exportToCsv } from '../../lib/exportCsv.js';

const STORE_KEY = 'iscm_publications_edits_v1';

// The live `publications` table only stores the base bibliographic fields
// (stt, pub_year, title, authors, journal, category) — it has no columns yet
// for indexing badges, the framework/glocal/human/tech/urban checklist, APA
// citation, or UEH declaration/reward tracking. Those stay blank for
// Supabase-sourced rows until the schema is extended; they're still editable
// in the UI and persist to localStorage like any other row.
const mapLiveRow = (row) => ({
  id: `live-${row.id}`,
  section: '',
  category: row.category || '',
  year: row.pub_year || '',
  pub_time: '',
  ueh_declared: '',
  ueh_reward: '',
  title: row.title || '',
  authors: row.authors || '',
  journal_conference: row.journal || '',
  indexing: [],
  citation: '',
  details: { framework: false, glocal: false, human: false, tech: false, urban: false },
});

// The live `publications` table has no citation column, so every
// Supabase-sourced row starts with citation: '' — falls back to a
// best-effort APA-style string built from the fields we do have
// (Authors (Year). Title. Journal.) until someone edits it manually.
const buildAutoCitation = (item) => {
  const parts = [];
  if (item.authors) parts.push(item.authors.trim());
  if (item.year) parts.push(`(${item.year})`);
  const lead = parts.join(' ').trim();
  const segments = [lead, item.title?.trim(), item.journal_conference?.trim()].filter(Boolean);
  if (segments.length === 0) return '';
  return segments.join('. ').replace(/\.\.$/, '.') + (segments[segments.length - 1].endsWith('.') ? '' : '.');
};

// Derives the editable indexing_cols (ISI/Scopus/ESCI badges) from the raw
// `indexing` tag array — shared by both the static dataset and any future
// richer live rows that populate `indexing`.
const buildPublicationRows = (baseData) => baseData.map(item => {
  const indexing = item.indexing || [];
  const ssciVal = indexing.find(x => x.toLowerCase().includes('ssci')) ? 'ISI (SSCI)' : '';
  const scieVal = indexing.find(x => x.toLowerCase().includes('scie')) ? 'ISI (SCIE)' : '';
  const ahciVal = indexing.find(x => x.toLowerCase().includes('a&hci') || x.toLowerCase().includes('ahci')) ? 'ISI (A&HCI)' : '';
  let scopusVal = '';
  const scopusEntry = indexing.find(x => x.toLowerCase().includes('scopus'));
  if (scopusEntry) {
    const qMatch = scopusEntry.match(/Q\d/i);
    scopusVal = qMatch ? `Scopus (${qMatch[0].toUpperCase()})` : 'Scopus';
  }
  const esciVal = indexing.find(x => x.toLowerCase().includes('esci')) ? 'ESCI' : '';

  return {
    ...item,
    pub_time: item.pub_time || '',
    ueh_declared: item.ueh_declared || '',
    ueh_reward: item.ueh_reward || '',
    indexing_cols: {
      ssci: ssciVal,
      scie: scieVal,
      ahci: ahciVal,
      scopus: scopusVal,
      esci: esciVal,
    },
  };
});

export default function ResearchPublications({ lang }) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Indexing badges, the Framework/Glocal/Human/Tech/Urban checklist, and
  // UEH declaration/reward no longer get their own table columns — they now
  // live in the expandable row panel below, alongside the APA citation.
  const INDEXING_FIELDS = [
    { key: 'ssci', label: 'ISI (SSCI)' },
    { key: 'scie', label: 'ISI (SCIE)' },
    { key: 'ahci', label: 'ISI (A&HCI)' },
    { key: 'scopus', label: 'Scopus' },
    { key: 'esci', label: 'ESCI' },
  ];

  const CHECKLIST_FIELDS = [
    { key: 'framework', label: 'Framework Trans.' },
    { key: 'glocal', label: 'Glocal Design' },
    { key: 'human', label: 'Human Centric' },
    { key: 'tech', label: 'Tech Sol.' },
    { key: 'urban', label: 'Urban Sys.' },
  ];

  // Load and persist state to LocalStorage. Prior local edits always win
  // (same precedence as before); only a fresh, never-edited table pulls its
  // base rows from Supabase (when live) instead of the bundled dataset.
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const stored = localStorage.getItem(STORE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Ensure all loaded objects have the indexing_cols and UEH properties
          const restored = parsed.map(item => {
            const ssciVal = item.indexing_cols?.ssci ?? (item.indexing?.find(x => x.toLowerCase().includes('ssci')) ? 'ISI (SSCI)' : '');
            const scieVal = item.indexing_cols?.scie ?? (item.indexing?.find(x => x.toLowerCase().includes('scie')) ? 'ISI (SCIE)' : '');
            const ahciVal = item.indexing_cols?.ahci ?? (item.indexing?.find(x => x.toLowerCase().includes('a&hci') || x.toLowerCase().includes('ahci')) ? 'ISI (A&HCI)' : '');

            let scopusVal = item.indexing_cols?.scopus ?? '';
            if (!scopusVal && item.indexing) {
              const scopusEntry = item.indexing.find(x => x.toLowerCase().includes('scopus'));
              if (scopusEntry) {
                const qMatch = scopusEntry.match(/Q\d/i);
                scopusVal = qMatch ? `Scopus (${qMatch[0].toUpperCase()})` : 'Scopus';
              }
            }
            const esciVal = item.indexing_cols?.esci ?? (item.indexing?.find(x => x.toLowerCase().includes('esci')) ? 'ESCI' : '');

            return {
              ...item,
              pub_time: item.pub_time ?? '',
              ueh_declared: item.ueh_declared ?? '',
              ueh_reward: item.ueh_reward ?? '',
              indexing_cols: { ssci: ssciVal, scie: scieVal, ahci: ahciVal, scopus: scopusVal, esci: esciVal },
            };
          });
          if (!cancelled) setPublications(restored);
          return;
        }
      } catch {}

      let baseData = PUBLICATIONS_DATA;
      if (isLive) {
        try {
          const { data, error } = await supabase
            .from('publications')
            .select('*')
            .order('pub_year', { ascending: false });
          if (!error && data && data.length > 0) baseData = data.map(mapLiveRow);
        } catch {}
      }

      if (!cancelled) setPublications(buildPublicationRows(baseData));
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const updatePublicationField = (pubId, fieldKey, value) => {
    const next = publications.map(p => {
      if (p.id === pubId) {
        return {
          ...p,
          [fieldKey]: value
        };
      }
      return p;
    });
    setPublications(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  };

  const updatePublicationIndexing = (pubId, colKey, value) => {
    const next = publications.map(p => {
      if (p.id === pubId) {
        return {
          ...p,
          indexing_cols: {
            ...p.indexing_cols,
            [colKey]: value
          }
        };
      }
      return p;
    });
    setPublications(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  };

  const updatePublicationDetail = (pubId, detailKey, value) => {
    const next = publications.map(p => {
      if (p.id === pubId) {
        return {
          ...p,
          details: {
            ...p.details,
            [detailKey]: value
          }
        };
      }
      return p;
    });
    setPublications(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  };

  // Filtering
  const filteredData = useMemo(() => {
    return publications.filter(item => {
      // Category filter
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'Book_Chapter') {
          if (item.category !== 'Book' && item.category !== 'Book Chapter') return false;
        } else {
          if (item.category !== categoryFilter) return false;
        }
      }

      // Search query filter
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.authors.toLowerCase().includes(q) ||
        item.journal_conference.toLowerCase().includes(q) ||
        item.year.includes(q)
      );
    });
  }, [publications, categoryFilter, query]);

  // Sort by year (descending), then alphabetically by title
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      if (yearB !== yearA) return yearB - yearA;
      return a.title.localeCompare(b.title);
    });
  }, [filteredData]);

  // Copy citation helper
  const handleCopyCitation = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRow = (id, e) => {
    if (e.target.closest('.checklist-cell') || e.target.closest('[contenteditable="true"]')) return;
    setExpandedId(expandedId === id ? null : id);
  };

  // Exports the currently filtered/sorted rows, including the fields moved
  // into the expandable panel — opens directly in Excel/Sheets.
  const handleExportCsv = () => {
    const headers = [
      'STT', 'Pub. Year', 'Title', 'Authors', 'Journal / Publisher',
      'ISI (SSCI)', 'ISI (SCIE)', 'ISI (A&HCI)', 'Scopus', 'ESCI',
      'Framework Trans.', 'Glocal Design', 'Human Centric', 'Tech Sol.', 'Urban Sys.',
      'UEH Decl.', 'UEH Reward', 'APA Citation',
    ];
    const rows = sortedData.map((item, idx) => [
      idx + 1, item.year || '', item.title || '', item.authors || '', item.journal_conference || '',
      item.indexing_cols?.ssci || '', item.indexing_cols?.scie || '', item.indexing_cols?.ahci || '',
      item.indexing_cols?.scopus || '', item.indexing_cols?.esci || '',
      item.details.framework ? 'Yes' : '', item.details.glocal ? 'Yes' : '', item.details.human ? 'Yes' : '',
      item.details.tech ? 'Yes' : '', item.details.urban ? 'Yes' : '',
      item.ueh_declared || '', item.ueh_reward || '', item.citation || buildAutoCitation(item),
    ]);
    exportToCsv('publications', headers, rows);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 font-ibm text-neutral-900 bg-white">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 bg-neutral-50 p-2.5 border border-neutral-200/60 shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'vi' ? 'Tìm theo tên bài báo, tác giả, tạp chí...' : 'Search by title, author, journal...'}
            className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 bg-white text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-[#8b0000] focus:ring-1 focus:ring-[#8b0000] focus:outline-none transition-all rounded-none"
          />
        </div>

        {/* Category Select Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setExpandedId(null);
          }}
          className="border border-neutral-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700 font-medium"
        >
          <option value="all">{lang === 'vi' ? 'Tất cả thể loại' : 'All Categories'}</option>
          <option value="International Journal">{lang === 'vi' ? 'Tạp chí Quốc tế' : 'International Journals'}</option>
          <option value="International Conference">{lang === 'vi' ? 'Hội thảo Quốc tế' : 'International Conferences'}</option>
          <option value="Domestic Journal">{lang === 'vi' ? 'Tạp chí Trong nước' : 'Domestic Journals'}</option>
          <option value="Domestic Conference">{lang === 'vi' ? 'Hội thảo Trong nước' : 'Domestic Conferences'}</option>
          <option value="Book_Chapter">{lang === 'vi' ? 'Sách & Chương sách' : 'Books & Chapters'}</option>
        </select>

        <button
          type="button"
          onClick={handleExportCsv}
          className="ml-auto inline-flex items-center gap-1.5 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:border-[#8b0000] hover:text-[#8b0000] transition-colors rounded-none"
        >
          <Download className="h-3.5 w-3.5" />
          {lang === 'vi' ? 'Xuất CSV' : 'Export CSV'}
        </button>
      </div>

      {/* 2. Data Table Grid — fixed columns, fits the frame (no horizontal
          scroll), matching Research List. Indexing/checklist/UEH details
          live in the expandable row panel below instead of extra columns. */}
      <div className="min-h-0 flex-1 overflow-auto border border-neutral-200 bg-white shadow-sm">
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-neutral-900 text-white font-barlow text-[10px] uppercase tracking-wider font-bold select-none">
            <tr>
              <th className="px-3 py-3 text-center w-[6%]">STT</th>
              <th className="px-3 py-3 text-center w-[9%]">Pub. Year</th>
              <th className="px-3 py-3 text-left w-[32%]">Publication Title</th>
              <th className="px-3 py-3 text-left w-[26%]">Authors</th>
              <th className="px-3 py-3 text-left w-[27%]">Journal / Publisher</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-200 text-xs font-ibm bg-white">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-neutral-400 italic bg-white">
                  {lang === 'vi' ? 'Không tìm thấy kết quả nào.' : 'No publications found matching criteria.'}
                </td>
              </tr>
            ) : (
              sortedData.map((item, idx) => {
                const isExpanded = expandedId === item.id;
                return (
                  <>
                    <tr
                      key={item.id}
                      onClick={(e) => toggleRow(item.id, e)}
                      className={`hover:bg-neutral-50/50 transition-colors cursor-pointer ${
                        isExpanded ? 'bg-neutral-50 font-medium' : ''
                      }`}
                    >
                      <td className="px-3 py-3.5 text-center text-neutral-400 font-mono border-r border-neutral-100">
                        {idx + 1}
                      </td>

                      <td className="p-1 border-r border-neutral-100 font-mono">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updatePublicationField(item.id, 'year', e.target.innerText)}
                          className="w-full text-center bg-transparent focus:bg-white text-xs font-bold text-[#8b0000] focus:outline-none transition-all p-1 font-mono focus:ring-1 focus:ring-[#8b0000]/50"
                        >
                          {item.year}
                        </div>
                      </td>

                      <td className="px-2 py-1 border-r border-neutral-100">
                        <div className="flex items-start gap-1">
                          <button
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            className="mt-1.5 text-neutral-400 hover:text-[#8b0000] transition-colors shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updatePublicationField(item.id, 'title', e.target.innerText)}
                            className="w-full bg-transparent focus:bg-white text-xs text-neutral-800 focus:outline-none transition-all p-1 leading-relaxed font-ibm focus:ring-1 focus:ring-[#8b0000]/50 min-h-[2.2em] break-words"
                          >
                            {item.title}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-1 border-r border-neutral-100">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updatePublicationField(item.id, 'authors', e.target.innerText)}
                          className="w-full bg-transparent focus:bg-white text-xs text-neutral-600 focus:outline-none transition-all p-1 leading-normal font-ibm focus:ring-1 focus:ring-[#8b0000]/50 min-h-[2.2em] break-words"
                        >
                          {item.authors}
                        </div>
                      </td>

                      <td className="px-2 py-1">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updatePublicationField(item.id, 'journal_conference', e.target.innerText)}
                          className="w-full bg-transparent focus:bg-white text-xs text-neutral-700 italic focus:outline-none transition-all p-1 leading-normal font-ibm focus:ring-1 focus:ring-[#8b0000]/50 min-h-[2.2em] break-words"
                        >
                          {item.journal_conference}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable panel: Indexing, Framework Pillars, UEH, APA Citation */}
                    {isExpanded && (
                      <tr key={`${item.id}-exp`} className="bg-neutral-50/50">
                        <td colSpan={5} className="px-6 py-3 border-t border-neutral-100">
                          <div className="bg-white p-3 border border-neutral-200 shadow-sm space-y-3">

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Indexing */}
                              <div>
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Indexing</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {INDEXING_FIELDS.map(({ key, label }) => (
                                    <div key={key} className="flex items-center gap-1 border border-neutral-200 bg-neutral-50/40 px-2 py-1">
                                      <span className="text-[9px] font-semibold text-neutral-400 uppercase">{label}</span>
                                      <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => updatePublicationIndexing(item.id, key, e.target.innerText)}
                                        className="min-w-[1.5em] bg-transparent focus:bg-white text-[10px] text-neutral-700 focus:outline-none font-mono font-bold focus:ring-1 focus:ring-[#8b0000]/50"
                                      >
                                        {item.indexing_cols?.[key] || ''}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Framework Pillars Checklist */}
                              <div>
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">Framework Pillars</span>
                                <div className="flex flex-wrap gap-2.5">
                                  {CHECKLIST_FIELDS.map(({ key, label }) => (
                                    <button
                                      key={key}
                                      type="button"
                                      onClick={() => updatePublicationDetail(item.id, key, !item.details[key])}
                                      className="flex items-center gap-1 text-[10px] text-neutral-600 hover:text-neutral-900"
                                      title={lang === 'vi' ? 'Bấm để tích chọn / bỏ chọn' : 'Click to toggle'}
                                    >
                                      {item.details[key] ? (
                                        <CheckSquare className="h-3.5 w-3.5 text-[#8b0000] shrink-0" />
                                      ) : (
                                        <Square className="h-3.5 w-3.5 text-neutral-300 shrink-0" />
                                      )}
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* UEH Declared / Reward */}
                              <div>
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">UEH</span>
                                <div className="flex gap-3">
                                  {[{ key: 'ueh_declared', label: 'UEH Decl.' }, { key: 'ueh_reward', label: 'UEH Reward' }].map(({ key, label }) => (
                                    <div key={key} className="flex items-center gap-1 border border-neutral-200 bg-neutral-50/40 px-2 py-1">
                                      <span className="text-[9px] font-semibold text-neutral-400 uppercase">{label}</span>
                                      <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => updatePublicationField(item.id, key, e.target.innerText)}
                                        className="min-w-[1.5em] bg-transparent focus:bg-white text-[10px] text-neutral-700 focus:outline-none font-mono font-medium focus:ring-1 focus:ring-[#8b0000]/50"
                                      >
                                        {item[key] || ''}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* APA Citation */}
                            <div className="flex flex-col md:flex-row md:items-center gap-4 pt-3 border-t border-neutral-100">
                              <div className="flex-1 space-y-1">
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                                  APA Citation (Directly editable)
                                  {!item.citation && (
                                    <span className="ml-1.5 normal-case font-medium text-neutral-300">
                                      — {lang === 'vi' ? 'tự động tạo, chỉnh để chốt' : 'auto-generated, edit to finalize'}
                                    </span>
                                  )}
                                </span>
                                <div
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={(e) => updatePublicationField(item.id, 'citation', e.target.innerText)}
                                  className="w-full bg-transparent focus:bg-white text-[11px] text-neutral-800 italic focus:outline-none transition-all p-1.5 leading-relaxed font-ibm focus:ring-1 focus:ring-[#8b0000]/50"
                                >
                                  {item.citation || buildAutoCitation(item)}
                                </div>
                              </div>

                              <div className="flex gap-2 shrink-0 self-end md:self-center">
                                {/* Copy Citation Button */}
                                <button
                                  type="button"
                                  onClick={() => handleCopyCitation(item.id, item.citation || buildAutoCitation(item))}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase border border-neutral-200 hover:border-[#8b0000] hover:text-[#8b0000] bg-white transition-colors text-neutral-700 font-sans"
                                >
                                  {copiedId === item.id ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-600" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Clipboard className="h-3 w-3" />
                                      Copy APA
                                    </>
                                  )}
                                </button>

                                {/* Search Google Scholar Button */}
                                <a
                                  href={`https://scholar.google.com/scholar?q=${encodeURIComponent(item.title)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase border border-neutral-900 bg-neutral-900 text-white hover:bg-[#8b0000] transition-colors font-sans"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Scholar
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
