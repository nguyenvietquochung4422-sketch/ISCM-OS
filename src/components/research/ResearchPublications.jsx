import { useState, useMemo, useEffect } from 'react';
import { Search, ExternalLink, Clipboard, Check, ChevronDown, ChevronRight, CheckSquare, Square } from 'lucide-react';
import { PUBLICATIONS_DATA } from '../../data/publicationsData.js';
import { supabase, isLive } from '../../lib/supabaseClient.js';

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

  // Initialize columns order & sizes state (using pixel widths for resizing)
  const [columnOrder, setColumnOrder] = useState([
    { key: 'stt', label: 'STT', width: 50, align: 'text-center' },
    { key: 'year', label: 'Pub. Year', width: 75, align: 'text-center' },
    { key: 'title', label: 'Publication Title', width: 340, align: 'text-left' },
    { key: 'authors', label: 'Authors', width: 220, align: 'text-left' },
    { key: 'journal', label: 'Journal / Publisher', width: 220, align: 'text-left' },
    { key: 'ssci', label: 'ISI (SSCI)', width: 80, align: 'text-center' },
    { key: 'scie', label: 'ISI (SCIE)', width: 80, align: 'text-center' },
    { key: 'ahci', label: 'ISI (A&HCI)', width: 80, align: 'text-center' },
    { key: 'scopus', label: 'Scopus', width: 90, align: 'text-center' },
    { key: 'esci', label: 'ESCI', width: 80, align: 'text-center' },
    { key: 'framework', label: 'Framework Trans.', width: 70, align: 'text-center' },
    { key: 'glocal', label: 'Glocal Design', width: 70, align: 'text-center' },
    { key: 'human', label: 'Human Centric', width: 70, align: 'text-center' },
    { key: 'tech', label: 'Tech Sol.', width: 70, align: 'text-center' },
    { key: 'urban', label: 'Urban Sys.', width: 70, align: 'text-center' },
    { key: 'ueh_declared', label: 'UEH Decl.', width: 85, align: 'text-center' },
    { key: 'ueh_reward', label: 'UEH Reward', width: 85, align: 'text-center' }
  ]);

  // Drag and Drop state
  const [draggedColIdx, setDraggedColIdx] = useState(null);

  const handleDragStart = (idx) => {
    setDraggedColIdx(idx);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetIdx) => {
    if (draggedColIdx === null || draggedColIdx === targetIdx) return;
    const reordered = [...columnOrder];
    const [dragged] = reordered.splice(draggedColIdx, 1);
    reordered.splice(targetIdx, 0, dragged);
    setColumnOrder(reordered);
    setDraggedColIdx(null);
  };

  // Column resizing handler
  const handleResizeStart = (idx, e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnOrder[idx].width;

    const handleMouseMove = (moveEvent) => {
      const diffX = moveEvent.clientX - startX;
      const nextWidth = Math.max(30, startWidth + diffX);
      setColumnOrder(prev => {
        const next = [...prev];
        next[idx] = { ...next[idx], width: nextWidth };
        return next;
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

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

  // Sum of column widths
  const tableWidth = useMemo(() => {
    return columnOrder.reduce((sum, c) => sum + c.width, 0);
  }, [columnOrder]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 font-ibm text-neutral-900 bg-white">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 bg-neutral-50 p-2.5 border border-neutral-200/60 shadow-sm shrink-0">
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
      </div>

      {/* 2. Data Table Grid (Scrollable horizontally) */}
      <div className="flex-1 overflow-auto border border-neutral-200">
        <table 
          className="table-fixed text-left border-collapse" 
          style={{ width: tableWidth }}
        >
          <colgroup>
            {columnOrder.map(col => (
              <col key={col.key} style={{ width: col.width }} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-neutral-900 text-white font-barlow text-[10px] uppercase tracking-wider font-black select-none">
            <tr>
              {columnOrder.map((col, idx) => (
                <th
                  key={col.key}
                  draggable={col.key !== 'stt'}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  className={`px-2 py-3 text-center border-r border-neutral-800 transition-colors relative ${
                    col.key !== 'stt' ? 'cursor-move hover:bg-neutral-800/80' : ''
                  }`}
                  title={col.key !== 'stt' ? 'Drag to reorder column' : ''}
                >
                  <div className="flex items-center justify-center">
                    <span>{col.label}</span>
                  </div>
                  {/* Resizing Handle */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#8b0000]/60 transition-colors z-20"
                    onMouseDown={(e) => handleResizeStart(idx, e)}
                  />
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-neutral-200 text-xs font-ibm bg-white">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columnOrder.length} className="px-4 py-12 text-center text-neutral-400 italic bg-white">
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
                      {columnOrder.map(col => {
                        // STT
                        if (col.key === 'stt') {
                          return (
                            <td key={col.key} className="px-3 py-3.5 text-center text-neutral-400 font-mono border-r border-neutral-100">
                              {idx + 1}
                            </td>
                          );
                        }

                        // Pub. Year
                        if (col.key === 'year') {
                          return (
                            <td key={col.key} className="p-1 border-r border-neutral-100 font-mono">
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updatePublicationField(item.id, 'year', e.target.innerText)}
                                className="w-full text-center bg-transparent focus:bg-white text-xs font-bold text-[#8b0000] focus:outline-none transition-all p-1 font-mono focus:ring-1 focus:ring-[#8b0000]/50"
                              >
                                {item.year}
                              </div>
                            </td>
                          );
                        }

                        // Publication Title
                        if (col.key === 'title') {
                          return (
                            <td key={col.key} className="px-2 py-1 border-r border-neutral-100">
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
                                  className="w-full bg-transparent focus:bg-white text-xs text-neutral-800 focus:outline-none transition-all p-1 leading-relaxed font-ibm focus:ring-1 focus:ring-[#8b0000]/50 min-h-[2.2em]"
                                >
                                  {item.title}
                                </div>
                              </div>
                            </td>
                          );
                        }

                        // Authors
                        if (col.key === 'authors') {
                          return (
                            <td key={col.key} className="px-2 py-1 border-r border-neutral-100">
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updatePublicationField(item.id, 'authors', e.target.innerText)}
                                className="w-full bg-transparent focus:bg-white text-xs text-neutral-600 focus:outline-none transition-all p-1 leading-normal font-ibm focus:ring-1 focus:ring-[#8b0000]/50 min-h-[2.2em]"
                              >
                                {item.authors}
                              </div>
                            </td>
                          );
                        }

                        // Journal
                        if (col.key === 'journal') {
                          return (
                            <td key={col.key} className="px-2 py-1 border-r border-neutral-100">
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updatePublicationField(item.id, 'journal_conference', e.target.innerText)}
                                className="w-full bg-transparent focus:bg-white text-xs text-neutral-700 italic focus:outline-none transition-all p-1 leading-normal font-ibm focus:ring-1 focus:ring-[#8b0000]/50 min-h-[2.2em]"
                              >
                                {item.journal_conference}
                              </div>
                            </td>
                          );
                        }

                        // Indexing keys (ssci, scie, ahci, scopus, esci)
                        if (['ssci', 'scie', 'ahci', 'scopus', 'esci'].includes(col.key)) {
                          return (
                            <td key={col.key} className="p-1 border-r border-neutral-100 bg-neutral-50/20">
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updatePublicationIndexing(item.id, col.key, e.target.innerText)}
                                className="w-full text-center bg-transparent focus:bg-white text-[10px] text-neutral-700 focus:outline-none transition-all p-1 font-mono font-bold focus:ring-1 focus:ring-[#8b0000]/50"
                              >
                                {item.indexing_cols?.[col.key] || ''}
                              </div>
                            </td>
                          );
                        }

                        // Checklist keys
                        if (['framework', 'glocal', 'human', 'tech', 'urban'].includes(col.key)) {
                          return (
                            <td
                              key={col.key}
                              onClick={() => updatePublicationDetail(item.id, col.key, !item.details[col.key])}
                              className="checklist-cell px-1 py-3.5 text-center cursor-pointer hover:bg-neutral-100/50 transition-colors border-r border-neutral-100"
                              title={lang === 'vi' ? 'Bấm để tích chọn / bỏ chọn' : 'Click to toggle'}
                            >
                              {item.details[col.key] ? (
                                <CheckSquare className="h-4 w-4 mx-auto text-[#8b0000]" />
                              ) : (
                                <Square className="h-4 w-4 mx-auto text-neutral-200 hover:text-neutral-400" />
                              )}
                            </td>
                          );
                        }

                        // UEH Declared / Reward
                        if (col.key === 'ueh_declared' || col.key === 'ueh_reward') {
                          return (
                            <td key={col.key} className="p-1 border-r border-neutral-100">
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updatePublicationField(item.id, col.key, e.target.innerText)}
                                className="w-full text-center bg-transparent focus:bg-white text-[11px] text-neutral-600 focus:outline-none transition-all p-1 font-mono font-medium focus:ring-1 focus:ring-[#8b0000]/50"
                              >
                                {item[col.key] || ''}
                              </div>
                            </td>
                          );
                        }

                        return null;
                      })}
                    </tr>

                    {/* Expandable APA Citation Row */}
                    {isExpanded && (
                      <tr key={`${item.id}-exp`} className="bg-neutral-50/50">
                        <td colSpan={columnOrder.length} className="px-6 py-3 border-t border-neutral-100">
                          <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-3 border border-neutral-200 shadow-sm">
                            <div className="flex-1 space-y-1">
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">APA Citation (Directly editable)</span>
                              <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => updatePublicationField(item.id, 'citation', e.target.innerText)}
                                className="w-full bg-transparent focus:bg-white text-[11px] text-neutral-800 italic focus:outline-none transition-all p-1.5 leading-relaxed font-ibm focus:ring-1 focus:ring-[#8b0000]/50"
                              >
                                {item.citation}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 shrink-0 self-end md:self-center">
                              {/* Copy Citation Button */}
                              <button
                                type="button"
                                onClick={() => handleCopyCitation(item.id, item.citation)}
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
