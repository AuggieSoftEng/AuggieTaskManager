import { axiosInstance } from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import { StudyGroup } from '../../../types/studyGroup';

export class StudyGroupService {
  static async fetchStudyGroups(): Promise<StudyGroup[]> {
    try {
      const response = await axiosInstance.get(ENDPOINTS.STUDY_GROUPS);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Failed to fetch study groups'
      );
    }
  }


  static async fetchAllStudyGroups(): Promise<StudyGroup[]> {
      try {
        const response = await axiosInstance.get(ENDPOINTS.STUDY_GROUPS_ALL);
        return response.data;
      } catch (error: any) {
        throw new Error(
          error.response?.data?.error || 'Failed to fetch all study groups'
        );
      }
    }

    static async joinStudyGroup(groupID: number): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post(ENDPOINTS.STUDY_GROUPS_JOIN(groupID));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to join study group');
    }
  }

  static async leaveStudyGroup(groupID: number): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.post(ENDPOINTS.STUDY_GROUPS_LEAVE(groupID));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to leave study group');
    }

  }

  static async createStudyGroup(formData: FormData): Promise<StudyGroup> {
    try {
      const response = await axiosInstance.post(ENDPOINTS.STUDY_GROUPS_CREATE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create study group');
    }
  }

  static async updateStudyGroup(groupID: number, name: string, description: string, private_: boolean): Promise<void> {
    try {
      await Promise.all([
        axiosInstance.patch(ENDPOINTS.STUDY_GROUPS_UPDATE_NAME(groupID), { name }),
        axiosInstance.patch(ENDPOINTS.STUDY_GROUPS_UPDATE_DESCRIPTION(groupID), { description }),
        axiosInstance.patch(ENDPOINTS.STUDY_GROUPS_UPDATE_PRIVATE(groupID), { private: private_ }),
      ]);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update study group');
    }
  }

}