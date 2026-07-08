import { useMemo, useState, useEffect } from 'react';
import {
  ChevronDown, ChevronRight, UserCircle2, CalendarClock, CalendarRange,
  Flag, GraduationCap, UsersRound, Ticket, FlaskConical, Presentation, Wallet,
  ReceiptText, Landmark, FileText, CheckCircle2, Circle, Filter, X,
  MonitorSmartphone, BookOpen, Phone, Building2, Users2, LifeBuoy, Inbox, Send, ArrowRight, Download, AlertCircle, Info,
} from 'lucide-react';
import { researchList } from '../data/researchList.js';
import { FORM_GROUPS, FORM_BY_KEY, FORM_CATEGORIES, ASSET_TYPES, MY_TASKS, MY_FORMS_SEED, MY_ASSETS } from '../data/formPortal.js';
import { Avatar } from '../components/ui.jsx';
import AttendanceLogPanel from '../components/personal/AttendanceLogPanel.jsx';
import TaskReceiptPanel from '../components/personal/TaskReceiptPanel.jsx';
import { FormPortalGrid, FormDetail, loadSubmissions } from '../components/personal/FormPortalPanel.jsx';
import { MyTasksPanel, MyFormsPanel } from '../components/personal/RequestQueues.jsx';
import TransactionsPanel from '../components/personal/TransactionsPanel.jsx';
import MyAssetsPanel from '../components/personal/MyAssetsPanel.jsx';
import WikiHubPanel from '../components/personal/WikiHubPanel.jsx';
import ISCMOrganizationalChart from '../components/personal/ISCMOrganizationalChart.jsx';
import { SupportContactsView, DepartmentsView, ColleaguesView } from '../components/personal/ContactsPanel.jsx';
import { CreateRequestView, MyRequestsView } from '../components/personal/SupportsPanel.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { NAVIGATION_LOCALIZATION } from '../data/navigationLocalization.js';

/** Signed-in demo persona: Director Trịnh Tú Anh */
const MY_PROFILE = {
  full_name: 'TRỊNH TÚ ANH',
  email: 'tuanh.trinh@iscm.ueh.edu.vn',
  system_role: 'Institute Director',
  base_functional_group: 'Management Board (RU0)',
  mentor: 'N/A',
};

const CTV_JOINT_CAP = 2;
const STATUS_FILTER_OPTS = ['All', 'Open', 'Others'];

const CAT_BADGE_STYLE = {
  HR: 'border border-blue-200 bg-blue-50 text-blue-800',
  IT: 'border border-emerald-200 bg-emerald-50 text-emerald-800',
  FA: 'border border-amber-200 bg-amber-50 text-amber-800',
  RM: 'border border-purple-200 bg-purple-50 text-purple-800',
  AF: 'border border-slate-300 bg-slate-100 text-slate-700',
};

/* ---------------- Right-viewport content resolution ---------------- */

function usePaneContent(selected, filters, setSelected, lang) {
  let key = selected;
  if (selected === 'my-portal') key = 'profile-bio';
  else if (selected === 'requests-forms') key = 'cat-forms';
  else if (selected === 'wiki-hub-root') key = 'cat-wiki';
  else if (selected === 'contacts-root') key = 'cat-contacts';
  else if (['wiki-of-g', 'wiki-rp-g', 'wiki-ac-g', 'wiki-cm-g'].includes(selected)) key = 'wiki-guidelines';
  else if (['wiki-oh-r', 'wiki-af-r'].includes(selected)) key = 'wiki-regulations';

  const myResearch = useMemo(
    () => researchList.filter((r) => r.members?.includes('TuAnh')),
    []
  );
  const jointEngagements = myResearch.filter(
    (r) => !r.task_name.includes('Main Folder') && !['Training', 'Event'].includes(r.task_type)
  );
  const capExceeded = jointEngagements.length > CTV_JOINT_CAP;
  const t = NAVIGATION_LOCALIZATION[lang] || NAVIGATION_LOCALIZATION.en;

  /* Form detail views */
  if (selected.startsWith('form:')) {
    const formKey = selected.slice(5);
    return {
      title: FORM_BY_KEY[formKey]?.label ?? t.FORM_PORTAL_TITLE,
      icon: FileText,
      body: <FormDetail key={formKey} formKey={formKey} onBack={() => setSelected('cat-forms')} />,
    };
  }

  /* Document detail view for Wiki Hub nodes */
  if (selected.startsWith('wiki-doc:')) {
    const docName = selected.slice(9);

    if (docName === '[2026-07-02][ISCM-RD][Đăng ký đề tài NCKH UEH 2026 - Mẫu NCKH-01].pdf') {
      return {
        title: docName,
        icon: Info,
        body: (
          <div className="space-y-4 font-sans text-sm text-neutral-800">
            <div className="border border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-2 rounded-none">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-neutral-400">
                  {lang === 'vi' ? 'Đăng Ký Đề Tài' : 'Research Grant Registration'}
                </span>
                <span className="badge border border-[#990000] bg-white text-[#990000] font-bold text-xs">UEH 2026</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{docName}</h3>
            </div>
            <div className="border border-neutral-200 p-4 bg-white space-y-4 rounded-none">
              <p className="font-semibold text-[#990000]">Thông báo kêu gọi đăng ký đề tài Nghiên cứu khoa học cấp Trường năm 2026 tại UEH.</p>
              <div className="bg-neutral-50 p-3 rounded-none border border-neutral-200 space-y-2">
                <p><strong>1. Hạn chót nộp đề xuất:</strong> <span className="font-barlow font-semibold text-[#990000] text-sm">15/08/2026</span></p>
                <p><strong>2. Mức kinh phí hỗ trợ:</strong> Lên tới <span className="font-barlow font-semibold text-sm">120,000,000 VND</span>/đề tài (tùy thuộc quy mô và tính cấp thiết).</p>
                <p><strong>3. Định hướng nghiên cứu chính:</strong> Đô thị thông minh, Quy hoạch tích hợp, Quản lý tài nguyên bền vững, Kinh tế tuần hoàn.</p>
              </div>
              <p>Quy trình đăng ký yêu cầu điền đầy đủ thuyết minh đề tài (Mẫu NCKH-01/UEH) và nộp trực tuyến qua cổng thông tin Khoa học Công nghệ CTD.</p>
              <button className="flex items-center gap-1.5 bg-[#990000] hover:bg-neutral-800 text-white font-semibold py-2 px-3 rounded-none mt-2 transition-colors">
                <Download className="h-4 w-4" /> Tải về Mẫu đăng ký NCKH-01
              </button>
            </div>
          </div>
        )
      };
    }

    if (docName === '[2026-07-01][ISCM-RD][Đăng ký đề tài NCKH UEH Đợt 1 do CTD quản lý].pdf') {
      return {
        title: docName,
        icon: Landmark,
        body: (
          <div className="space-y-4 font-sans text-sm text-neutral-800">
            <div className="border border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-2 rounded-none">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-neutral-400">
                  {lang === 'vi' ? 'Tài Trợ Nghiên Cứu' : 'Research Funding'}
                </span>
                <span className="badge border border-[#990000] bg-white text-[#990000] font-bold text-xs">CTD-UEH 2026</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{docName}</h3>
            </div>
            <div className="border border-neutral-200 p-4 bg-white space-y-3 rounded-none">
              <p className="font-semibold text-[#990000]">Chương trình tài trợ đề tài NCKH Đợt 1/2026 trực thuộc Phân hiệu Công nghệ và Thiết kế (CTD-UEH).</p>
              <p>Tập trung thúc đẩy các nghiên cứu mang tính liên ngành (Interdisciplinary Research) giao thoa giữa Thiết kế đô thị (Urban Design), Khoa học máy tính (Computer Science) và Công nghệ truyền thông.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Xét duyệt ưu tiên cho các nhóm nghiên cứu có sự tham gia của đối tác nước ngoài (MOU quốc tế).</li>
                <li>Cam kết công bố quốc tế ít nhất 01 bài báo Q1/Q2 Scopus.</li>
                <li>Thời gian thực hiện tối đa: 18 tháng.</li>
              </ul>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-none flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Lưu ý: Đề tài cần khai báo thông tin chỉ số trích dẫn dự kiến của nhóm tác giả trước khi nộp.</span>
              </div>
            </div>
          </div>
        )
      };
    }

    if (docName === '[2026-06-25][ISCM-RD][Giải Tinh hoa học thuật và khen thưởng KHCN Sinh viên CTD].pdf') {
      return {
        title: docName,
        icon: GraduationCap,
        body: (
          <div className="space-y-4 font-sans text-sm text-neutral-800">
            <div className="border border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-2 rounded-none">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-neutral-400">
                  {lang === 'vi' ? 'Giải Thưởng KHCN' : 'Student Science Award'}
                </span>
                <span className="badge border border-[#990000] bg-white text-[#990000] font-bold text-xs">Tinh Hoa Học Thuật</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{docName}</h3>
            </div>
            <div className="border border-neutral-200 p-4 bg-white space-y-3 rounded-none">
              <p className="font-semibold text-[#990000]">Giải thưởng nhằm khuyến khích sinh viên và học viên cao học tham gia nghiên cứu học thuật đỉnh cao tại CTD.</p>
              <p><strong>Cơ cấu giải thưởng:</strong></p>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>Giải Nhất:</strong> Cúp vàng + Giấy khen Hiệu trưởng + 30,000,000 VND</li>
                <li><strong>Giải Nhì:</strong> Giấy khen + 20,000,000 VND</li>
                <li><strong>Giải Ba:</strong> Giấy khen + 10,000,000 VND</li>
              </ol>
              <p>Các đề tài có sản phẩm phần mềm (Source code), mô hình WebGIS, hoặc xuất bản bài báo khoa học đồng tác giả sẽ được cộng điểm ưu tiên.</p>
            </div>
          </div>
        )
      };
    }

    if (docName === '[2026-07-08][ISCM-RD][Kế hoạch NCKH 2026 và Chỉ tiêu KPI].pdf') {
      return {
        title: docName,
        icon: Info,
        body: (
          <div className="space-y-4 font-sans text-sm text-neutral-800">
            <div className="border border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-2 rounded-none">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-neutral-400">
                  {lang === 'vi' ? 'Theo Dõi Chỉ Tiêu' : 'KPI Tracking'}
                </span>
                <span className="badge border border-[#990000] bg-white text-[#990000] font-bold text-xs">ISCM 2026</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{docName}</h3>
            </div>
            <div className="border border-neutral-200 p-4 bg-white space-y-3 rounded-none">
              <p>Bảng theo dõi chỉ tiêu nghiên cứu khoa học (KPI) của Viện ISCM trong năm học 2026:</p>
              <div className="overflow-x-auto overflow-y-auto max-h-[340px] rounded-none border border-neutral-200">
                <table className="w-full text-left font-ibm text-xs">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-neutral-900 font-barlow text-[10px] font-bold uppercase tracking-wider text-white">
                      <th className="py-2.5 px-3 border-b-2 border-gray-300">Chỉ tiêu KPI</th>
                      <th className="py-2.5 px-3 border-b-2 border-gray-300">Kế hoạch 2026</th>
                      <th className="py-2.5 px-3 border-b-2 border-gray-300">Đã thực hiện</th>
                      <th className="py-2.5 px-3 border-b-2 border-gray-300">Tiến độ %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2 px-3 font-semibold">Bài báo Q1/Q2 Scopus</td>
                      <td className="py-2 px-3 font-barlow text-xs">8 bài</td>
                      <td className="py-2 px-3 font-barlow text-xs">5 bài</td>
                      <td className="py-2 px-3"><span className="text-emerald-600 font-semibold font-barlow text-xs">62.5%</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Đề tài cấp Bộ/Trường</td>
                      <td className="py-2 px-3 font-barlow text-xs">3 đề tài</td>
                      <td className="py-2 px-3 font-barlow text-xs">2 đề tài</td>
                      <td className="py-2 px-3"><span className="text-emerald-600 font-semibold font-barlow text-xs">66.6%</span></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">Tổ chức Hội thảo Khoa học</td>
                      <td className="py-2 px-3 font-barlow text-xs">2 lần</td>
                      <td className="py-2 px-3 font-barlow text-xs">1 lần</td>
                      <td className="py-2 px-3"><span className="text-amber-600 font-semibold font-barlow text-xs">50.0%</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      };
    }

    if (docName === '[2026-01-01][ISCM-OD][Cơ cấu tổ chức và sơ đồ phân nhiệm ISCM].pdf' || 
        docName === '[2026-01-01][ISCM-OD][ISCM Organizational Structure and Chart].pdf') {
      return {
        title: lang === 'vi' ? 'Cơ cấu tổ chức và sơ đồ phân nhiệm ISCM' : 'ISCM Organizational Structure and Chart',
        icon: UsersRound,
        body: <ISCMOrganizationalChart lang={lang} />
      };
    }

    if (docName === '[2026-01-01][ISCM-RD][Quy định quản lý hoạt động NCKH tại UEH].pdf') {
      return {
        title: docName,
        icon: Landmark,
        body: (
          <div className="space-y-4 font-sans text-sm text-neutral-800">
            <div className="border border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-2 rounded-none">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-neutral-400">
                  {lang === 'vi' ? 'Quy chế UEH' : 'UEH Regulation'}
                </span>
                <span className="badge border border-[#990000] bg-white text-[#990000] font-bold text-xs">UEH-NCKH</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{docName}</h3>
            </div>
            <div className="border border-neutral-200 p-4 bg-white space-y-3 rounded-none">
              <p>Quy chế Quản lý hoạt động Nghiên cứu khoa học của Đại học Kinh tế TP. Hồ Chí Minh ban hành kèm Quyết định số 4820/QĐ-UEH.</p>
              <ul className="list-decimal pl-5 space-y-1">
                <li>Quy định về định mức giờ nghiên cứu tối thiểu đối với giảng viên cơ hữu.</li>
                <li>Quy chế phân bổ tài chính, phụ cấp bài báo Scopus/ISI.</li>
                <li>Quy tắc đạo đức nghiên cứu và liêm chính học thuật (Academic Integrity).</li>
              </ul>
            </div>
          </div>
        )
      };
    }

    if (docName === '[2026-05-12][ISCM-RD][Quy trình 4 bước tham gia NCKH tại ISCM].pdf') {
      return {
        title: docName,
        icon: Info,
        body: (
          <div className="space-y-4 font-sans text-sm text-neutral-800">
            <div className="border border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-2 rounded-none">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-neutral-400">
                  {lang === 'vi' ? 'Quy Trình Nghiên Cứu' : 'Research Process'}
                </span>
                <span className="badge border border-[#990000] bg-white text-[#990000] font-bold text-xs">ISCM Process</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{docName}</h3>
            </div>
            <div className="border border-neutral-200 p-4 bg-white space-y-4 rounded-none">
              <p>Để đăng ký tham gia nghiên cứu khoa học tại ISCM, cán bộ nghiên cứu thực hiện theo quy trình 4 bước:</p>
              <div className="grid gap-3 sm:grid-cols-4 font-barlow text-center">
                <div className="bg-neutral-50 p-3 rounded-none border border-neutral-200">
                  <span className="block font-bold text-[#990000] text-sm">Bước 1</span>
                  <span className="block text-xs font-semibold mt-1">Đề xuất ý tưởng</span>
                </div>
                <div className="bg-neutral-50 p-3 rounded-none border border-neutral-200">
                  <span className="block font-bold text-[#990000] text-sm">Bước 2</span>
                  <span className="block text-xs font-semibold mt-1">Thẩm định đề cương</span>
                </div>
                <div className="bg-neutral-50 p-3 rounded-none border border-neutral-200">
                  <span className="block font-bold text-[#990000] text-sm">Bước 3</span>
                  <span className="block text-xs font-semibold mt-1">Triển khai &amp; Phân tích</span>
                </div>
                <div className="bg-neutral-50 p-3 rounded-none border border-neutral-200">
                  <span className="block font-bold text-[#990000] text-sm">Bước 4</span>
                  <span className="block text-xs font-semibold mt-1">Xuất bản báo cáo</span>
                </div>
              </div>
            </div>
          </div>
        )
      };
    }

    if (docName === '[2026-02-15][ISCM-RD][Hướng dẫn khai báo công trình khoa học trên UEH Platform].pdf') {
      return {
        title: docName,
        icon: Info,
        body: (
          <div className="space-y-4 font-sans text-sm text-neutral-800">
            <div className="border border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-2 rounded-none">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-neutral-400">
                  {lang === 'vi' ? 'Hướng Dẫn Khai Báo' : 'Reporting Guide'}
                </span>
                <span className="badge border border-[#990000] bg-white text-[#990000] font-bold text-xs">Knowledge Hub</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{docName}</h3>
            </div>
            <div className="border border-neutral-200 p-4 bg-white space-y-3 rounded-none">
              <p>Hướng dẫn khai báo công trình khoa học trực tuyến trên Cổng thông tin UEH Knowledge Hub:</p>
              <div className="bg-neutral-50 p-3 rounded-none border border-neutral-200 space-y-2 text-xs">
                <p>1. Truy cập <span className="text-[#990000] underline font-bold">research.ueh.edu.vn</span></p>
                <p>2. Đăng nhập bằng tài khoản email UEH cá nhân.</p>
                <p>3. Chọn mục "Khai báo công trình mới" và đính kèm bản PDF bài viết hoặc số hiệu DOI của bài báo.</p>
              </div>
            </div>
          </div>
        )
      };
    }

    if (docName === '[2026-02-20][ISCM-RD][Hướng dẫn viết đề cương thuyết minh đề tài NCKH UEH].pdf') {
      return {
        title: docName,
        icon: BookOpen,
        body: (
          <div className="space-y-4 font-sans text-sm text-neutral-800">
            <div className="border border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-2 rounded-none">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-neutral-400">
                  {lang === 'vi' ? 'Hướng Dẫn Thuyết Minh' : 'Proposal Drafting Guide'}
                </span>
                <span className="badge border border-[#990000] bg-white text-[#990000] font-bold text-xs">UEH Guidelines</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{docName}</h3>
            </div>
            <div className="border border-neutral-200 p-4 bg-white space-y-3 rounded-none">
              <p>Tài liệu hướng dẫn viết đề cương thuyết minh đề tài nghiên cứu khoa học cấp Bộ, cấp Tỉnh và các đề tài đặt hàng từ Sở Ban Ngành.</p>
              <p>Xem hướng dẫn lập dự toán tài chính và thuyết minh quy chuẩn của phòng Quản lý Khoa học - Hợp tác Quốc tế UEH.</p>
            </div>
          </div>
        )
      };
    }

    if (docName === '[2026-03-01][ISCM-RD][Biểu mẫu và biểu mẫu quyết toán kinh phí NCKH].pdf') {
      return {
        title: docName,
        icon: FileText,
        body: (
          <div className="space-y-4 font-sans text-sm text-neutral-800">
            <div className="border border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-2 rounded-none">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-neutral-400">
                  {lang === 'vi' ? 'Biểu Mẫu Tải Về' : 'Templates Download'}
                </span>
                <span className="badge border border-[#990000] bg-white text-[#990000] font-bold text-xs">NCKH Templates</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{docName}</h3>
            </div>
            <div className="border border-neutral-200 p-4 bg-white space-y-3 rounded-none">
              <p>Tải xuống nhanh các mẫu văn bản liên quan:</p>
              <ul className="space-y-2">
                <li className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 rounded-none">
                  <span>Mẫu thuyết minh đề tài NCKH (NCKH-TM01.docx)</span>
                  <button className="text-[#990000] font-bold hover:underline flex items-center gap-0.5 text-xs"><Download className="h-3.5 w-3.5" /> Tải về</button>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 rounded-none">
                  <span>Mẫu quyết toán kinh phí nghiên cứu (NCKH-QT02.xlsx)</span>
                  <button className="text-[#990000] font-bold hover:underline flex items-center gap-0.5 text-xs"><Download className="h-3.5 w-3.5" /> Tải về</button>
                </li>
              </ul>
            </div>
          </div>
        )
      };
    }

    const isOrgDoc = docName === 'Mô hình tổ chức và quản lý tại ISCM' || docName === 'Organizational and Management Model';
    
    if (isOrgDoc) {
      return {
        title: docName,
        icon: BookOpen,
        body: (
          <div className="space-y-4 font-sans text-sm text-neutral-800">
            <div className="border border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-2 rounded-none">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-neutral-400">
                  {lang === 'vi' ? 'Quy chế Vận hành' : 'Operational Regulation'}
                </span>
                <span className="badge border border-[#990000] bg-white text-[#990000] font-bold text-xs">
                  {lang === 'vi' ? 'Áp dụng chính thức từ tháng 01/2026' : 'Effective from Jan 2026'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 leading-snug">{docName}</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-normal">
                {lang === 'vi' 
                  ? 'Quy chuẩn mô hình vận hành và phân quyền hệ thống nhân sự tại Viện Đô thị Thông minh và Quản lý (ISCM).'
                  : 'Operational model standard and personnel role classifications at the Institute of Smart City and Management (ISCM).'}
              </p>
              <div className="mt-2 text-xs font-bold">
                {lang === 'vi' ? 'Link truy cập: ' : 'Access Link: '}
                <a href="https://docs.google.com/spreadsheets/d/1ow2qBTsU06JcIjms9_627CDyyAVWmLp5/edit?usp=sharing&ouid=108537813011262227879&rtpof=true&sd=true" 
                   target="_blank" rel="noopener noreferrer" 
                   className="text-[#990000] hover:underline inline-flex items-center gap-1 font-sans">
                  {lang === 'vi' ? 'Nhấn vào đây' : 'Click here'} <ArrowRight className="h-3 w-3 inline" />
                </a>
              </div>
            </div>

            {/* Part 1 */}
            <div className="border border-neutral-200 p-4 flex flex-col gap-3 rounded-none bg-white">
              <h4 className="font-bold text-[#990000] uppercase text-xs tracking-wider border-b border-neutral-100 pb-1.5 font-sans">
                {lang === 'vi' ? 'Phần I: Nguyên tắc tổ chức và Vận hành chung' : 'Part I: General Organization and Operation Principles'}
              </h4>
              <ul className="space-y-2 text-sm text-neutral-700 list-disc pl-4">
                {lang === 'vi' ? (
                  <>
                    <li>ISCM vận hành theo mô hình linh hoạt, kết hợp giữa quản lý theo chức năng (Functional) và quản lý theo dự án/sự kiện (Matrix/Project-based).</li>
                    <li><strong>Thẩm quyền của Viện trưởng:</strong> Viện trưởng là người nắm quyền điều hành tối cao tại ISCM; trực tiếp phân công, bổ nhiệm các vị trí: Head, Lead, Manager, Coordinator, Host.</li>
                    <li><strong>Cấp báo cáo và giao việc chéo (Cross-functional):</strong> Thành viên báo cáo trực tiếp cho Trưởng nhóm (Head) của nhóm chức năng đó. Khi cần thiết, thành viên có thể báo cáo vượt cấp trực tiếp cho Viện trưởng.</li>
                    <li className="text-red-800 font-semibold bg-red-50 p-1.5 border border-red-100 list-none -ml-4">
                      ⚠ Trưởng nhóm chức năng không được quyền tự ý điều động nhân sự của nhóm khác. Chỉ có Viện trưởng mới có quyền phân công một thành viên làm việc chéo (cross-line).
                    </li>
                    <li><strong>Tính linh hoạt trong vai trò:</strong> Một cá nhân có thể đảm nhiệm nhiều vai trò cùng lúc (ví dụ: vừa là Manager dự án A, Coordinator lab B, Host sự kiện C, và là Member của dự án D).</li>
                    <li><strong>Nguyên tắc tuân thủ:</strong> Khi tham gia vào bất kỳ dự án/nhóm nào, cá nhân phải tuân thủ tuyệt đối sự phân công, điều hành của người đứng đầu dự án/nhóm đó (bất kể cấp bậc ở nhóm chức năng gốc).</li>
                    <li><strong>Giám đốc Chương trình đào tạo:</strong> Vị trí học thuật đặc thù, do Viện trưởng phân công và phải được Ban Giám đốc UEH ra quyết định công nhận chính thức mới có hiệu lực.</li>
                  </>
                ) : (
                  <>
                    <li>ISCM operates under a flexible model combining functional management and project/event management (Matrix/Project-based).</li>
                    <li><strong>Director's Authority:</strong> The Director holds supreme executive power; directly assigns and appoints Head, Lead, Manager, Coordinator, and Host.</li>
                    <li><strong>Reporting and Cross-functional lines:</strong> Members report to their functional Head. Skip-level reporting directly to the Director is allowed when necessary.</li>
                    <li className="text-red-800 font-semibold bg-red-50 p-1.5 border border-red-100 list-none -ml-4">
                      ⚠ Functional Heads cannot independently reassign members from other groups. Only the Director has authority to assign cross-line work.
                    </li>
                    <li><strong>Role Flexibility:</strong> Individuals can hold multiple roles simultaneously (e.g., Project Manager, Lab Coordinator, Event Host, and Project Member).</li>
                    <li><strong>Compliance Principle:</strong> In any project/group, individuals must comply with its leader's direction regardless of base administrative rank.</li>
                    <li><strong>Academic Program Director:</strong> Academic role appointed by the Director, requiring formal approval by the UEH Board.</li>
                  </>
                )}
              </ul>
            </div>

            {/* Part 2 */}
            <div className="border border-neutral-200 p-4 flex flex-col gap-3 rounded-none bg-white">
              <h4 className="font-bold text-[#990000] uppercase text-xs tracking-wider border-b border-neutral-100 pb-1.5 font-sans">
                {lang === 'vi' ? 'Phần II: Phân tầng và Mô tả các vị trí quản lý' : 'Part II: Classification and Description of Management Positions'}
              </h4>
              <div className="space-y-3.5 text-sm">
                {[
                  {
                    titleVi: 'Viện trưởng (Institute Director)',
                    titleEn: 'Institute Director',
                    descVi: 'Người đứng đầu, nắm quyền ra quyết định tối cao về chiến lược, nhân sự và tài chính của Viện. Định hướng tầm nhìn, dẫn dắt toàn bộ hoạt động của ISCM và trực tiếp quản lý các cấp quản lý cấp trung (Head, Lead, Manager).',
                    descEn: 'Supreme executive decision-maker on strategy, personnel, and finance. Directs the vision, guides all ISCM operations, and manages mid-level management.'
                  },
                  {
                    titleVi: 'Trưởng nhóm chức năng (Head)',
                    titleEn: 'Functional Head',
                    descVi: 'Quản lý cấp cao, chịu trách nhiệm trực tiếp trước Viện trưởng về một mảng nghiệp vụ cốt lõi (gồm 6 nhóm: Vận hành & Tài chính, Đào tạo, Nghiên cứu, Đối ngoại, Gắn kết, Truyền thông). Định hướng, quản lý tổng thể và triển khai hoạt động nhóm.',
                    descEn: 'High-level management reporting to the Director for a core functional area (Operation & Finance, Academia, Research, Partnership, Engagement, Communication). Directs, manages, and implements group operations.'
                  },
                  {
                    titleVi: 'Quản lý cấp cao dự án/chuyên môn (Lead / Manager)',
                    titleEn: 'Senior Project/Academic Manager (Lead / Manager)',
                    descVi: 'Người đứng đầu các cấu phần lớn mang tính chiến lược hoặc chuyên môn sâu (Course modules, Lab, Center, Dự án quy mô lớn). Trực tiếp định hướng, quản lý tổng thể và báo cáo với Viện trưởng.',
                    descEn: 'Leads major strategic or specialized components (Course modules, Labs, Centers, Large-scale projects). Directs, manages, and reports directly to the Director.'
                  },
                  {
                    titleVi: 'Điều phối viên (Coordinator)',
                    titleEn: 'Coordinator',
                    descVi: 'Người phụ trách chính về mặt vận hành, giữ vai trò đầu mối thông tin cho các hoạt động dài hạn hoặc bền vững (Nhóm nghiên cứu, Lab, Center, Dự án vừa/nhỏ, Sáng kiến). Lập kế hoạch, theo dõi tiến độ và báo cáo cho Viện trưởng hoặc quản lý trực tiếp.',
                    descEn: 'Primary operational contact point for long-term structures (Research groups, Labs, Centers, Medium-small projects, Initiatives). Plans, tracks progress, and reports to the Director or direct manager.'
                  },
                  {
                    titleVi: 'Trưởng ban tổ chức / Phụ trách sự kiện (Host)',
                    titleEn: 'Event Host / Organizer (Host)',
                    descVi: 'Đầu mối chịu trách nhiệm cao nhất đối với các hoạt động, sự kiện có tính thời vụ (có ngày bắt đầu và kết thúc rõ ràng). Lập kế hoạch, điều phối nhân sự, ngân sách và tổ chức sự kiện thành công.',
                    descEn: 'Holds supreme authority for seasonal events/projects with definite start/end dates. Plans, coordinates personnel and budgets, and ensures successful event execution.'
                  },
                  {
                    titleVi: 'Thành viên (Members)',
                    titleEn: 'Members',
                    descVi: 'Nhân sự thực thi trực tiếp các nghiệp vụ chuyên môn. Triển khai các đầu việc được giao theo đúng chất lượng và tiến độ. Báo cáo kết quả công việc cho người đứng đầu dự án/nhóm mà mình được phân công.',
                    descEn: 'Personnel directly executing professional tasks. Implements assigned work with quality and speed. Reports results to designated project/group leaders.'
                  }
                ].map((pos) => (
                  <div key={pos.titleEn} className="border-l-2 border-neutral-300 pl-3">
                    <h5 className="font-bold text-neutral-900 text-xs">{lang === 'vi' ? pos.titleVi : pos.titleEn}</h5>
                    <p className="text-neutral-600 mt-1 text-sm leading-relaxed">{lang === 'vi' ? pos.descVi : pos.descEn}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      };
    }

    return {
      title: docName,
      icon: BookOpen,
      body: (
        <div className="space-y-4 font-sans text-sm text-neutral-800">
          <div className="border border-neutral-200 p-4 bg-neutral-50 flex flex-col gap-2 rounded-none">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-neutral-400">
                {lang === 'vi' ? 'Chi Tiết Tài Liệu' : 'Document Details'}
              </span>
              <span className="badge border border-neutral-300 bg-white text-neutral-800 text-xs">2026 Core Resource</span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 leading-snug">{docName}</h3>
            <p className="text-xs text-neutral-500 mt-1 leading-normal">
              {lang === 'vi' 
                ? 'Tài liệu hướng dẫn nghiệp vụ chính thức được đăng ký dưới hệ thống Smart Office của Viện. Chỉ dành cho nhân sự được phân quyền.'
                : 'Official operational guidelines registered under the Institute\'s Smart Office system. Access is restricted to authorized personnel.'}
            </p>
          </div>

          <div className="border border-neutral-200 p-4 flex flex-col gap-3 rounded-none">
            <h4 className="font-bold text-neutral-900 uppercase text-xs tracking-wider border-b border-neutral-100 pb-1.5 font-sans">
              {lang === 'vi' ? 'Kiểm soát Tuân thủ' : 'Compliance & Validation'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-neutral-400 uppercase">Normalized File Name</span>
                <span className="font-mono text-xs break-all text-neutral-700 block mt-1">
                  [2026-07-08][ISCM-WIKI][{docName.split(/[\[\]]+/)[0].trim().replace(/[\s\/\.]+/g, '-')}-V1].pdf
                </span>
              </div>
              <div>
                <span className="block text-xs text-neutral-400 uppercase">Compliance Standard</span>
                <span className="inline-block mt-1 border border-emerald-300 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 text-xs font-bold">
                  {lang === 'vi' ? '✓ Đạt chuẩn đặt tên' : '✓ Naming Compliant'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button className="btn-primary">
              {lang === 'vi' ? 'Tải Xuống PDF' : 'Download PDF Document'}
            </button>
            <button className="btn-secondary">
              {lang === 'vi' ? 'Yêu Cầu Chỉnh Sửa' : 'Request Edit Access'}
            </button>
          </div>
        </div>
      )
    };
  }

  const MAP = {
    'profile-bio': {
      title: lang === 'vi' ? 'HỒ SƠ CỦA TÔI' : 'MY PORTAL', icon: UserCircle2,
      body: (
        <div className="space-y-4 font-sans text-sm text-neutral-800">
          <p className="leading-relaxed">
            {lang === 'vi' 
              ? `Tôi là ${MY_PROFILE.full_name}, Viện trưởng Viện Đô thị Thông minh và Quản lý (ISCM). Tôi chịu trách nhiệm quản lý chung, lập kế hoạch học thuật và các hoạt động nghiên cứu khoa học cốt lõi.`
              : `I am ${MY_PROFILE.full_name}, Director of the Institute of Smart City and Management (ISCM). I lead the institutional administration, academic planning, and core research operations.`}
          </p>
          <p className="text-neutral-500 leading-relaxed">
            {lang === 'vi'
              ? 'Tôi giám sát khối lượng học thuật giảng viên, duyệt thanh toán cho các dòng ngân quỹ Track 1 và Track 2, đồng thời rà soát nhật ký điểm danh hàng ngày.'
              : 'I oversee academic workloads, approve financial routing for Track 1 and Track 2 budgets, and monitor daily attendance logs.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="border border-neutral-200 bg-neutral-50 p-3 rounded-none">
              <span className="block text-xs text-neutral-400 uppercase">{t.BIO_NAME_LABEL}</span>
              <span className="font-bold text-neutral-800 block mt-1 text-sm">{MY_PROFILE.full_name}</span>
            </div>
            <div className="border border-neutral-200 bg-neutral-50 p-3 rounded-none">
              <span className="block text-xs text-neutral-400 uppercase">{t.BIO_ROLE_LABEL}</span>
              <span className="font-bold text-neutral-800 block mt-1 text-sm">{MY_PROFILE.system_role}</span>
            </div>
          </div>
          <div className="border border-neutral-200 bg-neutral-50 p-3 flex items-center justify-between rounded-none text-sm">
            <span className="text-neutral-500 font-medium">{t.BIO_NCKH_LABEL}</span>
            <span className={`font-bold ${capExceeded ? 'text-red-700' : 'text-emerald-700'}`}>
              {jointEngagements.length} / {CTV_JOINT_CAP} {capExceeded ? '⚠' : '✓'}
            </span>
          </div>
          <button onClick={() => setSelected('form:ask-anything')} className="btn-primary">
            <Send className="h-3 w-3 mr-1" /> {t.CONTACT_OPS}
          </button>
        </div>
      ),
    },
    'attendance-log': { title: t.ATTENDANCE_TITLE, icon: CalendarClock, body: <AttendanceLogPanel /> },
    'my-assets': { title: t.ASSETS_TITLE, icon: MonitorSmartphone, body: <MyAssetsPanel typeFilter={filters.assetType} /> },
    
    // Overview sections
    'cat-forms': {
      title: lang === 'vi' ? 'HỆ THỐNG BIỂU MẪU ĐIỆN TỬ' : 'REQUESTS & E-FORMS', icon: FileText,
      body: (
        <div className="space-y-4 font-sans text-sm text-neutral-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="border border-neutral-200 bg-white p-3 text-center rounded-none">
              <span className="block text-base">📥</span>
              <span className="block font-sans text-xs font-bold text-neutral-800 mt-1">{t.MY_TASKS_WIDGET}</span>
              <span className="block text-[10px] text-neutral-400">{t.PENDING_APPROVALS}</span>
              <button
                onClick={() => setSelected('my-tasks')}
                className="mt-2 text-xs text-[#990000] font-bold hover:underline"
              >
                {lang === 'vi' ? 'Xem Luồng Phê Duyệt →' : 'View Approval Queue →'}
              </button>
            </div>
            <div className="border border-neutral-200 bg-white p-3 text-center rounded-none">
              <span className="block text-base">📤</span>
              <span className="block font-sans text-xs font-bold text-neutral-800 mt-1">{t.MY_REQUESTS_WIDGET}</span>
              <span className="block text-[10px] text-neutral-400">{lang === 'vi' ? 'Yêu cầu đã gửi' : 'Submitted Requests'}</span>
              <button
                onClick={() => setSelected('my-forms')}
                className="mt-2 text-xs text-[#990000] font-bold hover:underline"
              >
                {lang === 'vi' ? 'Theo Dõi Trạng Thái →' : 'Track Request Status →'}
              </button>
            </div>
            <div className="border border-neutral-200 bg-white p-3 text-center rounded-none">
              <span className="block text-base">📂</span>
              <span className="block font-sans text-xs font-bold text-neutral-800 mt-1">{lang === 'vi' ? 'Quy Tắc Đặt Tên' : 'Naming Standard'}</span>
              <span className="block text-xs text-red-700 font-bold mt-0.5">[Date][Project][Title]</span>
              <span className="block text-[10px] text-neutral-400 mt-0.5">Strict compliance validation</span>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-3">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-neutral-900 uppercase text-xs tracking-wider">
                {lang === 'vi' ? 'TẤT CẢ DỊCH VỤ BIỂU MẪU' : 'ALL E-FORM SERVICES'}
              </span>
              <span className="text-xs text-neutral-400">Category Filter: {filters.formCategory}</span>
            </div>
            <FormPortalGrid categoryFilter={filters.formCategory} onOpenForm={(k) => setSelected(`form:${k}`)} />
          </div>
        </div>
      ),
    },
    'cat-wiki': {
      title: lang === 'vi' ? 'TRUNG TÂM TRI THỨC DÙNG CHUNG' : 'WIKI HUB', icon: BookOpen,
      body: (
        <div className="space-y-4 font-sans text-sm text-neutral-800">
          <div className="p-3 bg-neutral-100 border border-neutral-200 flex items-center justify-between rounded-none">
            <div>
              <span className="block font-bold text-neutral-900 text-sm">ISCM Wiki Commons</span>
              <span className="block text-xs text-neutral-500 mt-0.5">
                {lang === 'vi' 
                  ? 'Truy cập cẩm nang hướng dẫn, quy định bắt buộc, hệ thống mẫu biểu và chính sách chiến lược.'
                  : 'Access policies, regulations, guidelines, templates, and tool starter guides.'}
              </span>
            </div>
            <span className="badge border border-neutral-300 bg-white text-neutral-800 font-bold text-xs">2026 Core Docs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              ['wiki-guidelines', lang === 'vi' ? '📘 Cẩm nang Guidelines' : '📘 Guidelines', 'Standard operating manuals'],
              ['wiki-policies', lang === 'vi' ? '📕 Chính sách Policies' : '📕 Policies', 'Institutional mandates'],
              ['wiki-regulations', lang === 'vi' ? '📙 Quy chế Regulations' : '📙 Regulations', 'Legal & administrative limits'],
            ].map(([k, label, desc]) => (
              <button
                key={k}
                onClick={() => setSelected(k)}
                className="p-3 border border-neutral-200 bg-white text-left hover:border-[#990000] transition-all rounded-none"
              >
                <span className="block font-bold text-neutral-900 text-sm">{label}</span>
                <span className="block text-xs text-neutral-400 mt-1 leading-tight">{desc}</span>
              </button>
            ))}
          </div>

          <div className="border border-neutral-200 bg-white p-3.5 rounded-none">
            <span className="block font-bold text-neutral-950 uppercase text-xs tracking-wider mb-2">
              {lang === 'vi' ? 'Chính Sách Cốt Lõi 2026' : '2026 Core Policy Highlights'}
            </span>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-1.5">
                <span className="text-neutral-400 font-bold">•</span>
                <span><strong>Financial Routing Policy:</strong> Segregate payments strictly into Track 1 (UEH Standard Budgets: Flow 1 &amp; 2) and Track 2 (Internal ISCM Funds: Flow 3 &amp; 4).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-neutral-400 font-bold">•</span>
                <span><strong>Lab Asset Management:</strong> Real-time reservation logs required for high-spec laptops, drones, spatial rigs, and VR units in the Book Catalog.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    'cat-contacts': {
      title: lang === 'vi' ? 'DANH BẠ THÔNG TIN TOÀN VIỆN' : 'CONTACTS', icon: Users2,
      body: (
        <div className="space-y-4 font-sans text-sm text-neutral-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              ['contacts-support', lang === 'vi' ? '☎️ Liên hệ Khẩn cấp' : '☎️ Support Contacts', 'IT Helpdesk, admin hotline'],
              ['contacts-departments', lang === 'vi' ? '🏢 Cơ cấu phòng ban' : '🏢 Departments', 'RU1-RU8 Research Labs structure'],
              ['contacts-colleagues', lang === 'vi' ? '👥 Danh bạ nhân sự' : '👥 Colleagues', 'Core Network Directory & roster'],
            ].map(([k, label, desc]) => (
              <button
                key={k}
                onClick={() => setSelected(k)}
                className="p-3.5 border border-neutral-200 bg-white text-center hover:border-[#990000] transition-all rounded-none"
              >
                <span className="block font-bold text-neutral-900 text-sm">{label}</span>
                <span className="block text-xs text-neutral-400 mt-1 leading-tight">{desc}</span>
              </button>
            ))}
          </div>

          <div className="border border-neutral-200 bg-white p-3.5 rounded-none">
            <span className="block font-bold text-neutral-950 uppercase text-xs tracking-wider mb-1">
              {lang === 'vi' ? 'Mạng Lưới Đối Tác Chiến Lược' : 'Strategic Partnerships Directory'}
            </span>
            <p className="text-xs text-neutral-500 mb-3 font-sans">
              {lang === 'vi'
                ? 'Mạng lưới đối tác liên kết của ISCM phân tách theo phân nhóm Academia (Học thuật), Industry (Doanh nghiệp), và Authority (Chính quyền).'
                : 'Mạng lưới đối tác liên kết của ISCM phân tách theo phân nhóm Academia, Industry, và Authority.'}
            </p>
            <button
              onClick={() => setSelected('contacts-colleagues')}
              className="btn-primary text-[10px] py-1 px-3"
            >
              {lang === 'vi' ? 'Tra cứu Danh bạ Nhân sự' : 'Search Personnel Directory'}
            </button>
          </div>
        </div>
      ),
    },

    // Wiki leaf view backups
    'wiki-guidelines': { title: lang === 'vi' ? '📘 Cẩm nang Hướng dẫn Thực hiện' : '📘 Guidelines', icon: BookOpen, body: <WikiHubPanel branch="guidelines" /> },
    'wiki-policies': { title: lang === 'vi' ? '📕 Chính sách Chiến lược' : '📕 Policies', icon: BookOpen, body: <WikiHubPanel branch="policies" /> },
    'wiki-regulations': { title: lang === 'vi' ? '📙 Quy chế / Nội quy bắt buộc' : '📙 Regulations', icon: BookOpen, body: <WikiHubPanel branch="regulations" /> },
    
    // Contacts view backups
    'contacts-support': { title: lang === 'vi' ? 'Liên hệ khẩn' : 'Support Contacts', icon: Phone, body: <SupportContactsView /> },
    'contacts-departments': { title: lang === 'vi' ? 'Cơ cấu phòng ban' : 'Departments', icon: Building2, body: <DepartmentsView /> },
    'contacts-colleagues': { title: lang === 'vi' ? 'Danh bạ nhân sự' : 'Colleagues', icon: Users2, body: <ColleaguesView /> },

    // Request queues
    'my-tasks': { title: t.TASKS_TITLE, icon: Inbox, body: <MyTasksPanel statusFilter={filters.tasksStatus} /> },
    'my-forms': { title: t.FORMS_TITLE, icon: Send, body: <MyFormsPanel key={filters.formsStatus} statusFilter={filters.formsStatus} /> },
  };

  return MAP[key] ?? MAP['profile-bio'];
}

/* ---------------- Recursive Sidebar Tree Level with Formatting Consistency ---------------- */

function TreeLevel({ nodes, depth, selected, onSelect, expanded, onToggle, filters, onFilter }) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => {
        const isLeaf = !node.children;
        const isOpen = expanded[node.id] ?? (depth === 0);

        if (node.type === 'filter') {
          return (
            <li key={node.id} className="flex items-center gap-1.5 py-1" style={{ paddingLeft: depth * 10 }}>
              <Filter className="h-3 w-3 shrink-0 text-neutral-400" />
              <span className="shrink-0 font-sans text-[10px] text-neutral-400">{node.label}:</span>
              <select
                value={filters[node.id]}
                onChange={(e) => onFilter(node.id, e.target.value)}
                className="flex-1 border border-neutral-300 bg-white px-1.5 py-0.5 font-sans text-[10px] text-neutral-800 focus:border-neutral-900 focus:outline-none rounded-none"
              >
                {node.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </li>
          );
        }

        if (isLeaf) {
          const isActive = selected === node.key;
          
          // Formatting weight consistency: Level 1 BOLD UPPERCASE, Level 2 Bold Title Case, Level 3+ Regular Inline
          let textStyleClass = 'font-normal text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100';
          if (depth === 0) {
            textStyleClass = 'font-bold uppercase text-neutral-950 tracking-wider bg-neutral-100 border-b border-neutral-300 mt-1.5';
          } else if (depth === 1) {
            textStyleClass = 'font-bold uppercase text-neutral-900 hover:bg-neutral-50 border-b border-neutral-100 mt-1 mb-0.5';
          }

          return (
            <li key={node.key} style={{ paddingLeft: depth * 10 }}>
              <button
                onClick={() => onSelect(node.key)}
                className={`w-full text-left font-sans text-[11px] py-1.5 px-2 border-b border-transparent transition-colors flex items-center justify-between rounded-none ${textStyleClass} ${
                  isActive ? '!bg-[#990000] !text-white !font-bold' : ''
                }`}
              >
                <span className="truncate">{node.label}</span>
                {node.badge && (
                  <span className={`text-[8px] font-bold px-1 py-0.2 scale-90 rounded-none shrink-0 ${CAT_BADGE_STYLE[node.badge] || 'border border-neutral-300 bg-neutral-50 text-neutral-600'}`}>
                    {node.badge}
                  </span>
                )}
                {depth === 1 && (
                  <ChevronRight className={`h-3 w-3 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                )}
              </button>
            </li>
          );
        }

        // Branch Node
        // Formatting weight consistency: Level 1 BOLD UPPERCASE, Level 2 Bold Title Case, Level 3+ Regular Inline
        let branchStyleClass = 'font-normal text-neutral-700 hover:bg-neutral-50';
        if (depth === 0) {
          branchStyleClass = 'font-bold uppercase text-neutral-950 tracking-wider bg-neutral-100 border-b border-neutral-300 mt-1.5 mb-0.5';
        } else if (depth === 1) {
          branchStyleClass = 'font-bold uppercase text-neutral-900 hover:bg-neutral-50 border-b border-neutral-100 mt-1 mb-0.5';
        }

        const Chevron = isOpen ? ChevronDown : ChevronRight;

        return (
          <li key={node.id} style={{ paddingLeft: depth * 10 }}>
            <div className="flex items-center">
              <button
                onClick={() => onToggle(node.id)}
                className={`w-full text-left font-sans flex items-center justify-between py-1.5 px-2 border-b border-transparent transition-colors text-[11px] ${branchStyleClass}`}
              >
                <span className="truncate">{node.label}</span>
                <Chevron className="h-3 w-3 shrink-0 text-neutral-400" />
              </button>
            </div>
            {isOpen && (
              <div className="my-0.5 border-l border-neutral-200 pl-1.5">
                <TreeLevel
                  nodes={node.children}
                  depth={depth + 1}
                  selected={selected}
                  onSelect={onSelect}
                  expanded={expanded}
                  onToggle={onToggle}
                  filters={filters}
                  onFilter={onFilter}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ====== MY WORKSPACE — Calendar synced full layout ====== */

const WS_EVENTS = [
  { id: 'e1', title: 'Họp giao ban điều hành Tuần', start: '2026-07-06T09:00', end: '2026-07-06T11:00', location: 'StudioLab A, T1, ISCM', tag: 'Internal', tagColor: 'bg-neutral-100 text-neutral-800 border-neutral-200' },
  { id: 'e2', title: 'Ký kết MOU với Grab Vietnam', start: '2026-07-07T14:30', end: '2026-07-07T15:30', location: 'Hội thảo CTD', tag: 'Partnership', tagColor: 'bg-neutral-100 text-neutral-800 border-neutral-200' },
  { id: 'e3', title: 'Thẩm định đề xuất HCMC Walkability Atlas', start: '2026-07-09T10:00', end: '2026-07-09T12:00', location: 'Meeting Room C, ISCM Hub', tag: 'Research', tagColor: 'bg-neutral-100 text-neutral-800 border-neutral-200' },
  { id: 'e4', title: 'ISCM-UEH Academic Seminar', start: '2026-07-10T13:30', end: '2026-07-10T16:00', location: 'Hội trường CTD', tag: 'Seminar', tagColor: 'bg-neutral-100 text-neutral-800 border-neutral-200' },
  { id: 'e5', title: 'Board Meeting — Director Level', start: '2026-07-10T09:00', end: '2026-07-10T10:30', location: 'Văn phòng Giám đốc, T3', tag: 'Admin', tagColor: 'bg-[#990000] text-white border-[#990000]' },
  { id: 'e6', title: 'All-hands Core Team Sync', start: '2026-07-06T13:00', end: '2026-07-06T14:00', location: 'Online (Google Meet)', tag: 'Internal', tagColor: 'bg-neutral-100 text-neutral-800 border-neutral-200' },
];

const TASK_STATUS_BADGE = {
  Open:     'bg-neutral-100 text-neutral-800 border border-neutral-300',
  Approved: 'bg-[#990000] text-white border border-[#990000]',
  Rejected: 'bg-neutral-50 text-neutral-400 border border-neutral-200 line-through',
};

function WorkspaceCalendarLayout({ onNavigate, onSelect, lang }) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const t = NAVIGATION_LOCALIZATION[lang] || NAVIGATION_LOCALIZATION.en;

  const [tasks, setTasks] = useState(MY_TASKS);
  const openTasks = tasks.filter((tk) => tk.status === 'Open');
  const decideTask = (id, status) => setTasks((prev) => prev.map((tk) => tk.id === id ? { ...tk, status } : tk));
  const myForms = useMemo(() => [...loadSubmissions(), ...MY_FORMS_SEED], []);
  const openForms = myForms.filter((f) => f.status === 'Open');
  const dueSoonAssets = [...MY_ASSETS]
    .filter((a) => a.due)
    .sort((a, b) => a.due.localeCompare(b.due));

  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const fmtDay = (d) => {
    if (lang === 'vi') {
      return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
    } else {
      return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: '2-digit' });
    }
  };

  const fmtDateKey = (d) => d.toISOString().slice(0, 10);

  const getEventsForDay = (d) => {
    const key = fmtDateKey(d);
    return WS_EVENTS.filter(ev => ev.start.startsWith(key));
  };

  const upcoming = [...WS_EVENTS]
    .filter(ev => ev.start >= today.toISOString().slice(0, 10))
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 8);

  const fmtTime = (iso) => iso.slice(11, 16);
  const fmtDateLabel = (iso) => {
    const d = new Date(iso);
    if (lang === 'vi') {
      return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
    } else {
      return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: '2-digit' });
    }
  };

  const isToday = (d) => fmtDateKey(d) === todayStr;

  return (
    <div className="w-full flex flex-col gap-4 font-sans">
      {/* Page header */}
      <header className="border-l-4 border-[#990000] pl-4 py-1 mb-2 flex items-start justify-between rounded-none">
        <div>
          <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            {t.WORKSPACE_HEADER}
          </h1>
        </div>
        <button
          onClick={() => onNavigate('executive-calendar')}
          className="btn-secondary text-[11px] py-1 px-3"
        >
          <CalendarClock className="h-3.5 w-3.5 mr-1 text-[#990000]" />
          {t.FULL_CALENDAR}
        </button>
      </header>


      {/* Split layout: left = upcoming events, right = weekly calendar */}
      <div className="grid gap-4 md:grid-cols-10 items-start">

        {/* LEFT — Upcoming Events Highlight */}
        <aside className="border border-neutral-200 bg-white md:col-span-2 rounded-none overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-200 bg-[#990000] text-white flex items-center gap-2">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t.UPCOMING_EVENTS}</span>
          </div>
          <div className="overflow-y-auto max-h-[560px] divide-y divide-neutral-200">
            {upcoming.length === 0 && (
              <p className="px-4 py-8 text-center text-xs text-neutral-400 font-sans">{t.NO_EVENTS}</p>
            )}
            {upcoming.map((ev) => (
              <div key={ev.id} className="flex items-start gap-2.5 px-4 py-3 hover:bg-neutral-50 transition-colors">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#990000]" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-800 leading-snug">{ev.title}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {fmtDateLabel(ev.start)} · {fmtTime(ev.start)}–{fmtTime(ev.end)}
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate">{ev.location}</p>
                  <span className={`inline-block mt-1 px-1 py-0.2 text-[8px] font-bold border ${ev.tagColor}`}>{ev.tag}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50">
            <p className="text-[10px] text-neutral-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-600 inline-block" />
              {t.SYNC_SUCCESS}
            </p>
          </div>
        </aside>

        {/* RIGHT — Weekly Calendar Table */}
        <main className="border border-neutral-200 bg-white md:col-span-8 rounded-none overflow-hidden">
          {/* Calendar header */}
          <div className="px-5 py-2.5 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-3.5 w-3.5 text-[#990000]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {t.WEEKLY_SCHEDULE} — {monday.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} – {weekDays[4].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>
            <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-bold">Thứ 2 → Thứ 6</span>
          </div>

          {/* Week grid */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left border-collapse">
              <thead>
                <tr>
                  {weekDays.map((d) => (
                    <th key={fmtDateKey(d)}
                      className={`px-3 py-2 text-[13px] font-bold uppercase tracking-wider border-b border-neutral-300 text-center ${
                        isToday(d) ? 'bg-[#990000] text-white' : 'bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      {fmtDay(d)}
                      {isToday(d) && <span className="block text-[10px] font-normal opacity-80">{lang === 'vi' ? 'Hôm nay' : 'Today'}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  {weekDays.map((d) => {
                    const dayEvents = getEventsForDay(d);
                    return (
                      <td key={fmtDateKey(d)}
                        className={`px-1.5 py-2 border-r border-neutral-200 last:border-r-0 min-h-[140px] align-top ${
                          isToday(d) ? 'bg-neutral-50/50' : ''
                        }`}
                      >
                        {dayEvents.length === 0 ? (
                          <p className="text-center text-[10px] text-neutral-300 mt-4">—</p>
                        ) : (
                          <div className="space-y-1">
                            {dayEvents.map((ev) => (
                              <div key={ev.id}
                                className={`border px-2 py-1.5 text-[11px] cursor-default ${ev.tagColor} rounded-none`}
                              >
                                <p className="font-bold leading-tight line-clamp-2">{ev.title}</p>
                                <p className="opacity-70 mt-0.5 text-[10px]">{fmtTime(ev.start)}–{fmtTime(ev.end)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Today's detail schedule */}
          <div className="border-t border-neutral-200">
            <div className="px-5 py-2 bg-neutral-50 border-b border-neutral-200">
              <span className="text-xs font-bold uppercase tracking-wide text-neutral-800">
                {t.SCHEDULE_DETAILS}
              </span>
            </div>
            {(() => {
              const todayEvents = getEventsForDay(today);
              if (todayEvents.length === 0) return (
                <p className="px-5 py-6 text-center text-xs text-neutral-400 font-sans">{t.NO_EVENTS}</p>
              );
              return (
                <div className="divide-y divide-neutral-200">
                  {todayEvents.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-4 px-5 py-2.5">
                      <div className="shrink-0 text-center w-14">
                        <span className="block text-sm font-bold text-neutral-900">{fmtTime(ev.start)}</span>
                        <span className="block text-[11px] text-neutral-400">{fmtTime(ev.end)}</span>
                      </div>
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 bg-[#990000]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-neutral-800">{ev.title}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{ev.location}</p>
                      </div>
                      <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-bold border ${ev.tagColor}`}>{ev.tag}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </main>
      </div>

      {/* Quick-glance: tasks, requests & assets */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* My Tasks (Pending Approvals) */}
        <div className="border border-neutral-200 bg-white rounded-none overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
              <Inbox className="h-3.5 w-3.5 text-[#990000]" /> {t.MY_TASKS_WIDGET}
            </span>
            {openTasks.length > 0 && (
              <span className="bg-[#990000] border border-[#990000] px-1.5 py-0.2 text-[9px] font-bold text-white">{openTasks.length} {t.OPEN_TASKS}</span>
            )}
          </div>
          <div className="divide-y divide-neutral-100 max-h-[220px] overflow-y-auto">
            {tasks.slice(0, 4).map((tk) => (
              <div key={tk.id} className="flex items-start justify-between gap-2 px-3 py-2 hover:bg-neutral-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-800 leading-snug">{tk.title}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{tk.requester} · {tk.date}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {tk.status === 'Open' ? (
                    <>
                      <button
                        onClick={() => decideTask(tk.id, 'Approved')}
                        title="Approve"
                        className="flex items-center justify-center h-5 w-5 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => decideTask(tk.id, 'Rejected')}
                        title="Reject"
                        className="flex items-center justify-center h-5 w-5 rounded bg-[#990000] hover:bg-red-800 text-white transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-none ${TASK_STATUS_BADGE[tk.status]}`}>{tk.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Requests (My Forms) */}
        <div className="border border-neutral-200 bg-white rounded-none overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
              <Send className="h-3.5 w-3.5 text-[#990000]" /> {t.MY_REQUESTS_WIDGET}
            </span>
            {openForms.length > 0 && (
              <span className="bg-[#990000] border border-[#990000] px-1.5 py-0.2 text-[9px] font-bold text-white">{openForms.length} {t.PENDING_FORMS}</span>
            )}
          </div>
          <div className="divide-y divide-neutral-100 max-h-[220px] overflow-y-auto">
            {myForms.slice(0, 4).map((f) => (
              <div key={f.id} className="flex items-start justify-between gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-800 truncate">{f.form}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{f.group} · {f.date}</p>
                </div>
                <span className={`shrink-0 px-1.5 py-0.2 text-[8px] font-bold rounded-none ${TASK_STATUS_BADGE[f.status]}`}>{f.status}</span>
              </div>
            ))}
          </div>

        </div>

        {/* My Assets */}
        <div className="border border-neutral-200 bg-white rounded-none overflow-hidden">
          <div className="px-4 py-2 border-b border-neutral-200 bg-neutral-900 text-white flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
              <MonitorSmartphone className="h-3.5 w-3.5 text-[#990000]" /> {t.MY_ASSETS_WIDGET}
            </span>
            <span className="border border-white/30 bg-white/10 px-1.5 py-0.2 text-[9px] font-bold text-white">{MY_ASSETS.length} {t.ASSETS_COUNT}</span>
          </div>
          <div className="divide-y divide-neutral-100 max-h-[220px] overflow-y-auto">
            {dueSoonAssets.concat(MY_ASSETS.filter((a) => !a.due)).slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-2.5 px-4 py-2 hover:bg-neutral-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-800 truncate">{a.name}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{a.type} · checked out {a.checked_out}</p>
                </div>
                <span className="shrink-0 text-[9px] text-[#990000] font-bold">{a.due ? `${t.DUE} ${a.due}` : t.PERMANENT}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helper to identify category group of any selected key */
function getActiveCategory(selected) {
  if (selected.startsWith('wiki-') || selected === 'cat-wiki') return 'wiki-hub-root';
  if (selected.startsWith('contacts-') || selected === 'cat-contacts') return 'contacts-root';
  if (selected.startsWith('form:') && selected !== 'form:payment-request') return 'requests-forms';
  if (['my-tasks', 'my-forms', 'requests-forms', 'cat-forms'].includes(selected)) return 'requests-forms';
  return 'my-portal';
}


/* ---------------- Main PersonalDashboard Component ---------------- */

export default function PersonalDashboard({ onNavigate }) {
  const { lang } = useLanguage();
  const [selected, setSelected] = useState('workspace-calendar');
  const [activeCategory, setActiveCategory] = useState('my-portal');
  const [nodeExpanded, setNodeExpanded] = useState({});
  const [filters, setFilters] = useState({
    formCategory: 'All', tasksStatus: 'All', formsStatus: 'All', assetType: 'All',
  });

  useEffect(() => {
    // Top nav profile redirect selections map to IA views
    const handleSelect = (e) => {
      if (e.detail) {
        if (e.detail === 'my-portal') setSelected('profile-bio');
        else if (e.detail === 'cat-forms') setSelected('cat-forms');
        else if (e.detail === 'cat-wiki') setSelected('cat-wiki');
        else if (e.detail === 'cat-contacts') setSelected('contacts-colleagues');
        else setSelected(e.detail);
      }
    };
    window.addEventListener('select-dashboard', handleSelect);
    return () => window.removeEventListener('select-dashboard', handleSelect);
  }, []);

  // Sync active category group on selected key changes
  useEffect(() => {
    if (selected !== 'workspace-calendar') {
      setActiveCategory(getActiveCategory(selected));
    }
  }, [selected]);

  const active = usePaneContent(selected, filters, setSelected, lang);
  const ActiveIcon = active.icon ?? FileText;

  const toggleNode = (id) =>
    setNodeExpanded((p) => ({ ...p, [id]: !(p[id] ?? false) }));

  const setFilter = (id, value) => setFilters((p) => ({ ...p, [id]: value }));

  // Get active localization structure
  const t = NAVIGATION_LOCALIZATION[lang] || NAVIGATION_LOCALIZATION.en;

  if (selected === 'workspace-calendar') {
    return <WorkspaceCalendarLayout onNavigate={onNavigate ?? (() => {})} onSelect={setSelected} lang={lang} />;
  }

  const categoryNode = t.SIDEBAR_TREE.find((n) => n.id === activeCategory);

  return (
    <div className="w-full font-sans">
      
      {/* Page Header */}
      <header className="border-l-4 border-[#990000] pl-4 py-1 mb-6 flex items-start justify-between rounded-none">
        <div>
          <h1 className="font-barlow text-3xl font-extrabold uppercase tracking-wider text-iscm-charcoal">
            {lang === 'vi' ? 'CỔNG TÁC NGHIỆP CÁ NHÂN' : 'PERSONAL PORTAL & OPERATIONS'}
          </h1>
          <p className="font-ibm text-xs uppercase tracking-wider text-gray-500 mt-1">
            2026 Operational Network · ISCM-UEH
          </p>
        </div>
        <button
          onClick={() => setSelected('workspace-calendar')}
          className="btn-secondary text-[10px] py-1 px-2.5 mr-2 font-bold hover:border-[#990000] hover:text-[#990000]"
        >
          ← {lang === 'vi' ? 'Không gian làm việc' : 'Workspace'}
        </button>
      </header>

      {/* Master-Detail split screen */}
      <div className="grid items-start gap-4 md:grid-cols-10">
        
        {/* LEFT — Localized Tabbed Tree Navigation View */}
        <aside className="border border-neutral-200 bg-white p-2.5 md:col-span-2 rounded-none">

          <div className="max-h-[680px] overflow-y-auto pr-1">
            {categoryNode && (
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#990000] bg-neutral-50 border-b border-neutral-200 py-1.5 px-2 mb-2 select-none text-left">
                  {categoryNode.label}
                </div>
                {categoryNode.children && (
                  <TreeLevel
                    nodes={categoryNode.children}
                    depth={1}
                    selected={selected}
                    onSelect={setSelected}
                    expanded={nodeExpanded}
                    onToggle={toggleNode}
                    filters={filters}
                    onFilter={setFilter}
                  />
                )}
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT — Dynamic Content Viewport */}
        <main className="border border-neutral-200 bg-white p-5 md:col-span-8 rounded-none min-h-[500px]">
          <div className="border-l-4 border-[#990000] pl-4 py-1 mb-6 flex items-start justify-between rounded-none">
            <div>
              <h2 className="font-barlow text-2xl font-extrabold uppercase tracking-wider text-iscm-charcoal flex items-center gap-2">
                <ActiveIcon className="h-5 w-5 text-[#990000] shrink-0" /> {active.title}
              </h2>
              <p className="font-ibm text-[10px] uppercase tracking-wider text-gray-500 mt-1">
                {lang === 'vi' ? 'Cổng tác nghiệp cá nhân' : 'Personal Portal Operational View'}
              </p>
            </div>
          </div>
          {active.body}
        </main>
      </div>
    </div>
  );
}
