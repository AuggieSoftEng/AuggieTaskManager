import { axiosInstance } from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import { UserProfile, SignupData } from '../../../types/user';


export class AuthService {

    static async getUserProfile(): Promise<UserProfile> {
        try {
            const response = await axiosInstance.get(ENDPOINTS.AUTH_ME);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to fetch user data');
        }
    }

    static async signup(data: SignupData) : Promise<{ message: string }> {
        try {
            const response = await axiosInstance.post(ENDPOINTS.SIGNUP, data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Signup failed');
        }
    }

    // Add other auth methods like login, logout, getCurrentUser here as needed
}