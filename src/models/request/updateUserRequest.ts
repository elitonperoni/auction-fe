export interface UpdateUserRequest {
    name: string;
    userName: string;
    email: string;
    phone?: string;
    state: string;
    country: string;
    city: string;
    language: number;
    timezone: string; 
}