import { Project, Phase } from '../../types';
import PhaseTimeline from './PhaseTimeline';
import OverallProgress from './OverallProgress';
import WorkloadSplit from './WorkloadSplit';
import UpcomingDeadlines from './UpcomingDeadlines';
import ModuleStatusGrid from './ModuleStatusGrid';

interface DashboardViewProps {
  project: Project;
  onModuleClick: (moduleId: string) => void;
  onUpdatePhase: (phaseId: string, updates: Partial<Phase>) => void;
  onAddPhase: (name: string, startDate: string, endDate: string) => void;
  onRemovePhase: (phaseId: string) => void;
}

export default function DashboardView({ project, onModuleClick, onUpdatePhase, onAddPhase, onRemovePhase }: DashboardViewProps) {
  return (
    <div className="space-y-4">
      <PhaseTimeline phases={project.phases} projectStartDate={project.startDate} onUpdatePhase={onUpdatePhase} onAddPhase={onAddPhase} onRemovePhase={onRemovePhase} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OverallProgress modules={project.modules} />
        <WorkloadSplit modules={project.modules} developers={project.developers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ModuleStatusGrid
            modules={project.modules}
            developers={project.developers}
            onModuleClick={onModuleClick}
          />
        </div>
        <UpcomingDeadlines
          modules={project.modules}
          developers={project.developers}
          onModuleClick={onModuleClick}
        />
      </div>
    </div>
  );
}
