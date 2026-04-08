import { TaskCard } from './TaskCard';
import { Task, TaskForm } from '../../../types/task';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react';
import { TaskFormModal } from './TaskFormModal';

export interface TaskListProps {
  tasks: Task[];
  isAscending: boolean;
  setIsAscending: Dispatch<SetStateAction<boolean>>;
  completeTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  createTask: (values: TaskForm) => Promise<boolean>;
  onSyncMoodle?: () => void;
  isMoodleSyncing?: boolean;
}

export const TaskList = ({
  tasks,
  isAscending,
  setIsAscending,
  completeTask,
  deleteTask,
  createTask,
  onSyncMoodle,
  isMoodleSyncing = false,
}: TaskListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => {
    setIsOpen(false);
  };
  const handleSubmit = async (values: TaskForm) => {
    const ok = await createTask(values);
    if (ok) {
      setIsOpen(false);
    }
  };
  return (
    <div>
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="flex items-center justify-between gap-2 p-4 pb-2 text-xl opacity-60 tracking-wide">
          <span>Tasks</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-primary btn-square btn-sm"
              aria-pressed={isAscending}
              aria-label={
                isAscending
                  ? 'Sorted by due date ascending. Activate to sort descending.'
                  : 'Sorted by due date descending. Activate to sort ascending.'
              }
              title={
                isAscending
                  ? 'Due date ascending — click for descending'
                  : 'Due date descending — click for ascending'
              }
              onClick={() => setIsAscending((prev) => !prev)}
            >
              {isAscending ? (
                <ArrowUpNarrowWide className="h-4 w-4" aria-hidden />
              ) : (
                <ArrowDownNarrowWide className="h-4 w-4" aria-hidden />
              )}
            </button>
            {onSyncMoodle && (
              <button
                type="button"
                className="btn btn-outline btn-primary shrink-0 whitespace-nowrap"
                disabled={isMoodleSyncing}
                onClick={() => onSyncMoodle()}
              >
                {isMoodleSyncing ? 'Syncing…' : 'Sync from Moodle'}
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsOpen(true)}
            >
              Add Task
            </button>
          </div>
        </li>
        <TaskFormModal
          open={isOpen}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
        {tasks.map((task, index) => (
          <li className="list-row" key={task.id}>
            <div className="w-8 shrink-0 text-right text-lg font-thin opacity-30 tabular-nums">
              {index + 1}
            </div>
            <TaskCard
              task={task}
              onComplete={() => completeTask(task)}
              onDelete={() => deleteTask(task.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
