import { Developer } from '../../types';
import DeveloperNameEditor from './DeveloperNameEditor';
import ProjectDateEditor from './ProjectDateEditor';
import DataExportImport from './DataExportImport';
import ResetButton from './ResetButton';

interface SettingsViewProps {
  developers: [Developer, Developer];
  startDate: string;
  phaseDurations: number[];
  onUpdateDeveloperName: (devId: string, name: string) => void;
  onUpdateStartDate: (date: string) => void;
  onUpdatePhaseDurations: (durations: number[]) => void;
  onExport: () => string;
  onImport: (json: string) => void;
  onReset: () => void;
}

export default function SettingsView({
  developers,
  startDate,
  phaseDurations,
  onUpdateDeveloperName,
  onUpdateStartDate,
  onUpdatePhaseDurations,
  onExport,
  onImport,
  onReset,
}: SettingsViewProps) {
  return (
    <div className="max-w-2xl space-y-8">
      <DeveloperNameEditor developers={developers} onUpdateName={onUpdateDeveloperName} />

      <div className="border-t border-border-primary pt-8">
        <ProjectDateEditor
          startDate={startDate}
          phaseDurations={phaseDurations}
          onUpdateStartDate={onUpdateStartDate}
          onUpdatePhaseDurations={onUpdatePhaseDurations}
        />
      </div>

      <div className="border-t border-border-primary pt-8">
        <DataExportImport onExport={onExport} onImport={onImport} />
      </div>

      <div className="border-t border-border-primary pt-8">
        <ResetButton onReset={onReset} />
      </div>
    </div>
  );
}
