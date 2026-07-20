import { useState, useEffect, useMemo } from 'react';
import {
  Folder, FolderOpen, FileText, ChevronRight, ChevronDown,
  Search, BookOpen, AlertCircle, Info, Landmark, HelpCircle, Download, GraduationCap,
  Table2, Database, Server, Users, Link, Paperclip, UploadCloud, Check, CheckSquare, Briefcase, X, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { supabase, isLive } from '../lib/supabaseClient.js';
import { researchList as fallbackRows, RESEARCH_UNITS } from '../data/researchList.js';
import { ISCM_MEMBERS } from '../data/iscmMembers.js';
import ResearchListTable from '../components/research/ResearchListTable.jsx';
import ResearchWorkload from '../components/research/ResearchWorkload.jsx';
import ResearchPublications from '../components/research/ResearchPublications.jsx';
import DataCatalog from '../components/research/DataCatalog.jsx';
import DataSubmit from '../components/research/DataSubmit.jsx';

const STORE_KEY = 'iscm_research_list_edits_v1';

function loadStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    return {
      cellEdits: parsed.cellEdits ?? {},
      customColumns: parsed.customColumns ?? [],
      extraRows: parsed.extraRows ?? [],
      deletedRowIds: parsed.deletedRowIds ?? [],
    };
  } catch {
    return { cellEdits: {}, customColumns: [], extraRows: [], deletedRowIds: [] };
  }
}

function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

// UN SDG definitions
const ALL_SDGS = [
  { id: 'SDG1', label: '1. No Poverty', color: '#e5243b' },
  { id: 'SDG2', label: '2. Zero Hunger', color: '#dda63a' },
  { id: 'SDG3', label: '3. Good Health & Well-being', color: '#4c9f38' },
  { id: 'SDG4', label: '4. Quality Education', color: '#c5192d' },
  { id: 'SDG5', label: '5. Gender Equality', color: '#ff3a21' },
  { id: 'SDG6', label: '6. Clean Water & Sanitation', color: '#26bde2' },
  { id: 'SDG7', label: '7. Affordable & Clean Energy', color: '#fcc30b' },
  { id: 'SDG8', label: '8. Decent Work & Economic Growth', color: '#a21942' },
  { id: 'SDG9', label: '9. Industry, Innovation & Infrastructure', color: '#fd6925' },
  { id: 'SDG10', label: '10. Reduced Inequalities', color: '#dd1367' },
  { id: 'SDG11', label: '11. Sustainable Cities & Communities', color: '#fd9d24' },
  { id: 'SDG12', label: '12. Responsible Consumption & Production', color: '#c9933b' },
  { id: 'SDG13', label: '13. Climate Action', color: '#3f7e44' },
  { id: 'SDG14', label: '14. Life Below Water', color: '#0a97d9' },
  { id: 'SDG15', label: '15. Life on Land', color: '#56c02b' },
  { id: 'SDG16', label: '16. Peace, Justice & Strong Institutions', color: '#00689d' },
  { id: 'SDG17', label: '17. Partnerships for the Goals', color: '#19486a' }
];

const STATUS_OPTIONS = ['In progress', 'Completed', 'Cancel', 'Not start', 'Failed'];

// Only a Research Unit's Main Folder is one of these three labs — every
// other (child) task uses the regular task-type list below instead.
const MAIN_FOLDER_TASK_TYPES = [
  { value: 'IRL', label: 'International Research Lab (IRL)' },
  { value: 'PL', label: 'Policy Lab (PL)' },
  { value: 'TIL', label: 'Technology & Innovation Lab (TIL)' },
];

const PILLARS = [
  { key: 'framework_transition', label: 'Framework Transition' },
  { key: 'glocal_design', label: 'Glocal Design' },
  { key: 'human_centric_orientation', label: 'Human Centric Orientation' },
  { key: 'tech_solutions', label: 'Tech Solutions' },
  { key: 'urban_system', label: 'Urban System' },
];

export default function ResearchSubWorkspace() {
  const { lang } = useLanguage();
  const [selectedNode, setSelectedNode] = useState('research-list');

  // Shared Data States
  const [rows, setRows] = useState(null);
  const [researchUnits, setResearchUnits] = useState(RESEARCH_UNITS);
  const [taskTypes, setTaskTypes] = useState([
    'Research',
    'Paper',
    'Training',
    'New initiative',
    'Student research',
    'Fund Raising',
    'Project',
    'Event'
  ]);
  const [source, setSource] = useState('local');
  const [store, setStore] = useState(loadStore);
  const [selectedTask, setSelectedTask] = useState(null);
  // A newly-added task/unit stays here (not in `store`) until Save is
  // pressed — clicking "+ Add task"/"+ New Unit" no longer commits
  // anything by itself.
  const [draftRow, setDraftRow] = useState(null);
  const [drawerTab, setDrawerTab] = useState('metadata'); // 'metadata' | 'members' | 'documents' | 'tags'

  // File Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sync edits to LocalStorage
  useEffect(() => {
    saveStore(store);
  }, [store]);

  // Load database rows on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isLive) { setRows(fallbackRows); return; }
      try {
        const { data, error } = await supabase
          .from('iscm_research_list')
          .select('*')
          .order('research_unit', { ascending: true })
          .order('code', { ascending: true, nullsFirst: false });
        if (cancelled) return;
        if (error || !data || data.length === 0) {
          setRows(fallbackRows);
        } else {
          setRows(data);
          setSource(source => 'live');
        }
      } catch {
        if (!cancelled) setRows(fallbackRows);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const allRows = useMemo(() => {
    if (!rows) return [];
    const deleted = new Set(store.deletedRowIds || []);
    return [...rows, ...store.extraRows].filter((r) => !deleted.has(r.id));
  }, [rows, store.extraRows, store.deletedRowIds]);

  // Apply cell edits dynamically
  const allRowsResolved = useMemo(() => {
    return allRows.map((r) => {
      const resolved = { ...r };
      const edits = store.cellEdits[r.id] || {};
      Object.keys(edits).forEach((k) => {
        resolved[k] = edits[k];
      });
      return resolved;
    });
  }, [allRows, store.cellEdits]);

  const setCell = (rowId, key, value) => {
    // A draft (not-yet-saved) row lives only in local state — edit it
    // directly instead of writing cellEdits for a row that isn't in the
    // store yet.
    if (draftRow && rowId === draftRow.id) {
      setDraftRow((prev) => ({ ...prev, [key]: value }));
      return;
    }
    setStore((prev) => ({
      ...prev,
      cellEdits: {
        ...prev.cellEdits,
        [rowId]: { ...prev.cellEdits[rowId], [key]: value },
      },
    }));
  };

  // A new task/unit is only ever handed to us as a draft — nothing is
  // written to the store until Save is pressed.
  const createDraft = (newRow) => {
    setDraftRow({ ...newRow, isDraft: true });
    setSelectedTask(newRow);
  };

  // Closing the drawer (header X, backdrop click, Close/Delete-on-draft)
  // always discards any unsaved draft.
  const closeDrawer = () => {
    setDraftRow(null);
    setSelectedTask(null);
  };

  // A code like RU8.4.1 requires RU8.4 to already exist as a real row —
  // otherwise it's an orphaned WBS segment with no real parent to nest
  // under. Returns an error string to report, or null if the code is fine.
  const validateTaskCode = (row) => {
    const code = (row.code || '').trim();
    if (!code || !code.includes('.')) return null;
    const parts = code.split('.');
    const parentCode = parts.slice(0, -1).join('.');
    const parentExists = allRowsResolved.some((r) => r.id !== row.id && (r.code || '').trim() === parentCode);
    if (!parentExists) {
      return lang === 'vi'
        ? `Không thể lưu: mã cha "${parentCode}" chưa tồn tại. Hãy tạo "${parentCode}" trước khi dùng mã "${code}".`
        : `Cannot save: parent code "${parentCode}" doesn't exist yet. Create "${parentCode}" first before using code "${code}".`;
    }
    return null;
  };

  // Validates, confirms, and (for a draft) commits the new row to the store.
  const saveTask = () => {
    const err = validateTaskCode(currentSelectedTask);
    if (err) { alert(err); return; }
    const ok = window.confirm(
      lang === 'vi' ? 'Bạn có chắc chắn muốn lưu thay đổi?' : 'Are you sure you want to save your changes?'
    );
    if (!ok) return;
    if (draftRow) {
      setStore((prev) => ({ ...prev, extraRows: [...prev.extraRows, draftRow] }));
    }
    setDraftRow(null);
    setSelectedTask(null);
  };

  // Deletes a row (always confirms; the message also warns about any
  // WBS-code descendants that would be deleted along with it). Deleting an
  // unsaved draft is just discarding it — nothing exists to remove yet.
  const deleteTask = (row) => {
    if (draftRow && row?.id === draftRow.id) {
      closeDrawer();
      return;
    }
    const code = (row.code || '').trim();
    const descendantIds = code
      ? allRowsResolved.filter((r) => (r.code || '').trim().startsWith(code + '.')).map((r) => r.id)
      : [];
    const idsToDelete = [row.id, ...descendantIds];

    const ok = window.confirm(
      descendantIds.length > 0
        ? (lang === 'vi'
            ? `Bạn có chắc chắn muốn xoá "${row.task_name}"? Thao tác này sẽ xoá luôn ${descendantIds.length} mục con bên trong.`
            : `Are you sure you want to delete "${row.task_name}"? This will also delete ${descendantIds.length} item(s) inside it.`)
        : (lang === 'vi'
            ? `Bạn có chắc chắn muốn xoá "${row.task_name}"?`
            : `Are you sure you want to delete "${row.task_name}"?`)
    );
    if (!ok) return;

    setStore((prev) => {
      const extraIds = new Set(prev.extraRows.filter((r) => idsToDelete.includes(r.id)).map((r) => r.id));
      const idsForDeletedList = idsToDelete.filter((id) => !extraIds.has(id));
      return {
        ...prev,
        extraRows: prev.extraRows.filter((r) => !idsToDelete.includes(r.id)),
        deletedRowIds: Array.from(new Set([...(prev.deletedRowIds || []), ...idsForDeletedList])),
      };
    });

    if (idsToDelete.includes(selectedTask?.id)) {
      setSelectedTask(null);
    }
  };

  // Helper to normalize and resolve names for matching
  const getShortNamesForMember = (member) => {
    const names = [];
    const cleanVi = member.nameVi.replace(/^(PGS\.|TS\.|ThS\.|KTS\.|CN\.)\s*/g, '').trim();
    names.push(cleanVi);
    const wordsVi = cleanVi.split(' ');
    const firstNameVi = wordsVi[wordsVi.length - 1];
    names.push(firstNameVi);
    if (wordsVi.length >= 2) {
      names.push(wordsVi.slice(-2).join(' '));
      names.push(wordsVi.slice(-2).join(''));
    }
    const cleanEn = member.nameEn.split(',')[0].trim();
    names.push(cleanEn);
    const wordsEn = cleanEn.split(' ');
    const firstNameEn = wordsEn[wordsEn.length - 1];
    names.push(firstNameEn);
    if (wordsEn.length >= 2) {
      names.push(wordsEn.slice(-2).join(' '));
      names.push(wordsEn.slice(-2).join(''));
    }
    if (member.id === 'm01') {
      names.push('tú anh', 'tu anh', 'tuanh-lead', 'tuanh');
    }
    return [...new Set(names.map(n => n.toLowerCase().trim()))];
  };

  const isMemberMatch = (member, targetStr) => {
    if (!targetStr) return false;
    const target = targetStr.toLowerCase();
    const searchTerms = getShortNamesForMember(member);
    return searchTerms.some(term => {
      if (target.includes(term)) return true;
      const normTarget = target.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normTerm = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normTarget.includes(normTerm)) return true;
      return false;
    });
  };

  const resolveMemberFullName = (shortName) => {
    if (!shortName) return '';
    const member = ISCM_MEMBERS.find(m => isMemberMatch(m, shortName));
    if (member) {
      return member.nameVi.replace(/^(PGS\.|TS\.|ThS\.|KTS\.|CN\.)\s*/g, '').trim();
    }
    return shortName;
  };

  const resolveMemberFullNameAndTitle = (nameStr) => {
    if (!nameStr) return '';
    const clean = nameStr.trim();
    const member = ISCM_MEMBERS.find(m => isMemberMatch(m, clean));
    if (member) {
      return member.nameVi;
    }
    return clean;
  };

  // Find currently active selected task in resolved rows
  const currentSelectedTask = useMemo(() => {
    if (!selectedTask) return null;
    if (draftRow && selectedTask.id === draftRow.id) return draftRow;
    return allRowsResolved.find((r) => r.id === selectedTask.id) || null;
  }, [selectedTask, allRowsResolved, draftRow]);

  // Main Folder rows are limited to the 3 lab-designation task types
  // (IRL/PL/TIL); every other (child) task picks from the regular list.
  const isMainFolderSelected = currentSelectedTask
    ? (currentSelectedTask.task_name || '').toLowerCase().includes('main folder')
      || /^RU\s*\d+$/.test((currentSelectedTask.code || '').trim())
    : false;

  // Always land back on the Metadata tab when a different task is opened
  useEffect(() => {
    setDrawerTab('metadata');
  }, [selectedTask?.id]);

  // Roster / Outside Members partition and handlers
  const { rosterMembers, outsideMembers } = useMemo(() => {
    if (!currentSelectedTask?.members) return { rosterMembers: [], outsideMembers: [] };
    const list = currentSelectedTask.members.split(',').map(m => m.trim()).filter(Boolean);
    const roster = [];
    const outside = [];
    list.forEach(name => {
      const isRoster = ISCM_MEMBERS.some(m => isMemberMatch(m, name));
      if (isRoster) {
        const resolved = resolveMemberFullName(name);
        if (!roster.includes(resolved)) roster.push(resolved);
      } else {
        if (!outside.includes(name)) outside.push(name);
      }
    });
    return { rosterMembers: roster, outsideMembers: outside };
  }, [currentSelectedTask?.members]);

  const handleRosterChange = (nextRoster) => {
    if (!currentSelectedTask) return;
    const merged = [...nextRoster, ...outsideMembers].join(', ');
    setCell(currentSelectedTask.id, 'members', merged);
  };

  const handleOutsideChange = (nextOutside) => {
    if (!currentSelectedTask) return;
    const merged = [...rosterMembers, ...nextOutside].join(', ');
    setCell(currentSelectedTask.id, 'members', merged);
  };

  // Roster Members multi-select component
  const RosterMemberSelect = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const toggleMember = (memberName) => {
      let next;
      if (value.includes(memberName)) {
        next = value.filter(m => m !== memberName);
      } else {
        next = [...value, memberName];
      }
      onChange(next);
    };

    return (
      <div className="relative font-ibm">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-[36px] w-full mt-1 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus-within:border-[#8b0000] focus-within:ring-1 focus-within:ring-[#8b0000] transition-all cursor-pointer flex flex-wrap gap-1 items-center"
        >
          {value.length === 0 && <span className="text-neutral-400">Select Roster Members...</span>}
          {value.map(m => (
            <span key={m} className="inline-flex items-center gap-1 bg-[#8b0000]/10 border border-[#8b0000]/20 text-[#8b0000] px-2 py-0.5 text-[10px] font-bold">
              {resolveMemberFullNameAndTitle(m)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMember(m);
                }}
                className="hover:text-black shrink-0"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto border border-neutral-200 bg-white shadow-lg text-xs">
              {ISCM_MEMBERS.map(member => {
                const name = member.nameVi.replace(/^(PGS\.|TS\.|ThS\.|KTS\.|CN\.)\s*/g, '').trim();
                const isSelected = value.includes(name) || value.some(m => m.toLowerCase() === name.toLowerCase());
                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(name)}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-neutral-50 ${isSelected ? 'bg-red-50/50 text-[#8b0000] font-bold' : ''}`}
                  >
                    <span>{member.nameVi} ({member.titleVi})</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#8b0000]" />}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  // Outside Members tag selector component
  const OutsideMemberSelect = ({ value, onChange }) => {
    const [externalName, setExternalName] = useState('');

    const removeMember = (name) => {
      onChange(value.filter(m => m !== name));
    };

    const addMember = (e) => {
      e.preventDefault();
      const name = externalName.trim();
      if (name && !value.some(m => m.toLowerCase() === name.toLowerCase())) {
        onChange([...value, name]);
        setExternalName('');
      }
    };

    return (
      <div className="font-ibm mt-1 border border-neutral-200 bg-white p-2 flex flex-col gap-2">
        <div className="flex flex-wrap gap-1 items-center min-h-[24px]">
          {value.length === 0 && <span className="text-neutral-400 text-xs italic">No outside members.</span>}
          {value.map(m => (
            <span key={m} className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200 text-neutral-700 px-2 py-0.5 text-[10px] font-bold">
              {m}
              <button
                type="button"
                onClick={() => removeMember(m)}
                className="hover:text-black shrink-0"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1.5 border-t border-neutral-100 pt-2 mt-1">
          <input
            type="text"
            value={externalName}
            onChange={(e) => setExternalName(e.target.value)}
            placeholder="Enter outside member name..."
            className="flex-1 border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-[#8b0000] focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addMember(e);
              }
            }}
          />
          <button
            type="button"
            onClick={addMember}
            className="bg-neutral-900 hover:bg-[#8b0000] text-white px-3 py-1 text-[10px] font-bold uppercase shrink-0 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    );
  };

    const DOCUMENT_CONTENTS = useMemo(() => {
    return {
      'research-list': {
        title: lang === 'vi' ? 'Danh sách đề tài NCKH' : 'RESEARCH LIST — 2026 ISCM RESEARCH ACTIVITIES',
        updated: lang === 'vi' ? 'Đồng bộ trực tiếp từ Supabase' : 'SCIENTIFIC RESEARCH OPERATIONS · SYNCED WITH SUPABASE',
        author: lang === 'vi' ? 'TS. Phạm Nguyễn Hoài (Trưởng bộ phận Nghiên cứu Khoa học)' : 'Hoai Nguyen Pham, PhD (Head of Research)',
        icon: Table2,
        body: (
          <ResearchListTable
            allRowsResolved={allRowsResolved}
            setCell={setCell}
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
            store={store}
            onCreateDraft={createDraft}
            source={source}
            researchUnits={researchUnits}
            setResearchUnits={setResearchUnits}
            taskTypes={taskTypes}
          />
        ),
      },
      'workload': {
        title: lang === 'vi' ? 'Khối lượng công việc' : 'WORKLOAD CAPACITY TRACKER',
        updated: lang === 'vi' ? 'Đồng bộ từ sơ đồ tổ chức' : 'STAFF WORK CAPACITY ANALYSIS',
        author: 'ISCM Lab Team',
        icon: Users,
        body: (
          <ResearchWorkload
            allRowsResolved={allRowsResolved}
            setSelectedTask={setSelectedTask}
            setCell={setCell}
          />
        ),
      },
      'publication-list': {
        title: lang === 'vi' ? 'Các công bố khoa học' : 'Publications — ISCM Scientific Research',
        updated: lang === 'vi' ? 'Đồng bộ từ thư viện công trình' : 'PUBLICATION INDEX · SYNCHRONIZED',
        author: 'ISCM Authors',
        icon: BookOpen,
        body: (
          <ResearchPublications lang={lang} />
        )
      },
      'data-submit': {
        title: lang === 'vi' ? 'Nộp tài sản dữ liệu' : 'Submit Data Asset',
        updated: lang === 'vi' ? 'Mở cho tất cả thành viên' : 'OPEN SUBMISSION · ALL MEMBERS',
        author: 'ISCM Members',
        icon: UploadCloud,
        body: (
          <DataSubmit lang={lang} />
        )
      },
      'data-catalog': {
        title: lang === 'vi' ? 'Tổng kho dữ liệu' : 'Data Catalog Dashboard',
        updated: lang === 'vi' ? 'Đồng bộ từ cổng thông tin địa lý' : 'APPROVED DATA CATALOG · CONTROLLED SHARING',
        author: 'ISCM Core Team',
        icon: Database,
        body: (
          <DataCatalog mode="core" lang={lang} />
        )
      },
      'central-catalog': {
        title: lang === 'vi' ? 'Dữ liệu chờ kiểm duyệt' : 'Central Data Asset Catalog',
        updated: lang === 'vi' ? 'Đường ống dữ liệu đang thẩm định' : 'STAGE BUFFER · INGESTION UNDER AUDIT',
        author: 'ISCM Ingestion Hub',
        icon: Server,
        body: (
          <DataCatalog mode="staging" lang={lang} />
        )
      }
    };
  }, [lang, allRowsResolved, selectedTask, store, source, researchUnits, taskTypes]);

  const activeDoc = DOCUMENT_CONTENTS[selectedNode] || DOCUMENT_CONTENTS['research-list'];
  const DocIcon = activeDoc.icon || FileText;

  const treeNodeClass = (key) =>
    `w-full text-left font-sans text-[11px] font-bold uppercase py-2 px-2.5 border-b border-neutral-100 transition-colors flex items-center justify-between rounded-none mt-1 mb-0.5 ${
      selectedNode === key
        ? '!bg-[#8b0000] !text-white !font-bold'
        : 'text-neutral-900 hover:bg-neutral-50'
    }`;

  // Handle simulated document upload drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && currentSelectedTask) {
      setUploading(true);
      setUploadProgress(0);
      const filename = files[0].name;
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploading(false);
            setCell(currentSelectedTask.id, 'report_plan_link', filename);
            return 100;
          }
          return prev + 25;
        });
      }, 150);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5 h-full relative">
      <header className="border-l-4 border-[#8b0000] pl-4 py-1 mb-2 flex flex-wrap items-start justify-between gap-3 rounded-none">
        <div>
          <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            {lang === 'vi' ? 'KHÔNG GIAN NGHIÊN CỨU KHOA HỌC' : 'Scientific Research Sub-Workspace'}
          </h1>
          <p className="font-ibm text-xs uppercase tracking-wider text-gray-500 mt-1">
            {lang === 'vi' ? 'Trưởng bộ phận' : 'Head of Department'}: <span className="font-semibold text-[#8b0000] font-barlow">{lang === 'vi' ? 'TS. Phạm Nguyễn Hoài' : 'Hoai Nguyen Pham, PhD'}</span>
          </p>
        </div>
      </header>

      {/* Two Column Layout: Sidebar + Content Area */}
      <div className="grid gap-6 md:grid-cols-10 items-start">

        {/* Left Side: Navigation Directory Sidebar */}
        <aside className="border border-neutral-200 bg-white p-2.5 md:col-span-2 rounded-none flex flex-col min-h-[600px]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8b0000] bg-neutral-50 border-b border-neutral-200 py-1.5 px-2 mb-2 select-none text-left font-sans">
            {lang === 'vi' ? 'NGHIÊN CỨU KHOA HỌC' : 'SCIENTIFIC RESEARCH'}
          </div>

          <div className="relative mb-3 shrink-0">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={lang === 'vi' ? 'Tìm kiếm tài liệu NCKH...' : 'Search research materials...'}
              className="w-full pl-8 pr-3 py-1.5 border border-neutral-200 bg-white font-ibm text-xs focus:border-[#8b0000] focus:outline-none text-iscm-charcoal placeholder:text-gray-400 rounded-none"
            />
          </div>

          <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-1">
            {/* ⚡ Tab navigation in exact requested order */}
            <div className="space-y-0.5">
              <button onClick={() => setSelectedNode('research-list')} className={treeNodeClass('research-list')}>
                <span className="truncate">{lang === 'vi' ? 'Danh sách đề tài NCKH' : 'Research List'}</span>
                <ChevronRight className={`h-3 w-3 shrink-0 ${selectedNode === 'research-list' ? 'text-white' : 'text-neutral-400'}`} />
              </button>
              
              <button onClick={() => setSelectedNode('workload')} className={treeNodeClass('workload')}>
                <span className="truncate">{lang === 'vi' ? 'Khối lượng công việc' : 'Workload'}</span>
                <ChevronRight className={`h-3 w-3 shrink-0 ${selectedNode === 'workload' ? 'text-white' : 'text-neutral-400'}`} />
              </button>

              <button onClick={() => setSelectedNode('publication-list')} className={treeNodeClass('publication-list')}>
                <span className="truncate">{lang === 'vi' ? 'Công bố khoa học' : 'Publications'}</span>
                <ChevronRight className={`h-3 w-3 shrink-0 ${selectedNode === 'publication-list' ? 'text-white' : 'text-neutral-400'}`} />
              </button>

              <button onClick={() => setSelectedNode('data-submit')} className={treeNodeClass('data-submit')}>
                <span className="truncate">{lang === 'vi' ? 'Nộp dữ liệu mới' : 'Submit Data Asset'}</span>
                <ChevronRight className={`h-3 w-3 shrink-0 ${selectedNode === 'data-submit' ? 'text-white' : 'text-neutral-400'}`} />
              </button>

              <button onClick={() => setSelectedNode('data-catalog')} className={treeNodeClass('data-catalog')}>
                <span className="truncate">{lang === 'vi' ? 'Tổng kho dữ liệu' : 'Data Catalog Dashboard'}</span>
                <ChevronRight className={`h-3 w-3 shrink-0 ${selectedNode === 'data-catalog' ? 'text-white' : 'text-neutral-400'}`} />
              </button>

              <button onClick={() => setSelectedNode('central-catalog')} className={treeNodeClass('central-catalog')}>
                <span className="truncate">{lang === 'vi' ? 'Dữ liệu chờ kiểm duyệt' : 'Central Data Asset Catalog'}</span>
                <ChevronRight className={`h-3 w-3 shrink-0 ${selectedNode === 'central-catalog' ? 'text-white' : 'text-neutral-400'}`} />
              </button>
            </div>
          </div>
        </aside>

        {/* Right Side: Content Area */}
        <main className="border border-neutral-200 bg-white p-5 md:col-span-8 rounded-none min-h-[600px] flex flex-col min-h-0">

          {/* Body content */}
          <div className="min-h-0 flex-1">{activeDoc.body}</div>

          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-ibm">
            <span>© Institute of Smart City and Management (ISCM-UEH)</span>
            <span>Security Protocol: SSL v3 + RLS Enabled</span>
          </div>
        </main>
      </div>

      {/* Shared Slide-in Detail Side Panel */}
      {selectedTask && currentSelectedTask && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-all duration-300"
            onClick={closeDrawer}
          />

          {/* Slide Drawer (35vw) */}
          <div className="fixed right-0 top-0 z-50 h-screen w-[35vw] bg-white shadow-2xl border-l border-neutral-200 flex flex-col transition-transform duration-300 transform translate-x-0 font-ibm">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-100 bg-neutral-900 text-white flex items-center justify-between">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-mono tracking-widest text-[#8b0000] bg-[#8b0000]/10 px-2 py-0.5 border border-[#8b0000]/30 font-bold block w-fit mb-1.5 uppercase">
                  {currentSelectedTask.code || 'NO CODE'}
                </span>
                <h2 className="font-barlow text-base font-black uppercase tracking-wide truncate" title={currentSelectedTask.task_name}>
                  {currentSelectedTask.task_name || 'Untitled Task'}
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-white transition-all shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-neutral-100 bg-white px-2">
              {[
                { key: 'metadata', label: lang === 'vi' ? 'Thông tin' : 'Metadata', icon: Briefcase },
                { key: 'members', label: lang === 'vi' ? 'Thành viên' : 'Members', icon: Users },
                { key: 'documents', label: lang === 'vi' ? 'Tài liệu' : 'Documents', icon: FileText },
                { key: 'tags', label: lang === 'vi' ? 'Phân loại' : 'Classification', icon: CheckSquare },
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

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* Tab: Metadata */}
              {drawerTab === 'metadata' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-l-2 border-[#8b0000] pl-2 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-[#8b0000]" />
                  Core Metadata
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Code</label>
                    <input
                      type="text"
                      value={currentSelectedTask.code || ''}
                      onChange={(e) => setCell(currentSelectedTask.id, 'code', e.target.value)}
                      className="w-full mt-1 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-[#8b0000] focus:ring-1 focus:ring-[#8b0000] focus:outline-none transition-all rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Task Title</label>
                    <input
                      type="text"
                      value={currentSelectedTask.task_name || ''}
                      onChange={(e) => setCell(currentSelectedTask.id, 'task_name', e.target.value)}
                      className="w-full mt-1 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-[#8b0000] focus:ring-1 focus:ring-[#8b0000] focus:outline-none transition-all rounded-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Research Unit</label>
                    <select
                      value={currentSelectedTask.research_unit || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__add_new__') {
                          const newUnit = prompt(lang === 'vi' ? 'Nhập tên Đơn vị nghiên cứu mới:' : 'Enter new Research Unit name:');
                          if (newUnit && newUnit.trim()) {
                            const trimmed = newUnit.trim();
                            if (!researchUnits.includes(trimmed)) {
                              setResearchUnits(prev => [...prev, trimmed]);
                            }
                            setCell(currentSelectedTask.id, 'research_unit', trimmed);
                          }
                        } else {
                          setCell(currentSelectedTask.id, 'research_unit', val);
                        }
                      }}
                      className="w-full mt-1 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:border-[#8b0000] focus:outline-none rounded-none"
                    >
                      {researchUnits.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                      <option value="__add_new__" className="text-[#8b0000] font-bold">+ {lang === 'vi' ? 'Thêm Đơn vị...' : 'Add Unit...'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Task Type</label>
                    <select
                      value={currentSelectedTask.task_type || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__add_new__') {
                          const newType = prompt(lang === 'vi' ? 'Nhập tên Loại công việc mới:' : 'Enter new Task Type name:');
                          if (newType && newType.trim()) {
                            const trimmed = newType.trim();
                            if (!taskTypes.includes(trimmed)) {
                              setTaskTypes(prev => [...prev, trimmed]);
                            }
                            setCell(currentSelectedTask.id, 'task_type', trimmed);
                          }
                        } else {
                          setCell(currentSelectedTask.id, 'task_type', val);
                        }
                      }}
                      className="w-full mt-1 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:border-[#8b0000] focus:outline-none rounded-none"
                    >
                      {isMainFolderSelected ? (
                        MAIN_FOLDER_TASK_TYPES.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))
                      ) : (
                        <>
                          {taskTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                          <option value="__add_new__" className="text-[#8b0000] font-bold">+ {lang === 'vi' ? 'Thêm loại...' : 'Add Type...'}</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Coordinator Directory Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Coordinator / Manager</label>
                    <select
                      value={resolveMemberFullName(currentSelectedTask.coordinator_manager) || ''}
                      onChange={(e) => setCell(currentSelectedTask.id, 'coordinator_manager', e.target.value)}
                      className="w-full mt-1 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:border-[#8b0000] focus:outline-none rounded-none"
                    >
                      <option value="">Select Coordinator...</option>
                      {ISCM_MEMBERS.map((m) => {
                        const cleanName = m.nameVi.replace(/^(PGS\.|TS\.|ThS\.|KTS\.|CN\.)\s*/g, '').trim();
                        return (
                          <option key={m.id} value={cleanName}>
                            {m.nameVi} ({m.titleVi})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Status</label>
                    <select
                      value={currentSelectedTask.status || ''}
                      onChange={(e) => setCell(currentSelectedTask.id, 'status', e.target.value)}
                      className="w-full mt-1 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 focus:border-[#8b0000] focus:outline-none rounded-none"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Start Year</label>
                    <input
                      type="text"
                      value={currentSelectedTask.start_year || ''}
                      onChange={(e) => setCell(currentSelectedTask.id, 'start_year', e.target.value)}
                      className="w-full mt-1 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-[#8b0000] focus:ring-1 focus:ring-[#8b0000] focus:outline-none transition-all rounded-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">End Year</label>
                    <input
                      type="text"
                      value={currentSelectedTask.end_year || ''}
                      onChange={(e) => setCell(currentSelectedTask.id, 'end_year', e.target.value)}
                      placeholder="--"
                      className="w-full mt-1 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-[#8b0000] focus:ring-1 focus:ring-[#8b0000] focus:outline-none transition-all rounded-none"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Tab: Members */}
              {drawerTab === 'members' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-l-2 border-[#8b0000] pl-2 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#8b0000]" />
                  {lang === 'vi' ? 'Thành viên tham gia' : 'Members'}
                </h3>

                {/* Members (ISCM Roster) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Members (ISCM Roster)</label>
                  <RosterMemberSelect
                    value={rosterMembers}
                    onChange={handleRosterChange}
                  />
                </div>

                {/* Members (Outside ISCM) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Members (Outside ISCM)</label>
                  <OutsideMemberSelect
                    value={outsideMembers}
                    onChange={handleOutsideChange}
                  />
                </div>
              </div>
              )}

              {/* Tab: Documents */}
              {drawerTab === 'documents' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-l-2 border-[#8b0000] pl-2 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#8b0000]" />
                  Minute Report or Plan
                </h3>

                {currentSelectedTask.report_plan_link ? (
                  <div className="flex flex-col gap-2">
                    {currentSelectedTask.report_plan_link.startsWith('http') || currentSelectedTask.report_plan_link.toLowerCase().includes('doc') || currentSelectedTask.report_plan_link === 'Link' ? (
                      <a
                        href={currentSelectedTask.report_plan_link === 'Link' ? 'https://docs.google.com' : currentSelectedTask.report_plan_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50/60 border border-blue-100 hover:bg-blue-50 transition-colors w-full"
                      >
                        <Link className="h-4 w-4 shrink-0" />
                        <span>View Minute Report</span>
                        <ArrowRight className="h-3 w-3 ml-auto text-blue-400" />
                      </a>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-50 border border-neutral-200 w-full">
                        <Paperclip className="h-4 w-4 text-neutral-400 shrink-0" />
                        <span className="truncate">{currentSelectedTask.report_plan_link}</span>
                        <button
                          onClick={() => setCell(currentSelectedTask.id, 'report_plan_link', '')}
                          className="ml-auto text-neutral-400 hover:text-neutral-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400 italic">No document attached.</p>
                )}

                {/* Simulated Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer rounded-none group"
                >
                  {uploading ? (
                    <div className="w-full space-y-2 text-center">
                      <div className="text-xs font-bold text-neutral-600">Uploading Document...</div>
                      <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#8b0000] h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">{uploadProgress}%</div>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 text-neutral-300 group-hover:text-neutral-400 transition-colors" />
                      <div className="text-xs text-neutral-600 font-medium">
                        Drag & Drop document files here
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Supports PDF, Word, and Excel files
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Or Insert Document URL</label>
                  <input
                    type="text"
                    value={currentSelectedTask.report_plan_link || ''}
                    onChange={(e) => setCell(currentSelectedTask.id, 'report_plan_link', e.target.value)}
                    placeholder="https://docs.google.com/document/..."
                    className="w-full mt-1 border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-800 focus:border-[#8b0000] focus:ring-1 focus:ring-[#8b0000] focus:outline-none transition-all rounded-none"
                  />
                </div>
              </div>
              )}

              {/* Tab: Classification (Framework Pillars + SDGs) */}
              {drawerTab === 'tags' && (
              <>
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-l-2 border-[#8b0000] pl-2 flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-[#8b0000]" />
                  Framework Transition Pillars
                </h3>

                <div className="space-y-2 bg-neutral-50/60 p-3 border border-neutral-200/50">
                  {PILLARS.map(({ key, label }) => {
                    const isChecked = currentSelectedTask[key] && currentSelectedTask[key] !== 'Không';
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-3 cursor-pointer select-none py-1 group/checkbox"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setCell(currentSelectedTask.id, key, isChecked ? 'Không' : label);
                          }}
                          className="h-4 w-4 accent-[#8b0000]"
                        />
                        <span className={`text-xs font-medium ${isChecked ? 'text-neutral-900 font-semibold' : 'text-neutral-500'}`}>
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: SDGs */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 border-l-2 border-[#8b0000] pl-2 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-[#8b0000]" />
                  Sustainable Development Goals (SDG Tags)
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {ALL_SDGS.map((sdg) => {
                    const sdgsStr = currentSelectedTask.sdgs || '';
                    const isSelected = sdgsStr.split(',').map(s => s.trim()).includes(sdg.id);

                    return (
                      <button
                        key={sdg.id}
                        onClick={() => {
                          const list = sdgsStr.split(',').map(s => s.trim()).filter(Boolean);
                          let nextList;
                          if (isSelected) {
                            nextList = list.filter(item => item !== sdg.id);
                          } else {
                            nextList = [...list, sdg.id];
                          }
                          setCell(currentSelectedTask.id, 'sdgs', nextList.join(', '));
                        }}
                        className={`flex items-center gap-2 p-1.5 text-[10px] font-bold text-left uppercase transition-all duration-200 border ${
                          isSelected
                            ? 'bg-white border-neutral-300 text-neutral-900 shadow-sm'
                            : 'bg-neutral-50/50 border-neutral-200 text-neutral-400 hover:bg-neutral-50'
                        }`}
                        style={isSelected ? { borderLeft: `4px solid ${sdg.color}` } : {}}
                      >
                        <span
                          className="h-3 w-3 inline-block shrink-0"
                          style={{ backgroundColor: sdg.color }}
                        />
                        <span className="truncate">{sdg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              </>
              )}

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 p-4 border-t border-neutral-100 bg-neutral-50">
              <button
                onClick={() => deleteTask(currentSelectedTask)}
                className="border border-neutral-300 text-neutral-500 hover:border-[#8b0000] hover:text-[#8b0000] font-bold uppercase tracking-wider px-4 py-2 text-xs transition-colors rounded-none"
              >
                {lang === 'vi' ? 'Xoá' : 'Delete'}
              </button>
              <button
                onClick={saveTask}
                className="bg-neutral-900 hover:bg-[#8b0000] text-white font-bold uppercase tracking-wider px-5 py-2 text-xs transition-colors rounded-none"
              >
                {lang === 'vi' ? 'Lưu' : 'Save'}
              </button>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
