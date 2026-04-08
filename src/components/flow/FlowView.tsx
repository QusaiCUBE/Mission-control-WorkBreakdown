import { useState } from 'react';
import { Module, Developer } from '../../types';
import { INTEGRATION_TASKS } from '../../data/tasks';
import FlowDiagram from './FlowDiagram';
import FlowModuleList from './FlowModuleList';

interface FlowViewProps {
  modules: Module[];
  developers: [Developer, Developer];
  onModuleClick: (moduleId: string) => void;
}

export default function FlowView({ modules, developers, onModuleClick }: FlowViewProps) {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="bg-bg-secondary border border-border-primary rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Integration Process Flow</h3>
        <p className="text-xs text-gray-500 mb-4">
          Click any step to see which modules are at that stage. Steps show completion progress across all modules.
        </p>

        <div className="overflow-x-auto">
          <FlowDiagram
            modules={modules}
            selectedStep={selectedStep}
            onSelectStep={(step) =>
              setSelectedStep((prev) => (prev === step ? null : step))
            }
          />
        </div>
      </div>

      {selectedStep !== null && (
        <FlowModuleList
          stepIndex={selectedStep}
          stepTitle={INTEGRATION_TASKS[selectedStep].title}
          modules={modules}
          developers={developers}
          onModuleClick={onModuleClick}
        />
      )}
    </div>
  );
}
