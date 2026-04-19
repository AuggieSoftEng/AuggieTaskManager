import { useState } from 'react';

import { StudyGroupService } from '../services/studyGroupService';
import { StudyGroup } from '../../../types/studyGroup';
import { AuthService } from '../../auth/services/authService';

export const useStudyGroups = () => {
  const currentUser = AuthService.getCurrentUser();
  const currentUserID = currentUser?.user?.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<StudyGroup[]>([]);

  const fetchMyStudyGroups = async (): Promise<StudyGroup[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await StudyGroupService.fetchStudyGroups();
      setGroups(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch study groups');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudyGroups = async (): Promise<StudyGroup[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await StudyGroupService.fetchAllStudyGroups();
      setGroups(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all study groups');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinStudyGroup = async (groupID: number): Promise<{ message: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await StudyGroupService.joinStudyGroup(groupID);
      setGroups((prev) =>
        prev.map((g) =>
          g.groupID === groupID ? { ...g, members: [...g.members, currentUserID] } : g
        )
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join study group');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const leaveStudyGroup = async (groupID: number): Promise<{ message: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      const data = await StudyGroupService.leaveStudyGroup(groupID);
      setGroups((prev) =>
        prev.map((g) =>
          g.groupID === groupID ? { ...g, members: g.members.filter((id) => id !== currentUserID) } : g
        )
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave study group');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, groups, fetchMyStudyGroups, fetchAllStudyGroups, joinStudyGroup, leaveStudyGroup };
};