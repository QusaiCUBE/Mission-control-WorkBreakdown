import { useProject } from './hooks/useProject';
import { useViewState } from './hooks/useViewState';
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

export default function App() {
  const projectHook = useProject();
  const { project } = projectHook;
  const viewState = useViewState();
  const { currentView, selectedModuleId, isDetailOpen } = viewState;

  const overallProgress = getOverallProgress(project.modules);
  const phaseDurations = project.phases.map((p) =>
    Math.round((daysBetween(p.startDate, p.endDate) + 1) / 7)
  );
  const selectedModule = selectedModuleId
    ? project.modules.find((m) => m.id === selectedModuleId)
    : null;

  return (
    <div className="min-h-screen bg-bg-primary text-gray-200">
      <Sidebar currentView={currentView} onViewChange={viewState.setCurrentView} />

      <div className="pl-16 lg:pl-56 transition-all duration-200">
        <Header currentView={currentView} overallProgress={overallProgress} />

        <main className="p-6">
          <div key={currentView} className="view-enter">
          {currentView === 'dashboard' && (
            <DashboardView project={project} onModuleClick={viewState.openModuleDetail} onUpdatePhase={projectHook.updatePhase} onAddPhase={projectHook.addPhase} onRemovePhase={projectHook.removePhase} />
          )}

          {currentView === 'board' && (
            <BoardView
              modules={project.modules}
              developers={project.developers}
              phases={project.phases}
              onMoveModule={projectHook.moveModule}
              onModuleClick={viewState.openModuleDetail}
              onAddModule={projectHook.addModule}
            />
          )}

          {currentView === 'timeline' && (
            <TimelineView
              modules={project.modules}
              developers={project.developers}
              phases={project.phases}
              projectStartDate={project.startDate}
              onModuleClick={viewState.openModuleDetail}
              onUpdateDates={projectHook.updateModuleDates}
              onReorderModules={projectHook.reorderModules}
            />
          )}

          {currentView === 'workload' && (
            <WorkloadView
              modules={project.modules}
              developers={project.developers}
              phases={project.phases}
              projectStartDate={project.startDate}
              onModuleClick={viewState.openModuleDetail}
              onAssignModule={projectHook.assignModule}
            />
          )}

          {currentView === 'settings' && (
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
          </div>
        </main>
      </div>

      <SlideOver isOpen={isDetailOpen} onClose={viewState.closeModuleDetail}>
        {selectedModule && (
          <ModuleDetail
            module={selectedModule}
            developers={project.developers}
            onClose={viewState.closeModuleDetail}
            onUpdateModule={projectHook.updateModule}
            onAssignModule={projectHook.assignModule}
            onUpdateNotes={projectHook.updateModuleNotes}
            onUpdatePriority={projectHook.updateModulePriority}
            onUpdateCompletedDate={projectHook.updateCompletedDate}
            onAddDocument={projectHook.addDocument}
            onUpdateDocument={projectHook.updateDocument}
            onRemoveDocument={projectHook.removeDocument}
          />
        )}
      </SlideOver>
    </div>
  );
}
