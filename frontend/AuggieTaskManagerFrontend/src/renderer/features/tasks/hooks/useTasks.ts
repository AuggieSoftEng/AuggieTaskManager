/**
 * useTasks: fetch and manage task list state.
 */
import { useState, useCallback } from 'react';
import { Task } from '../../../types/task';
import { TaskService } from '../services/taskService';
import { AuthService } from '../../auth/services/authService';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [moodleUrl, setMoodleUrl] = useState<string | null>(
    AuthService.getCurrentUser()?.moodle_url
  );
  const [hasMoodleUrl, setHasMoodleUrl] = useState<boolean>(moodleUrl !== null && moodleUrl !== '');

  const handleImportMoodleTasks = useCallback(async () => {
    if (moodleUrl) {
      const result = await TaskService.loadMoodleCalendarUrl(moodleUrl);
      setTasks((prev) => [...prev, ...result]);
      setHasMoodleUrl(true);
    }
  }, [moodleUrl]);

  const fetchTasks = useCallback(async () => {
    try {
      const fetched = await TaskService.getTasks();
      setTasks(fetched);
    } catch {
      setErrorMessage('Error fetching tasks');
    }
  }, []);

  return {
    tasks,
    errorMessage,
    moodleUrl,
    setMoodleUrl,
    hasMoodleUrl,
    handleImportMoodleTasks,
    fetchTasks,
  };
}
