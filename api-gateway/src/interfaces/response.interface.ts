export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    statusCode?: number;
    meta?: {
        timestamp: string;
        service: string;
        requestId?: string;
    };
}