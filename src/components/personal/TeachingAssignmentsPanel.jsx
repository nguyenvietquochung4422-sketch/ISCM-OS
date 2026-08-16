import { useEffect, useState } from 'react';
import { Plus, ChevronDown, ChevronRight, Trash2, Ban } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.jsx';
import {
  TEACHING_ROLES, SESSION_TYPES,
  canManageTeaching, fetchCourses, createCourse, fetchAssignments, createAssignment, deleteAssignment,
  fetchAllSessions, createSession, cancelSession, deleteSession,
} from '../../data/teachingStore.js';
import { fetchAllAccounts } from '../../data/attendanceStore.js';

const inputClass = 'w-full rounded-none border border-neutral-300 bg-white px-2.5 py-1.5 font-ibm text-xs text-iscm-charcoal focus:border-iscm-crimson focus:outline-none';
const labelClass = 'block text-[10px] font-bold text-neutral-400 uppercase mb-1';

const EMPTY_COURSE = { course_code: '', course_name: '', program: '', credits: '' };
const EMPTY_ASSIGNMENT = { member_id: '', course_id: '', class_code: '', semester: '', academic_year: '', teaching_role: 'Lecturer' };
const EMPTY_SESSION = { session_date: '', start_time: '', end_time: '', room: '', campus: '', session_type: 'Lecture' };

/** Academia > Teaching > Teaching Assignments — admin/organizer CRUD for
    the hierarchy academic_courses -> teaching_assignments -> teaching_sessions.
    Gated by canManageTeaching(). Members never edit this directly; they only
    ever see the result via My Teaching Schedule. */
export default function TeachingAssignmentsPanel({ lang = 'vi' }) {
  const vi = lang === 'vi';
  const { user: authUser } = useAuth();
  const [canManage, setCanManage] = useState(false);
  const [checked, setChecked] = useState(false);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState(EMPTY_ASSIGNMENT);
  const [sessionForms, setSessionForms] = useState({}); // { [assignmentId]: fields }

  const reload = () => {
    setLoading(true);
    Promise.all([fetchCourses(), fetchAssignments(), fetchAllSessions(), fetchAllAccounts()]).then(([c, a, s, acc]) => {
      setCourses(c); setAssignments(a); setSessions(s); setAccounts(acc); setLoading(false);
    });
  };

  useEffect(() => {
    canManageTeaching().then((ok) => {
      setCanManage(ok);
      setChecked(true);
      if (ok) reload(); else setLoading(false);
    });
  }, []);

  const submitCourse = async () => {
    if (!courseForm.course_code.trim() || !courseForm.course_name.trim()) return;
    await createCourse({
      course_code: courseForm.course_code.trim(), course_name: courseForm.course_name.trim(),
      program: courseForm.program.trim() || null, credits: courseForm.credits ? Number(courseForm.credits) : null,
    }, authUser?.id);
    setCourseForm(EMPTY_COURSE); setShowCourseForm(false); reload();
  };

  const submitAssignment = async () => {
    if (!assignmentForm.member_id || !assignmentForm.course_id) return;
    await createAssignment({
      member_id: assignmentForm.member_id, course_id: assignmentForm.course_id,
      class_code: assignmentForm.class_code.trim() || null, semester: assignmentForm.semester.trim() || null,
      academic_year: assignmentForm.academic_year.trim() || null, teaching_role: assignmentForm.teaching_role,
    }, authUser?.id);
    setAssignmentForm(EMPTY_ASSIGNMENT); setShowAssignmentForm(false); reload();
  };

  const removeAssignment = async (id) => {
    if (!window.confirm(vi ? 'Xoá phân công này và mọi buổi dạy liên quan?' : 'Delete this assignment and all its sessions?')) return;
    await deleteAssignment(id); reload();
  };

  const setSessionField = (assignmentId, key, value) =>
    setSessionForms((p) => ({ ...p, [assignmentId]: { ...(p[assignmentId] || EMPTY_SESSION), [key]: value } }));

  const submitSession = async (assignmentId) => {
    const f = sessionForms[assignmentId] || EMPTY_SESSION;
    if (!f.session_date || !f.start_time || !f.end_time) return;
    await createSession({
      teaching_assignment_id: assignmentId, session_date: f.session_date, start_time: f.start_time, end_time: f.end_time,
      room: f.room?.trim() || null, campus: f.campus?.trim() || null, session_type: f.session_type || 'Lecture',
    }, authUser?.id);
    setSessionForms((p) => ({ ...p, [assignmentId]: EMPTY_SESSION }));
    reload();
  };

  if (!checked) return <div className="font-sans text-xs text-neutral-400 p-4">{vi ? 'Đang kiểm tra quyền...' : 'Checking permissions...'}</div>;
  if (!canManage) {
    return (
      <div className="font-sans text-xs text-red-700 p-4 border border-red-200 bg-red-50">
        {vi
          ? 'Bạn không có quyền truy cập mục này. Chỉ Admin, Director, Vice Director, hoặc tài khoản được cấp quyền quản lý giảng dạy mới xem được.'
          : 'You do not have access to this page. Only Admin, Director, Vice Director, or an account granted teaching-management rights can view this.'}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-3.5 font-sans">
      {/* Courses */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-ibm text-xs font-semibold text-iscm-charcoal">{vi ? 'Môn học' : 'Courses'}</p>
          <button onClick={() => setShowCourseForm((s) => !s)} className="flex items-center gap-1 text-[10px] font-bold uppercase text-neutral-500 hover:text-iscm-crimson">
            <Plus className="h-3.5 w-3.5" /> {vi ? 'Thêm môn học' : 'Add course'}
          </button>
        </div>
        {showCourseForm && (
          <div className="grid grid-cols-4 gap-2 border border-neutral-200 p-2.5">
            <input placeholder={vi ? 'Mã môn' : 'Course code'} value={courseForm.course_code} onChange={(e) => setCourseForm((p) => ({ ...p, course_code: e.target.value }))} className={inputClass} />
            <input placeholder={vi ? 'Tên môn' : 'Course name'} value={courseForm.course_name} onChange={(e) => setCourseForm((p) => ({ ...p, course_name: e.target.value }))} className={`${inputClass} col-span-2`} />
            <input placeholder={vi ? 'Số tín chỉ' : 'Credits'} type="number" value={courseForm.credits} onChange={(e) => setCourseForm((p) => ({ ...p, credits: e.target.value }))} className={inputClass} />
            <button onClick={submitCourse} className="col-span-4 px-3 py-1.5 text-[10px] font-bold uppercase text-white bg-iscm-crimson hover:bg-[#7a0010] w-fit">{vi ? 'Lưu' : 'Save'}</button>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {courses.map((c) => (
            <span key={c.id} className="text-[10px] border border-neutral-200 bg-neutral-50 px-2 py-1 text-neutral-600">{c.course_code} — {c.course_name}</span>
          ))}
          {courses.length === 0 && <span className="text-[10px] text-neutral-400 italic">{vi ? 'Chưa có môn học.' : 'No courses yet.'}</span>}
        </div>
      </div>

      {/* Assignments */}
      <div className="space-y-2 border-t border-neutral-100 pt-3">
        <div className="flex items-center justify-between">
          <p className="font-ibm text-xs font-semibold text-iscm-charcoal">{vi ? 'Phân công giảng dạy' : 'Teaching Assignments'}</p>
          <button onClick={() => setShowAssignmentForm((s) => !s)} className="flex items-center gap-1 text-[10px] font-bold uppercase text-neutral-500 hover:text-iscm-crimson">
            <Plus className="h-3.5 w-3.5" /> {vi ? 'Thêm phân công' : 'Add assignment'}
          </button>
        </div>
        {showAssignmentForm && (
          <div className="grid grid-cols-3 gap-2 border border-neutral-200 p-2.5">
            <select value={assignmentForm.member_id} onChange={(e) => setAssignmentForm((p) => ({ ...p, member_id: e.target.value }))} className={inputClass}>
              <option value="">{vi ? '— Thành viên —' : '— Member —'}</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.full_name || a.email}</option>)}
            </select>
            <select value={assignmentForm.course_id} onChange={(e) => setAssignmentForm((p) => ({ ...p, course_id: e.target.value }))} className={inputClass}>
              <option value="">{vi ? '— Môn học —' : '— Course —'}</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.course_code} — {c.course_name}</option>)}
            </select>
            <select value={assignmentForm.teaching_role} onChange={(e) => setAssignmentForm((p) => ({ ...p, teaching_role: e.target.value }))} className={inputClass}>
              {TEACHING_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input placeholder={vi ? 'Mã lớp' : 'Class code'} value={assignmentForm.class_code} onChange={(e) => setAssignmentForm((p) => ({ ...p, class_code: e.target.value }))} className={inputClass} />
            <input placeholder={vi ? 'Học kỳ' : 'Semester'} value={assignmentForm.semester} onChange={(e) => setAssignmentForm((p) => ({ ...p, semester: e.target.value }))} className={inputClass} />
            <input placeholder={vi ? 'Năm học' : 'Academic year'} value={assignmentForm.academic_year} onChange={(e) => setAssignmentForm((p) => ({ ...p, academic_year: e.target.value }))} className={inputClass} />
            <button onClick={submitAssignment} className="col-span-3 px-3 py-1.5 text-[10px] font-bold uppercase text-white bg-iscm-crimson hover:bg-[#7a0010] w-fit">{vi ? 'Lưu' : 'Save'}</button>
          </div>
        )}

        <div className="border border-neutral-200 divide-y divide-neutral-100">
          {assignments.map((a) => {
            const isOpen = expanded[a.id];
            const assignmentSessions = sessions.filter((s) => s.teaching_assignment_id === a.id);
            const sf = sessionForms[a.id] || EMPTY_SESSION;
            return (
              <div key={a.id}>
                <button onClick={() => setExpanded((p) => ({ ...p, [a.id]: !p[a.id] }))} className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-neutral-50">
                  <span className="flex items-center gap-1.5 text-xs text-neutral-800">
                    {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    <span className="font-semibold">{a.member?.full_name || a.member?.email}</span>
                    <span className="text-neutral-400">— {a.course?.course_name} {a.class_code ? `(${a.class_code})` : ''}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase text-neutral-400">{a.teaching_role}</span>
                    <Trash2 className="h-3.5 w-3.5 text-neutral-300 hover:text-red-700" onClick={(e) => { e.stopPropagation(); removeAssignment(a.id); }} />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 space-y-2 bg-neutral-50/60">
                    <div className="grid grid-cols-3 gap-1.5 pt-2">
                      <input type="date" value={sf.session_date} onChange={(e) => setSessionField(a.id, 'session_date', e.target.value)} className={inputClass} />
                      <input type="time" value={sf.start_time} onChange={(e) => setSessionField(a.id, 'start_time', e.target.value)} className={inputClass} />
                      <input type="time" value={sf.end_time} onChange={(e) => setSessionField(a.id, 'end_time', e.target.value)} className={inputClass} />
                      <input placeholder={vi ? 'Phòng' : 'Room'} value={sf.room || ''} onChange={(e) => setSessionField(a.id, 'room', e.target.value)} className={inputClass} />
                      <input placeholder={vi ? 'Cơ sở' : 'Campus'} value={sf.campus || ''} onChange={(e) => setSessionField(a.id, 'campus', e.target.value)} className={inputClass} />
                      <select value={sf.session_type || 'Lecture'} onChange={(e) => setSessionField(a.id, 'session_type', e.target.value)} className={inputClass}>
                        {SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <button onClick={() => submitSession(a.id)} className="px-3 py-1.5 text-[10px] font-bold uppercase text-white bg-iscm-crimson hover:bg-[#7a0010]">
                      <Plus className="h-3 w-3 inline mr-1" />{vi ? 'Thêm buổi dạy' : 'Add session'}
                    </button>

                    <div className="divide-y divide-neutral-100 border border-neutral-200 bg-white">
                      {assignmentSessions.sort((x, y) => x.session_date.localeCompare(y.session_date)).map((s) => (
                        <div key={s.id} className="flex items-center justify-between px-2.5 py-1.5 text-[10px]">
                          <span className={s.status === 'Cancelled' ? 'text-neutral-400 line-through' : 'text-neutral-700'}>
                            {s.session_date} · {s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)} · {s.session_type}{s.room ? ` · ${s.room}` : ''}
                          </span>
                          {s.status !== 'Cancelled' && (
                            <span className="flex items-center gap-2">
                              <button onClick={() => cancelSession(s.id).then(reload)} title={vi ? 'Huỷ buổi dạy' : 'Cancel session'}><Ban className="h-3 w-3 text-neutral-400 hover:text-amber-600" /></button>
                              <button onClick={() => deleteSession(s.id).then(reload)} title={vi ? 'Xoá' : 'Delete'}><Trash2 className="h-3 w-3 text-neutral-400 hover:text-red-700" /></button>
                            </span>
                          )}
                        </div>
                      ))}
                      {assignmentSessions.length === 0 && (
                        <div className="px-2.5 py-2 text-center text-[10px] text-neutral-400 italic">{vi ? 'Chưa có buổi dạy nào.' : 'No sessions yet.'}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {assignments.length === 0 && (
            <div className="px-3 py-6 text-center text-neutral-400 italic text-xs">{vi ? 'Chưa có phân công giảng dạy nào.' : 'No teaching assignments yet.'}</div>
          )}
        </div>
      </div>
    </div>
  );
}
