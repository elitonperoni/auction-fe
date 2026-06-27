export interface RegisterRequest {
    email: string;
    fullName: string;
    password: string;
    userName?: string;
    phone?: string;
    location?: string;
    country?: string;
    state?: string;
    city?: string;
    language?: string;
    timezone?: string;
}

export interface RegisterUserResponse {
    userId: string;
    orderId: string;
    checkoutUrl: string;
}
