export interface RecoveryPasswordRequest {
    token: string
    password: string;    
}
export interface SendEmailRecoveryPasswordRequest {
    email: string;    
}

export interface ResetPasswordRequest {
    actualPassword: string;
    newPassword: string;
} 
