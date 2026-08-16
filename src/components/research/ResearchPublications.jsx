import { useState, useMemo, useEffect } from 'react';
import {
  Search, ExternalLink, Clipboard, Check, CheckSquare, Square, Download, Plus, X,
  Briefcase, Tag, Quote,
} from 'lucide-react';
import { PUBLICATIONS_DATA } from '../../data/publicationsData.js';
import { isLive } from '../../lib/supabaseClient.js';
import { exportToCsv } from '../../lib/exportCsv.js';
import {
  dbIdOf, updatePublication, insertPublication, deletePublication, fetchPublications,
} from '../../data/publicationsStore.js';
import { writeFailedMessage } from '../../data/researchListStore.js';

const STORE_KEY = 'iscm_publications_edits_v1';

const EMPTY_DETAILS = { framework: false, glocal: false, human: false, tech: false, urban: false };

const CATEGORIES = [
  'International Journal', 'International Conference',
  'Domestic Journal', 'Domestic Conference',
  'Book', 'Book Chapter',
];

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

// Maps a Supabase row onto the shape the table works with. Every field the UI
// edits now has a real column, so nothing is silently dropped on load.
const mapLiveRow = (row) => ({
  id: `live-${row.id}`,
  section: row.section || '',
  category: row.category || '',
  year: row.pub_year || '',
  pub_time: row.pub_time || '',
  ueh_declared: row.ueh_declared || '',
  ueh_reward: row.ueh_reward || '',
  title: row.title || '',
  authors: row.authors || '',
  journal_conference: row.journal || '',
  indexing: [],
  indexing_cols: row.indexing_cols || {},
  citation: row.citation || '',
  details: { ...EMPTY_DETAILS, ...(row.details || {}) },
});

// A row with no stored citation falls back to a best-effort APA string built
// from the fields we do have (Authors (Year). Title. Journal.) until someone
// edits it manually.
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

  // Values already stored on the row (e.g. loaded from the DB's indexing_cols
  // column) win — the derivation above is only a seed for rows that have the
  // raw `indexing` tag array and nothing else.
  const stored = item.indexing_cols || {};
  return {
    ...item,
    pub_time: item.pub_time || '',
    ueh_declared: item.ueh_declared || '',
    ueh_reward: item.ueh_reward || '',
    details: { ...EMPTY_DETAILS, ...(item.details || {}) },
    indexing_cols: {
      ssci: stored.ssci ?? ssciVal,
      scie: stored.scie ?? scieVal,
      ahci: stored.ahci ?? ahciVal,
      scopus: stored.scopus ?? scopusVal,
      esci: stored.esci ?? esciVal,
    },
  };
});

export default function ResearchPublications({ lang }) {
  const vi = lang === 'vi';
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const [publications, setPublications] = useState([]);

  // Editing works like the Research List: the table is read-only, clicking a
  // row opens a drawer, and nothing is written anywhere until Save. A new
  // publication lives in `draft` until then; edits to an existing one buffer
  // in `pendingEdits`.
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [pendingEdits, setPendingEdits] = useState({});
  const [drawerTab, setDrawerTab] = useState('metadata');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let localRows = [];
      try {
        localRows = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      } catch {}

      let dbRows = null;
      if (isLive) {
        try { dbRows = await fetchPublications(); } catch {}
      }
      if (cancelled) return;

      if (dbRows) {
        // Supabase is authoritative for the rows it owns — reading the local
        // cache first (as this used to) meant anyone who had ever made an edit
        // never saw the shared database again. Rows that exist only in this
        // browser (manual additions, edits to bundled demo rows) are kept.
        const localOnly = localRows.filter((r) => dbIdOf(r.id) === null);
        setPublications(buildPublicationRows([...dbRows.map(mapLiveRow), ...localOnly]));
        return;
      }

      // No backend reachable: fall back to the local cache, else the bundled set.
      setPublications(buildPublicationRows(localRows.length > 0 ? localRows : PUBLICATIONS_DATA));
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const reload = async () => {
    if (!isLive) return false;
    const dbRows = await fetchPublications();
    if (!dbRows) return false;
    let localRows = [];
    try { localRows = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch {}
    const localOnly = localRows.filter((r) => dbIdOf(r.id) === null);
    setPublications(buildPublicationRows([...dbRows.map(mapLiveRow), ...localOnly]));
    return true;
  };

  const selected = draft || publications.find((p) => p.id === selectedId) || null;
  // What the drawer shows: the stored row with any unsaved edits layered on top.
  const current = selected ? { ...selected, ...(draft ? {} : pendingEdits) } : null;

  const openRow = (id) => {
    setDraft(null);
    setPendingEdits({});
    setDrawerTab('metadata');
    setSelectedId(id);
  };

  const closeDrawer = () => {
    setDraft(null);
    setPendingEdits({});
    setSelectedId(null);
  };

  /** Every drawer field goes through here so it stays unsaved until Save. */
  const setField = (key, value) => {
    if (draft) setDraft((prev) => ({ ...prev, [key]: value }));
    else setPendingEdits((prev) => ({ ...prev, [key]: value }));
  };

  const setIndexing = (key, value) =>
    setField('indexing_cols', { ...(current?.indexing_cols || {}), [key]: value });

  const setDetail = (key, value) =>
    setField('details', { ...(current?.details || {}), [key]: value });

  const handleAddPublication = () => {
    setPendingEdits({});
    setSelectedId(null);
    setDrawerTab('metadata');
    setDraft({
      id: `manual-${Date.now()}`,
      section: '',
      category: 'International Journal',
      year: new Date().getFullYear().toString(),
      pub_time: '',
      ueh_declared: '',
      ueh_reward: '',
      title: '',
      authors: '',
      journal_conference: '',
      indexing: [],
      citation: '',
      details: { ...EMPTY_DETAILS },
      indexing_cols: { ssci: '', scie: '', ahci: '', scopus: '', esci: '' },
    });
  };

  /** Keeps the row in this browser when there's no backend, or a write failed. */
  const commitLocally = (row) => {
    const next = draft
      ? [row, ...publications]
      : publications.map((p) => (p.id === row.id ? row : p));
    setPublications(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  };

  const handleSave = async () => {
    if (!current) return;
    if (!current.title?.trim()) {
      alert(vi ? 'Nhập tên bài báo trước khi lưu.' : 'Enter a title before saving.');
      return;
    }
    if (!window.confirm(vi ? 'Bạn có chắc chắn muốn lưu thay đổi?' : 'Are you sure you want to save your changes?')) return;

    const isDbRow = dbIdOf(current.id) !== null;
    if (isLive && (draft || isDbRow)) {
      try {
        if (draft) await insertPublication(current);
        else await updatePublication(current.id, pendingEdits);
        await reload();
        closeDrawer();
        return;
      } catch (e) {
        alert(writeFailedMessage(e, lang));
        // Fall through: keep the work in this browser so it isn't lost.
      }
    }

    commitLocally(current);
    closeDrawer();
  };

  const handleDelete = async () => {
    if (!current) return;
    if (draft) { closeDrawer(); return; }   // discarding an unsaved draft
    if (!window.confirm(vi ? 'Bạn có chắc muốn xóa bài báo này?' : 'Are you sure you want to delete this publication?')) return;

    if (isLive && dbIdOf(current.id) !== null) {
      try {
        await deletePublication(current.id);
        await reload();
        closeDrawer();
        return;
      } catch (e) {
        // Refuse to hide it locally: it still exists in the shared database.
        alert(writeFailedMessage(e, lang));
        return;
      }
    }

    const next = publications.filter((p) => p.id !== current.id);
    setPublications(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    closeDrawer();
  };

  // Filtering
  const filteredData = useMemo(() => {
    return publications.filter(item => {
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'Book_Chapter') {
          if (item.category !== 'Book' && item.category !== 'Book Chapter') return false;
        } else if (item.category !== categoryFilter) return false;
      }

      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        (item.title || '').toLowerCase().includes(q) ||
        (item.authors || '').toLowerCase().includes(q) ||
        (item.journal_conference || '').toLowerCase().includes(q) ||
        (item.year || '').includes(q)
      );
    });
  }, [publications, categoryFilter, query]);

  // Sort by year (descending), then alphabetically by title
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const yearA = parseInt(a.year) || 0;
      const yearB = parseInt(b.year) || 0;
      if (yearB !== yearA) return yearB - yearA;
      return (a.title || '').localeCompare(b.title || '');
    });
  }, [filteredData]);

  const handleCopyCitation = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Exports the currently filtered/sorted rows, including the fields that live
  // in the drawer — opens directly in Excel/Sheets.
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

  const label = 'text-[10px] font-bold text-neutral-400 uppercase';
  const input = 'w-full mt-1 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-[#8b0000] focus:ring-1 focus:ring-[#8b0000] focus:outline-none transition-all rounded-none';

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 font-ibm text-neutral-900 bg-white">

      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 bg-neutral-50 p-2.5 border border-neutral-200/60 shrink-0">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={vi ? 'Tìm theo tên bài báo, tác giả, tạp chí...' : 'Search by title, author, journal...'}
            className="w-full pl-9 pr-3 py-1.5 border border-neutral-200 bg-white text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-[#8b0000] focus:ring-1 focus:ring-[#8b0000] focus:outline-none transition-all rounded-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-neutral-200 bg-white px-2.5 py-1.5 text-xs focus:border-[#8b0000] focus:outline-none rounded-none text-neutral-700 font-medium"
        >
          <option value="all">{vi ? 'Tất cả thể loại' : 'All Categories'}</option>
          <option value="International Journal">{vi ? 'Tạp chí Quốc tế' : 'International Journals'}</option>
          <option value="International Conference">{vi ? 'Hội thảo Quốc tế' : 'International Conferences'}</option>
          <option value="Domestic Journal">{vi ? 'Tạp chí Trong nước' : 'Domestic Journals'}</option>
          <option value="Domestic Conference">{vi ? 'Hội thảo Trong nước' : 'Domestic Conferences'}</option>
          <option value="Book_Chapter">{vi ? 'Sách & Chương sách' : 'Books & Chapters'}</option>
        </select>

        <button
          type="button"
          onClick={handleExportCsv}
          className="ml-auto inline-flex items-center gap-1.5 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:border-[#8b0000] hover:text-[#8b0000] transition-colors rounded-none"
        >
          <Download className="h-3.5 w-3.5" />
          {vi ? 'Xuất CSV' : 'Export CSV'}
        </button>

        <button
          type="button"
          onClick={handleAddPublication}
          className="inline-flex items-center gap-1.5 border border-neutral-900 bg-neutral-900 text-white px-2.5 py-1.5 text-xs font-semibold hover:bg-[#8b0000] hover:border-[#8b0000] transition-colors rounded-none"
        >
          <Plus className="h-3.5 w-3.5" />
          {vi ? 'Thêm bài báo' : 'Add Publication'}
        </button>
      </div>

      {/* 2. Data table — read-only, same as the Research List: a row opens the
          drawer, it is never edited in place. */}
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
                  {vi ? 'Không tìm thấy kết quả nào.' : 'No publications found matching criteria.'}
                </td>
              </tr>
            ) : (
              sortedData.map((item, idx) => (
                <tr
                  key={item.id}
                  onClick={() => openRow(item.id)}
                  className={`group cursor-pointer hover:bg-neutral-50/80 transition-colors ${
                    selectedId === item.id ? '!bg-red-50/40' : ''
                  }`}
                >
                  <td className="px-3 py-3.5 text-center text-neutral-400 font-mono border-r border-neutral-100">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-3.5 text-center font-mono text-xs font-bold text-[#8b0000] border-r border-neutral-100">
                    {item.year}
                  </td>
                  <td className="px-3 py-3.5 border-r border-neutral-100">
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-[#8b0000] leading-relaxed break-words">
                      {item.title || (vi ? 'Chưa có tên' : 'Untitled')}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-neutral-600 leading-normal break-words border-r border-neutral-100">
                    {item.authors}
                  </td>
                  <td className="px-3 py-3.5 text-neutral-700 italic leading-normal break-words">
                    {item.journal_conference}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. Slide-in drawer — same shape as the Research List's */}
      {current && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-all duration-300"
            onClick={closeDrawer}
          />

          <div className="fixed right-0 top-0 z-50 h-screen w-[35vw] bg-white shadow-2xl border-l border-neutral-200 flex flex-col font-ibm">

            <div className="p-5 border-b border-neutral-100 bg-neutral-900 text-white flex items-center justify-between">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-mono tracking-widest text-[#8b0000] bg-[#8b0000]/10 px-2 py-0.5 border border-[#8b0000]/30 font-bold block w-fit mb-1.5 uppercase">
                  {current.category || (vi ? 'CHƯA PHÂN LOẠI' : 'UNCATEGORISED')}{current.year ? ` · ${current.year}` : ''}
                </span>
                <h2 className="font-barlow text-base font-black uppercase tracking-wide truncate" title={current.title}>
                  {current.title || (vi ? 'Bài báo mới' : 'New publication')}
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex border-b border-neutral-100 bg-white px-2">
              {[
                { key: 'metadata', label: vi ? 'Thông tin' : 'Metadata', icon: Briefcase },
                { key: 'classification', label: vi ? 'Phân loại' : 'Classification', icon: Tag },
                { key: 'citation', label: vi ? 'Trích dẫn' : 'Citation', icon: Quote },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setDrawerTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide border-b-2 transition-colors ${
                    drawerTab === t.key
                      ? 'border-[#8b0000] text-[#8b0000]'
                      : 'border-transparent text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {drawerTab === 'metadata' && (
                <div className="space-y-4">
                  <div>
                    <label className={label}>{vi ? 'Tên bài báo' : 'Title'}</label>
                    <textarea
                      rows={3}
                      value={current.title || ''}
                      onChange={(e) => setField('title', e.target.value)}
                      className={`${input} resize-y`}
                    />
                  </div>

                  <div>
                    <label className={label}>{vi ? 'Tác giả' : 'Authors'}</label>
                    <textarea
                      rows={2}
                      value={current.authors || ''}
                      onChange={(e) => setField('authors', e.target.value)}
                      className={`${input} resize-y`}
                    />
                  </div>

                  <div>
                    <label className={label}>{vi ? 'Tạp chí / Nhà xuất bản' : 'Journal / Publisher'}</label>
                    <textarea
                      rows={2}
                      value={current.journal_conference || ''}
                      onChange={(e) => setField('journal_conference', e.target.value)}
                      className={`${input} resize-y`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={label}>{vi ? 'Thể loại' : 'Category'}</label>
                      <select
                        value={current.category || ''}
                        onChange={(e) => setField('category', e.target.value)}
                        className={input}
                      >
                        <option value="">{vi ? 'Không có' : 'None'}</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={label}>{vi ? 'Mục trong danh sách' : 'Section'}</label>
                      <input
                        value={current.section || ''}
                        onChange={(e) => setField('section', e.target.value)}
                        className={input}
                      />
                    </div>
                    <div>
                      <label className={label}>{vi ? 'Năm công bố' : 'Pub. year'}</label>
                      <input
                        value={current.year || ''}
                        onChange={(e) => setField('year', e.target.value)}
                        className={`${input} font-mono`}
                      />
                    </div>
                    <div>
                      <label className={label}>{vi ? 'Thời gian công bố' : 'Pub. time'}</label>
                      <input
                        value={current.pub_time || ''}
                        onChange={(e) => setField('pub_time', e.target.value)}
                        placeholder="9/2025"
                        className={`${input} font-mono`}
                      />
                    </div>
                    <div>
                      <label className={label}>{vi ? 'Khai báo UEH' : 'UEH declared'}</label>
                      <input
                        value={current.ueh_declared || ''}
                        onChange={(e) => setField('ueh_declared', e.target.value)}
                        className={`${input} font-mono`}
                      />
                    </div>
                    <div>
                      <label className={label}>{vi ? 'Đăng ký thưởng' : 'UEH reward'}</label>
                      <input
                        value={current.ueh_reward || ''}
                        onChange={(e) => setField('ueh_reward', e.target.value)}
                        className={`${input} font-mono`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'classification' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-l-2 border-[#8b0000] pl-2 mb-2">
                      {vi ? 'Chỉ mục' : 'Indexing'}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {INDEXING_FIELDS.map(({ key, label: l }) => (
                        <div key={key}>
                          <label className={label}>{l}</label>
                          <input
                            value={current.indexing_cols?.[key] || ''}
                            onChange={(e) => setIndexing(key, e.target.value)}
                            placeholder="—"
                            className={`${input} font-mono`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-l-2 border-[#8b0000] pl-2 mb-2">
                      {vi ? 'Trụ cột khung' : 'Framework Pillars'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {CHECKLIST_FIELDS.map(({ key, label: l }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setDetail(key, !current.details?.[key])}
                          className="flex items-center gap-1.5 text-[11px] text-neutral-600 hover:text-neutral-900"
                        >
                          {current.details?.[key]
                            ? <CheckSquare className="h-3.5 w-3.5 text-[#8b0000] shrink-0" />
                            : <Square className="h-3.5 w-3.5 text-neutral-300 shrink-0" />}
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={label}>{vi ? 'Từ khoá' : 'Keywords'}</label>
                      <input
                        value={current.details?.keywords || ''}
                        onChange={(e) => setDetail('keywords', e.target.value)}
                        className={input}
                      />
                    </div>
                    <div>
                      <label className={label}>{vi ? 'Tập, số, trang' : 'Vol, issue, pages'}</label>
                      <input
                        value={current.details?.pages || ''}
                        onChange={(e) => setDetail('pages', e.target.value)}
                        className={input}
                      />
                    </div>
                  </div>
                </div>
              )}

              {drawerTab === 'citation' && (
                <div className="space-y-4">
                  <div>
                    <label className={label}>
                      APA Citation
                      {!current.citation && (
                        <span className="ml-1.5 normal-case font-medium text-neutral-300">
                          — {vi ? 'tự động tạo, sửa để chốt' : 'auto-generated, edit to finalize'}
                        </span>
                      )}
                    </label>
                    <textarea
                      rows={6}
                      value={current.citation || buildAutoCitation(current)}
                      onChange={(e) => setField('citation', e.target.value)}
                      className={`${input} italic leading-relaxed resize-y`}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCitation(current.id, current.citation || buildAutoCitation(current))}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase border border-neutral-200 hover:border-[#8b0000] hover:text-[#8b0000] bg-white transition-colors text-neutral-700 font-sans"
                      >
                        {copiedId === current.id
                          ? <><Check className="h-3 w-3 text-emerald-600" />Copied</>
                          : <><Clipboard className="h-3 w-3" />Copy APA</>}
                      </button>
                      <a
                        href={`https://scholar.google.com/scholar?q=${encodeURIComponent(current.title || '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase border border-neutral-900 bg-neutral-900 text-white hover:bg-[#8b0000] transition-colors font-sans"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Scholar
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-2 border-t border-neutral-100">
                    <div>
                      <label className={label}>DOI / {vi ? 'trang bài báo' : 'article page'}</label>
                      <input
                        value={current.details?.doi_url || ''}
                        onChange={(e) => setDetail('doi_url', e.target.value)}
                        placeholder="https://doi.org/..."
                        className={input}
                      />
                    </div>
                    <div>
                      <label className={label}>{vi ? 'Bản lưu (Drive)' : 'Full text (Drive)'}</label>
                      <input
                        value={current.details?.drive_url || ''}
                        onChange={(e) => setDetail('drive_url', e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className={input}
                      />
                    </div>
                    {(current.details?.doi_url || current.details?.drive_url) && (
                      <div className="flex flex-wrap gap-2">
                        {current.details?.doi_url && (
                          <a
                            href={current.details.doi_url.replace(/^doi:/i, 'https://doi.org/')}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 border border-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 hover:border-[#8b0000] hover:text-[#8b0000]"
                          >
                            <ExternalLink className="h-3 w-3" />DOI
                          </a>
                        )}
                        {current.details?.drive_url && (
                          <a
                            href={current.details.drive_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 border border-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 hover:border-[#8b0000] hover:text-[#8b0000]"
                          >
                            <ExternalLink className="h-3 w-3" />{vi ? 'Bản lưu' : 'Full text'}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 p-4 border-t border-neutral-100 bg-neutral-50">
              <button
                onClick={handleDelete}
                className="border border-neutral-300 text-neutral-500 hover:border-[#8b0000] hover:text-[#8b0000] font-bold uppercase tracking-wider px-4 py-2 text-xs transition-colors rounded-none"
              >
                {draft ? (vi ? 'Huỷ' : 'Discard') : (vi ? 'Xoá' : 'Delete')}
              </button>
              <button
                onClick={handleSave}
                className="bg-neutral-900 hover:bg-[#8b0000] text-white font-bold uppercase tracking-wider px-5 py-2 text-xs transition-colors rounded-none"
              >
                {vi ? 'Lưu' : 'Save'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
