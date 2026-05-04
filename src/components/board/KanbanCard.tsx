import { Module, Developer } from '../../types';
import ModuleCard from '../shared/ModuleCard';

interface KanbanCardProps {
  module: Module;
  developers: [Developer, Developer];
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDelete?: () => void;
}

export default function KanbanCard({ module, developers, onClick, onDragStart, onDragEnd, onDelete }: KanbanCardProps) {
  return (
    <div onDragEnd={onDragEnd}>
      <ModuleCard
        module={module}
        developers={developers}
        onClick={onClick}
        draggable
        onDragStart={onDragStart}
        onDelete={onDelete}
      />
    </div>
  );
}
