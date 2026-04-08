import { Task, Developer } from '../../types';
import Checkbox from '../shared/Checkbox';
import DeveloperSelect from '../shared/DeveloperSelect';
import { formatDate } from '../../utils/dates';

interface TaskItemProps {
  task: Task;
  developers: [Developer, Developer];
  onToggle: () => void;
  onAssign: (devId: string | null) => void;
}

export default function TaskItem({ task, developers, onToggle, onAssign }: TaskItemProps) {
  return (
    <div
      className={`flex items-center gap-3 py-2 px-3 rounded-lg group transition-colors ${
        task.completed ? 'bg-status-done/5' : 'hover:bg-bg-tertiary'
      }`}
    >
      <Checkbox checked={task.completed} onChange={onToggle} />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm transition-colors ${
            task.completed ? 'text-gray-500 line-through' : 'text-gray-200'
          }`}
        >
          {task.title}
        </p>
        {task.completedDate && (
          <p className="text-xs text-gray-600 mt-0.5">Completed {formatDate(task.completedDate)}</p>
        )}
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DeveloperSelect developers={developers} value={task.assignedTo} onChange={onAssign} />
      </div>
    </div>
  );
}
