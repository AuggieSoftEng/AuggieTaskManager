import { useMemo } from 'react';
import { TaskList } from './TaskList';
import { Task } from '../../../types/task';
import { buildTasksByCalendarDays, NO_TASKS_LABEL } from '../utils';

export interface MonthlyTasksProps {
  tasks: Task[];
  monthStart: Date;
  monthEnd: Date;
  monthOffset: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetMonth: () => void;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  completeTask: (task: Task) => Promise<void>;
  uncompleteTask: (task: Task) => Promise<void>;
}

const monthTitleFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
});

const dayHeadingFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
});

export const MonthlyTasks = ({
  tasks,
  monthStart,
  monthEnd,
  monthOffset,
  onPrevMonth,
  onNextMonth,
  onResetMonth,
  updateTask,
  deleteTask,
  completeTask,
  uncompleteTask,
}: MonthlyTasksProps) => {
  const dayBuckets = useMemo(
    () => buildTasksByCalendarDays(tasks, monthStart, monthEnd),
    [tasks, monthStart, monthEnd]
  );

  const monthTitle = monthTitleFormatter.format(monthStart);

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 shadow-md">
        <div className="card-body gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="card-title text-2xl">Monthly Tasks</h1>
              <p className="text-sm opacity-70">{monthTitle}</p>
            </div>
            <div className="join">
              <button
                type="button"
                className="btn join-item"
                onClick={onPrevMonth}
              >
                Prev
              </button>
              <button
                type="button"
                className="btn btn-primary join-item"
                onClick={onResetMonth}
                disabled={monthOffset === 0}
              >
                Current
              </button>
              <button
                type="button"
                className="btn join-item"
                onClick={onNextMonth}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {dayBuckets.map(({ date, tasks: dayTasks }) => (
        <div key={date.toISOString()}>
          <h2 className="text-2xl font-bold">
            {dayHeadingFormatter.format(date)}
          </h2>
          {dayTasks.length === 0 ? (
            <p className="text-sm opacity-70">{NO_TASKS_LABEL}</p>
          ) : (
            <TaskList
              tasks={dayTasks}
              completeTask={completeTask}
              uncompleteTask={uncompleteTask}
              updateTask={updateTask}
              deleteTask={deleteTask}
            />
          )}
        </div>
      ))}
    </div>
  );
};
