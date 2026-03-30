import { TaskList } from './TaskList';
import { Task } from '../../../types/task';
import { useState, useEffect } from 'react';
import { TaskService } from '../services/taskService';
import { AuthService } from '../../auth/services/authService';
import { AlertCard } from '../../../components/common/AlertCard';

export const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [moodleUrl, setMoodleUrl] = useState<string | null>(
    AuthService.getCurrentUser()?.moodle_url
  );
  const [hasMoodleUrl, setHasMoodleUrl] = useState<boolean>(false);

  const handleImportMoodleTasks = async () => {
    if (moodleUrl) {
      const result = await TaskService.loadMoodleCalendarUrl(moodleUrl);
      setTasks((tasks) => [...tasks, ...result]);
      setHasMoodleUrl(true);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasks = await TaskService.getTasks();
        setTasks(tasks);
      } catch (error) {
        setErrorMessage('Error fetching tasks');
      }
    };
    fetchTasks();
  }, []);

  return (
    <div>
      {errorMessage && <AlertCard type="error" message={errorMessage} />}
      {!hasMoodleUrl && (
        <div className="rounded-box border border-base-300 bg-base-200/40 p-4 shadow-sm">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Moodle calendar URL</legend>
            <div className="flex flex-row items-stretch gap-2">
              <input
                type="text"
                className="input min-w-0 flex-1"
                placeholder="Paste your Moodle calendar URL"
                value={moodleUrl ?? ''}
                onChange={(e) => setMoodleUrl(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary shrink-0 whitespace-nowrap"
                onClick={handleImportMoodleTasks}
              >
                Import Tasks
              </button>
            </div>
            <p className="label mt-1">
              Add your Moodle URL to your profile to see your tasks here.
            </p>
          </fieldset>
        </div>
      )}
      <TaskList tasks={tasks} />
    </div>
  );
};
