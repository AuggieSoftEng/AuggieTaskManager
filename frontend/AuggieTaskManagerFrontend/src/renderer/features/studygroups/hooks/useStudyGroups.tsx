import { useEffect, useState } from 'react';
import { fetchStudyGroups } from '../services/studyGroupService';
import { StudyGroup } from '../../../types/studyGroup';

export function useStudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchStudyGroups()
      .then((data) => {
        if (!cancelled) setGroups(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to fetch study groups');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { groups, loading, error };
}