import { useState, useCallback } from 'react';
import { useProject } from './hooks/useProject';
import { useViewState } from './hooks/useViewState';
import LoginScreen from './components/auth/LoginScreen';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import SlideOver from './components/layout/SlideOver';
import DashboardView from './components/dashboard/DashboardView';
import BoardView from './components/board/BoardView';
import TimelineView from './components/timeline/TimelineView';
import WorkloadView from './components/workload/WorkloadView';
import SettingsView from './components/settings/SettingsView';
import ModuleDetail from './components/detail/ModuleDetail';
import { getOverallProgress } from './utils/progress';
import { daysBetween } from './utils/dates';
import { getPermissions } from './utils/permissions';

const AUTH_KEY = 'mc-auth-user';

export default function App() {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem(AUTH_KEY));
  const projectHook = useProject();
  const { project } = projectHook;
  const viewState = useViewState();
  const { currentView, selectedModuleId, isDetailOpen } = viewState;

  const handleLogin = useCallback((username: string) => {
    localStorage.setItem(AUTH_KEY, username);
    setUser(username);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const perms = getPermissions(user);
  const overallProgress = getOverallProgress(project.modules);
  const phaseDurations = project.phases.map((p) =>
    Math.round((daysBetween(p.startDate, p.endDate) + 1) / 7)
  );
  const selectedModule = selectedModuleId
    ? project.modules.find((m) => m.id === selectedModuleId)
    : null;

  // No-op handlers for restricted actions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noopAny = (..._args: any[]) => {};

  return (
    <div className="min-h-screen bg-bg-primary text-gray-200">
      <Sidebar currentView={currentView} onViewChange={viewState.setCurrentView} hideSettings={!perms.canAccessSettings} />

      <div className="pl-16 lg:pl-56 transition-all duration-200">
        <Header currentView={currentView} overallProgress={overallProgress} user={user} onLogout={handleLogout} />

        <main className="p-6">
          <div key={currentView} className="view-enter">
          {currentView === 'dashboard' && (
            <DashboardView
              project={project}
              onModuleClick={viewState.openModuleDetail}
              onUpdatePhase={perms.canEditPhases ? projectHook.updatePhase : noopAny}
              onAddPhase={perms.canAddPhases ? projectHook.addPhase : () => {}}
              onRemovePhase={perms.canEditPhases ? projectHook.removePhase : noopAny}
              readOnly={!perms.canEditPhases}
            />
          )}

          {currentView === 'board' && (
            <BoardView
              modules={project.modules}
              developers={project.developers}
              phases={project.phases}
              onMoveModule={perms.canMoveModules ? projectHook.moveModule : noopAny}
              onModuleClick={viewState.openModuleDetail}
              onAddModule={perms.canCreateModules ? projectHook.addModule : undefined}
              readOnly={!perms.canMoveModules}
            />
          )}

          {currentView === 'timeline' && (
            <TimelineView
              modules={project.modules}
              developers={project.developers}
              phases={project.phases}
              projectStartDate={project.startDate}
              onModuleClick={viewState.openModuleDetail}
              onUpdateDates={perms.canEditDates ? projectHook.updateModuleDates : () => {}}
              onReorderModules={perms.canEditModules ? projectHook.reorderModules : () => {}}
              readOnly={!perms.canEditDates}
            />
          )}

          {currentView === 'workload' && (
            <WorkloadView
              modules={project.modules}
              developers={project.developers}
              phases={project.phases}
              projectStartDate={project.startDate}
              onModuleClick={viewState.openModuleDetail}
              onAssignModule={perms.canAssign ? projectHook.assignModule : noopAny}
            />
          )}

          {currentView === 'settings' && perms.canAccessSettings && (
            <SettingsView
              developers={project.developers}
              startDate={project.startDate}
              phaseDurations={phaseDurations}
              onUpdateDeveloperName={projectHook.updateDeveloperName}
              onUpdateStartDate={projectHook.updateStartDate}
              onUpdatePhaseDurations={projectHook.updatePhaseDurations}
              onExport={projectHook.exportData}
              onImport={projectHook.importData}
              onReset={projectHook.resetProject}
            />
          )}

          {currentView === 'settings' && !perms.canAccessSettings && (
            <div className="flex items-center justify-center h-[60vh]">
              <p className="text-gray-500 text-lg">You don't have permission to access Settings</p>
            </div>
          )}
          </div>
        </main>
      </div>

      <SlideOver isOpen={isDetailOpen} onClose={viewState.closeModuleDetail}>
        {selectedModule && (
          <ModuleDetail
            module={selectedModule}
            developers={project.developers}
            onClose={viewState.closeModuleDetail}
            onUpdateModule={perms.canEditModules ? projectHook.updateModule : noopAny}
            onAssignModule={perms.canAssign ? projectHook.assignModule : noopAny}
            onUpdatePriority={perms.canEditModules ? projectHook.updateModulePriority : noopAny}
            onUpdateProgress={perms.canEditModules ? projectHook.updateModuleProgress : noopAny}
            onAddLogEntry={
              perms.canEditNotes
                ? (moduleId, date, text) => projectHook.addLogEntry(moduleId, date, text, user)
                : noopAny
            }
            onUpdateLogEntry={perms.canEditNotes ? projectHook.updateLogEntry : noopAny}
            onRemoveLogEntry={perms.canEditNotes ? projectHook.removeLogEntry : noopAny}
            readOnly={!perms.canEditModules}
          />
        )}
      </SlideOver>
    </div>
  );
}
