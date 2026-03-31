import { useEffect, useMemo, useState } from 'react';
import { AuthService } from '../../auth/services/authService';
import { TaskService } from '../../tasks/services/taskService';

type UpcomingTask = {
  id: string;
  title: string;
  dueAt: string;
  course?: string;
};

type UnknownRecord = Record<string, unknown>;

type UserLike = UnknownRecord;

const LOCAL_STORAGE_USER_KEYS = ['user', 'currentUser', 'auggie_user'];

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function safeParseJson(value: string | null): unknown | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getStringField(user: UserLike, key: string): string | null {
  const v = user[key];
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function getDisplayNameFromUser(user: unknown): string | null {
  if (!isRecord(user)) return null;

  // Try common shapes
  const direct =
    getStringField(user, 'name') ??
    getStringField(user, 'username') ??
    getStringField(user, 'first_name') ??
    getStringField(user, 'firstName') ??
    getStringField(user, 'email');

  if (direct) return direct;

  const first = getStringField(user, 'first_name') ?? getStringField(user, 'firstName');
  const last = getStringField(user, 'last_name') ?? getStringField(user, 'lastName');
  if (first) return `${first} ${last ?? ''}`.trim();

  return null;
}

function getUserFromLocalStorage(): unknown | null {
  for (const key of LOCAL_STORAGE_USER_KEYS) {
    const parsed = safeParseJson(localStorage.getItem(key));
    if (parsed) return parsed;
  }
  return null;
}

function getUserFromSessionStorage(): unknown | null {
  const parsed = safeParseJson(sessionStorage.getItem('user'));
  return parsed ?? null;
}

// Mock data until AUG-33 (real tasks endpoint) is ready.
function getMockUpcomingTasks(now = new Date()): UpcomingTask[] {
  const base = now.getTime();
  const hours = (n: number) => 1000 * 60 * 60 * n;
  return [
    {
      id: 'mock-1',
      title: 'Read Chapter 7 + notes',
      course: 'PSYC 101',
      dueAt: new Date(base + hours(18)).toISOString(),
    },
    {
      id: 'mock-2',
      title: 'Homework 4: Database joins',
      course: 'CSCI 241',
      dueAt: new Date(base + hours(40)).toISOString(),
    },
    {
      id: 'mock-3',
      title: 'Quiz: Cell structure',
      course: 'BIOL 102',
      dueAt: new Date(base + hours(72)).toISOString(),
    },
  ];
}

export default function Homepage() {
  const [displayName, setDisplayName] = useState<string>('');
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);

  const sortedUpcomingTasks = useMemo(() => {
    return upcomingTasks
      .slice()
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
      .slice(0, 5);
  }, [upcomingTasks]);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      setLoadingUser(true);

      // Prefer cached user data.
      const cachedUser =
        AuthService.getCurrentUser?.() ?? getUserFromSessionStorage() ?? getUserFromLocalStorage();

      const cachedName = getDisplayNameFromUser(cachedUser);
      if (cachedName) {
        if (!cancelled) setDisplayName(cachedName);
        if (!cancelled) setLoadingUser(false);
        return;
      }

      // Fallback to current-user endpoint (if available) when authenticated.
      try {
        if (AuthService.isAuthenticated()) {
          const profile = await AuthService.getUserProfile();
          const name = getDisplayNameFromUser(profile);
          if (!cancelled) setDisplayName(name ?? '');
          // Cache for later renders.
          try {
            AuthService.saveUser(profile);
          } catch {
            // ignore caching errors
          }
        }
      } catch {
        // ignore; we'll fall back to generic welcome
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadUpcomingTasks() {
      setLoadingTasks(true);

      // If not authenticated, show mock tasks (demo-friendly).
      if (!AuthService.isAuthenticated()) {
        if (!cancelled) setUpcomingTasks(getMockUpcomingTasks());
        if (!cancelled) setLoadingTasks(false);
        return;
      }

      try {
        const tasks = await TaskService.getUpcomingTasks({ limit: 5, days: 7 });
        if (!cancelled) setUpcomingTasks(tasks);
      } catch {
        // If API fails, fall back to mock data so the dashboard still renders.
        if (!cancelled) setUpcomingTasks(getMockUpcomingTasks());
      } finally {
        if (!cancelled) setLoadingTasks(false);
      }
    }

    loadUpcomingTasks();
    return () => {
      cancelled = true;
    };
  }, []);

  const greetingName = displayName || 'Auggie';

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const greeting = getTimeBasedGreeting();

  return (
    <div className="p-4">
      <div className="max-w-5xl">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h1 className="card-title text-2xl font-bold">
              {loadingUser ? (
                <span className="skeleton h-8 w-48"></span> /* Prevents layout jump */
              ) : (
                <>
                  {greeting},{' '}
                  <span className="text-accent">{greetingName}</span>
                </>
              )}
            </h1>{' '}
            <p className="text-base-content/80">
              Here’s what’s coming up next. Stay on top of due dates and keep
              your week moving.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="stat bg-base-200 rounded-box">
                <div className="stat-title">Upcoming tasks</div>
                <div className="stat-value text-primary">
                  {loadingTasks ? (
                    <span className="skeleton h-8 w-10" />
                  ) : (
                    sortedUpcomingTasks.length
                  )}
                </div>
                <div className="stat-desc">Next 7 days</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="card-title">Upcoming</h2>
                </div>

                {loadingTasks ? (
                  <div className="space-y-2">
                    <div className="skeleton h-6 w-full" />
                    <div className="skeleton h-6 w-full" />
                    <div className="skeleton h-6 w-full" />
                    <div className="skeleton h-6 w-full" />
                  </div>
                ) : sortedUpcomingTasks.length === 0 ? (
                  <div className="alert">
                    <span>No tasks due soon.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Due</th>
                          <th className="hidden md:table-cell">Course</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedUpcomingTasks.map((t) => (
                          <tr key={t.id}>
                            <td className="font-medium">{t.title}</td>
                            <td className="text-primary">
                              {formatDueDate(t.dueAt)}
                            </td>
                            <td className="hidden md:table-cell">
                              {t.course ?? '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm" disabled>
                    View all tasks
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
