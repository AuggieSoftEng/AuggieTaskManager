import { useMemo, useState } from 'react';
import { TaskList } from './TaskList';
import { Task, WeeklyTaskList, type DayOfWeek } from '../../../types/task';
import { endOfCurrentWeek, startOfCurrentWeek } from '../hooks/useTasks';

const WEEKDAYS: readonly DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export interface WeeklyTasksProps {
  tasks: Task[];
  weekStart?: Date;
  weekEnd?: Date;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  completeTask: (task: Task) => Promise<void>;
  uncompleteTask: (task: Task) => Promise<void>;
}

export const WeeklyTasks = ({
  tasks,
  updateTask,
  deleteTask,
  completeTask,
  uncompleteTask,
}: WeeklyTasksProps) => {
  const [weekOffset, setWeekOffset] = useState(0);

  const baseDate = useMemo(() => {
    const now = new Date();
    now.setDate(now.getDate() + weekOffset * 7);
    return now;
  }, [weekOffset]);

  const weekStart = useMemo(() => startOfCurrentWeek(1, baseDate), [baseDate]);
  const weekEnd = useMemo(() => endOfCurrentWeek(1, baseDate), [baseDate]);

  const weeklyTasks = useMemo(() => {
    const tasksInWeek = tasks.filter((task) => {
      const due = new Date(task.due_date);
      if (Number.isNaN(due.getTime())) return false;
      return due >= weekStart && due <= weekEnd;
    });

    return WEEKDAYS.reduce((acc: WeeklyTaskList, day, dayIndex) => {
      acc[day] = tasksInWeek.filter(
        (task) => (new Date(task.due_date).getDay() + 6) % 7 === dayIndex
      );
      return acc;
    }, {} as WeeklyTaskList);
  }, [tasks, weekEnd, weekStart]);

  const formatRange = (start: Date, end: Date) => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    });
    return `${formatter.format(start)} – ${formatter.format(end)}`;
  };

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 shadow-md">
        <div className="card-body gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="card-title text-2xl">Weekly Tasks</h1>
              <p className="text-sm opacity-70">
                {formatRange(weekStart, weekEnd)}
              </p>
            </div>
            <div className="join">
              <button
                type="button"
                className="btn join-item"
                onClick={() => setWeekOffset((offset) => offset - 1)}
              >
                Prev
              </button>
              <button
                type="button"
                className="btn btn-primary join-item"
                onClick={() => setWeekOffset(0)}
                disabled={weekOffset === 0}
              >
                Current
              </button>
              <button
                type="button"
                className="btn join-item"
                onClick={() => setWeekOffset((offset) => offset + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {WEEKDAYS.map((day) => {
        const tasks = weeklyTasks[day];
        return (
          <div key={day}>
            <h2 className="text-2xl font-bold">{day}</h2>
            <TaskList
              tasks={tasks}
              completeTask={completeTask}
              uncompleteTask={uncompleteTask}
              updateTask={updateTask}
              deleteTask={deleteTask}
            />
          </div>
        );
      })}
    </div>
  );
};
