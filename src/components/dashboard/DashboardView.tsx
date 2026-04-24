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
  readOnly?: boolean;
}

export default function DashboardView({ project, onModuleClick, onUpdatePhase, onAddPhase, onRemovePhase, readOnly }: DashboardViewProps) {
  return (
    <div className="space-y-4">
      <div className="animate-fade-up">
        <PhaseTimeline phases={project.phases} projectStartDate={project.startDate} onUpdatePhase={onUpdatePhase} onAddPhase={onAddPhase} onRemovePhase={onRemovePhase} readOnly={readOnly} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="animate-fade-up-1">
          <OverallProgress modules={project.modules} />
        </div>
        <div className="animate-fade-up-2">
          <WorkloadSplit modules={project.modules} developers={project.developers} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 animate-fade-up-3">
          <ModuleStatusGrid
            modules={project.modules}
            developers={project.developers}
            onModuleClick={onModuleClick}
          />
        </div>
        <div className="animate-fade-up-4">
          <UpcomingDeadlines
            modules={project.modules}
            developers={project.developers}
            onModuleClick={onModuleClick}
          />
        </div>
      </div>
    </div>
  );
}
