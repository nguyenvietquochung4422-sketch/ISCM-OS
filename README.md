# ISCM Hub

Hybrid **ERP · CRM · KMS** portal on a matrix organization model for the **Institute of Smart City and Management (ISCM-UEH)** — internal workflow operations, partner directories, and institutional knowledge assets.

## Stack
- **Frontend:** React 18 + Vite, Tailwind CSS, Lucide React icons
- **Backend:** Supabase — PostgreSQL, Auth, Storage ([supabase/schema.sql](supabase/schema.sql))

## Branding (ISCM Corporate Identity)
| Token | Value | Usage |
|---|---|---|
| `iscm-header` | `#181818` | Global top navbar |
| `iscm-crimson` | `#990000` | Logo block, active states, focus cards |
| `iscm-cta` | `#000000` | Primary CTAs, phase/date blocks |
| `iscm-canvas` | `#F8F9FA` | Workspace background |
| `iscm-wrapper` | `#E5E7EB` | Phase/timeline containers |
| `font-barlow` | Barlow | Headers, titles, section labels |
| `font-barlow-condensed` | Barlow Condensed | KPI numbers, dates, phase badges |
| `font-ibm` | IBM Plex Sans | Body, tables, forms, nav |

Rounded 12px containers (`rounded-xl`) + glassmorphism via the `.glass-card` utility.

## Portal structure
**Navbar pillars** ([NavBar.jsx](src/components/NavBar.jsx)):
1. **Không gian của tôi** — dynamic dropdown of workspaces assigned to the logged-in profile (Director additionally sees the whole institute).
2. **Khối Chức năng** — Cluster A (Operation & Finance, PR & Communication, Partnership, Admin Console) + Cluster B (Đào tạo Học thuật, Nghiên cứu Khoa học, Gắn kết Cộng đồng).
3. **Kho Biểu mẫu Chuẩn** — 1-click template downloads + full Global Library page.

Far right: unified intelligent search (assets + templates + partners), language pill, UEH account, logout.

**Workspace** ([ProjectWorkspace.jsx](src/pages/ProjectWorkspace.jsx)) — asymmetric 35/65 grid: crimson Focus Card (project code, Vietnamese status tag, SDGs, matrix roster with cross-line markers, black "Nạp Tài Sản Mới" CTA) + gray Phase Box; right side hosts the 3-tab container:
1. 📝 **Tiến độ Kanban** (ERP) — drag & drop board with assignees and deadlines.
2. 📑 **Tài liệu văn phòng** (KMS) — office files with upload logs and version control.
3. 👥 **Đối tác & Liên kết** (CRM) — partner directory (Authority/Industry/Academia) + external Miro/Figma workboards.

**Executive Admin Matrix Console** ([AdminConsole.jsx](src/pages/AdminConsole.jsx)) — Cross-line Assigner (marks `is_cross_line`) + three-state Security Configurator (Draft → Internal Open → Confidential).

## Run
```bash
npm install
npm run dev        # http://localhost:5173
```

Ships with a mock dataset (`src/data/mockData.js`) mirroring the schema 1:1, so it runs without a backend.

## Go live with Supabase
1. Run [supabase/schema.sql](supabase/schema.sql) in the SQL Editor (tables, RLS, upload-log trigger, private storage bucket, seeds).
2. Copy `.env.example` → `.env` with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
3. Swap mock imports for queries through `src/lib/supabaseClient.js`.

### Security model (RLS)
- `Internal Open` → institute-wide (feeds the Global Library); `Draft`/`Confidential` → owning workspace only.
- Only the **Director** manages matrix assignments (`project_members`) and flips `security_level` globally.
- Global templates (`project_id IS NULL`) restricted to Template/Report types via check constraint.
- UEH e-mail domain enforced on `users_profiles.email`.

> Legacy note: the earlier WebGIS components ([SpatialMapTab.jsx](src/components/workspace/SpatialMapTab.jsx), [KnowledgeCommons.jsx](src/pages/KnowledgeCommons.jsx), [CodeLinksTab.jsx](src/components/workspace/CodeLinksTab.jsx)) are kept on disk but unrouted in the Trạm 1 scope.
