export interface StudyGroup {
  groupID: number;
  name: string;
  description: string;
  image: string | null;
  members: number[];
  created_by: number;
  created_at: string;
}