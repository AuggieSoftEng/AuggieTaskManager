import { axiosInstance } from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import { StudyGroup } from '../../../types/studyGroup';

export class StudyGroupService {
  static async fetchStudyGroups(): Promise<StudyGroup[]> {
    try {
      const response = await axiosInstance.get(ENDPOINTS.STUDY_GROUPS_ALL);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch study groups'
      );
    }
  }
}