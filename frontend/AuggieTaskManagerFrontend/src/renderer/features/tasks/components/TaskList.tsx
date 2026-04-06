import { TaskCard } from './TaskCard';
import { Task, TaskForm } from '../../../types/task';
import { useState } from 'react';
import { TaskFormModal } from './TaskFormModal';

export interface TaskListProps {
  tasks: Task[];
  completeTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  createTask: (values: TaskForm) => Promise<boolean>;
}

export const TaskList = ({
  tasks,
  completeTask,
  deleteTask,
  createTask,
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
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsOpen(true)}
          >
            Add Task
          </button>
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
