import { useState } from 'react';
import { LanguageProvider } from './i18n/LanguageContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import PersonalDashboard from './pages/PersonalDashboard.jsx';
import ExecutiveCalendar from './pages/ExecutiveCalendar.jsx';
import ExecutiveDashboard from './pages/ExecutiveDashboard.jsx';
import MatrixAssignerPage from './pages/MatrixAssignerPage.jsx';
import ResearchSubWorkspace from './pages/ResearchSubWorkspace.jsx';
import ProjectWorkspace from './pages/ProjectWorkspace.jsx';
import GlobalLibrary from './pages/GlobalLibrary.jsx';
import GovernanceRegulations from './pages/GovernanceRegulations.jsx';
import HierarchicalProjects from './pages/HierarchicalProjects.jsx';
import ApprovalEngine from './pages/ApprovalEngine.jsx';
import EquipmentTracking from './pages/EquipmentTracking.jsx';
import IscmOverviewStructure from './pages/IscmOverviewStructure.jsx';

export default function App() {
  const [activeModule, setActiveModule] = useState('personal-dashboard');
  const [workspaceProjectId, setWorkspaceProjectId] = useState('a1111111-1111-1111-1111-111111111111'); // default project UUID

  /** "Không gian của tôi" / search result opens workspace */
  const handleOpenWorkspace = (projectId) => {
    setWorkspaceProjectId(projectId);
    setActiveModule('workspace');
  };

  /** Global search click callback */
  const handleOpenSearchResult = (item) => {
    if (item.kind === 'template' || item.kind === 'library') {
      setActiveModule('library');
    } else if (item.project_id) {
      handleOpenWorkspace(item.project_id);
    }
  };

  const renderPlaceholder = (route) => {
    const sectionName = route.replace('placeholder-', '').toUpperCase();
    return (
      <div className="mx-auto max-w-xl text-center py-20 space-y-4">
        <div className="text-4xl">🛠️</div>
        <h2 className="font-barlow text-xl font-bold uppercase text-iscm-charcoal">Under Construction</h2>
        <p className="font-ibm text-xs text-gray-500">
          Module <span className="font-semibold text-iscm-crimson font-barlow-condensed text-sm">{sectionName}</span> is defined in the ISCM Megamenu and will be linked to the live database in the next governance milestone.
        </p>
        <button
          onClick={() => setActiveModule('personal-dashboard')}
          className="btn-primary py-2 px-4 text-xs font-semibold"
        >
          Return to Personal Dashboard
        </button>
      </div>
    );
  };

  return (
    <LanguageProvider>
      <AppLayout
        active={activeModule}
        onNavigate={setActiveModule}
        onOpenWorkspace={handleOpenWorkspace}
        onOpenAsset={handleOpenSearchResult}
      >
      {activeModule === 'personal-dashboard' && <PersonalDashboard />}
      {activeModule === 'executive-calendar' && <ExecutiveCalendar />}
      {activeModule === 'executive-dashboard' && <ExecutiveDashboard onNavigate={setActiveModule} />}
      {activeModule === 'matrix-assigner' && <MatrixAssignerPage />}
      {activeModule === 'research-sub-workspace' && <ResearchSubWorkspace />}

      {/* Đề án 1 — ISCM OS core modules */}
      {activeModule === 'hierarchical-projects' && <HierarchicalProjects />}
      {activeModule === 'approval-engine' && <ApprovalEngine />}
      {activeModule === 'equipment-tracking' && <EquipmentTracking />}
      {activeModule === 'placeholder-dl3' && <IscmOverviewStructure />}
      
      {/* Governance & Policy Regulations (CR1, CR2, CR3) */}
      {(activeModule === 'placeholder-cr1' || 
        activeModule === 'placeholder-cr2' || 
        activeModule === 'placeholder-cr3') && (
        <GovernanceRegulations section={activeModule} />
      )}
      
      {/* Retained core system views for search redirections & linkages */}
      {activeModule === 'workspace' && (
        <ProjectWorkspace projectId={workspaceProjectId} onSelectProject={setWorkspaceProjectId} />
      )}
      {activeModule === 'library' && <GlobalLibrary />}

      {activeModule.startsWith('placeholder-') && 
        activeModule !== 'placeholder-cr1' && 
        activeModule !== 'placeholder-cr2' && 
        activeModule !== 'placeholder-cr3' && 
        activeModule !== 'placeholder-dl3' && 
        renderPlaceholder(activeModule)}
      </AppLayout>
    </LanguageProvider>
  );
}
