import { Task, Developer } from '../../types';
import TaskItem from './TaskItem';

interface TaskChecklistProps {
  tasks: Task[];
  developers: [Developer, Developer];
  onToggleTask: (taskId: string) => void;
  onAssignTask: (taskId: string, devId: string | null) => void;
}

export default function TaskChecklist({ tasks, developers, onToggleTask, onAssignTask }: TaskChecklistProps) {
  const completed = tasks.filter((t) => t.completed).length;
  const sorted = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">Tasks</h4>
        <span className="text-xs text-gray-400">
          {completed} of {tasks.length} complete
        </span>
      </div>

      <div className="space-y-0.5">
        {sorted.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            developers={developers}
            onToggle={() => onToggleTask(task.id)}
            onAssign={(devId) => onAssignTask(task.id, devId)}
          />
        ))}
      </div>
    </div>
  );
}
