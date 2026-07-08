import NavBar from './NavBar.jsx';

/**
 * Global application shell — public-site navbar on top,
 * internal module canvas (bg-light-neutral) below.
 */
export default function AppLayout({ active, onNavigate, onOpenWorkspace, onOpenAsset, children }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <NavBar
        active={active}
        onNavigate={onNavigate}
        onOpenWorkspace={onOpenWorkspace}
        onOpenAsset={onOpenAsset}
      />
      <main className="min-w-0 flex-1 overflow-y-auto bg-neutral-50 p-4 lg:px-6 lg:py-5">{children}</main>
    </div>
  );
}
