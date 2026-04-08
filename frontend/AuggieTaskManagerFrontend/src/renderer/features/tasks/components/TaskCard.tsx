// Task detail card
import { Task } from '../../../types/task';
import { TrashIcon, CheckIcon, X } from 'lucide-react';

export interface TaskCardProps {
  task: Task;
  onComplete?: () => void;
  onUncomplete?: () => void;
  onDelete?: () => void;
}

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const TaskCard = ({
  task,
  onComplete,
  onUncomplete,
  onDelete,
}: TaskCardProps) => {
  return (
    <div className="card card-border bg-base-200 w-full">
      <div className="card-body w-full">
        <h2 className="card-title">{task.title}</h2>
        <p>{task.description || 'No description.'}</p>
        {task.due_date != null && task.due_date !== '' && (
          <p>Due date: {formatDueDate(task.due_date)}</p>
        )}
        {task.course != null && task.course !== '' && (
          <p>Course: {task.course}</p>
        )}
        <p>Completed: {task.completed ? 'Yes' : 'No'}</p>
        {task.source && <p>Source: {task.source}</p>}
        <div className="card-actions justify-end gap-1">
          {task.completed ? (
            <button
              type="button"
              className="btn btn-square btn-sm btn-outline btn-primary"
              aria-label="Mark task as not completed"
              title="Mark incomplete"
              onClick={onUncomplete}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-square btn-sm btn-primary"
              aria-label="Mark task as completed"
              title="Mark complete"
              onClick={onComplete}
            >
              <CheckIcon className="h-4 w-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            className="btn btn-square btn-sm btn-error"
            aria-label="Delete task"
            title="Delete task"
            onClick={onDelete}
          >
            <TrashIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};
