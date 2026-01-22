// api-gateway/src/utils/api-response.util.ts
import { Injectable, HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  path?: string;
  timestamp?: string;
  statusCode?: number;
  meta?: {
    pagination?: any;
    requestId?: string;
    service?: string;
    errorCode?: string;
  };
}

@Injectable()
export class ApiResponseUtil {
  createSuccess<T>(
    data: T,
    message: string = 'Operation successful',
    statusCode: HttpStatus = HttpStatus.OK,
    meta?: any,
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      meta,
    };
  }

  createError(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    path?: string,
  ): ApiResponse<null> {
    return {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  // Transform microservice ServiceResponse to API Response
  transformServiceResponse<T>(
    serviceResponse: any,
    successMessage?: string,
    path?: string,
  ): ApiResponse<T> {
    if (serviceResponse && serviceResponse.success) {
      return this.createSuccess(
        serviceResponse.data,
        successMessage || 'Operation successful',
        HttpStatus.OK,
        {
          requestId: serviceResponse.meta?.requestId,
          service: serviceResponse.meta?.service,
          ...serviceResponse.meta,
        },
      );
    } else {
      return {
        success: false,
        message: serviceResponse?.error?.message || 'Service unavailable',
        statusCode:
          serviceResponse?.statusCode || HttpStatus.SERVICE_UNAVAILABLE,
        timestamp: new Date().toISOString(),
        path,
        meta: {
          errorCode: serviceResponse?.error?.code,
          requestId: serviceResponse?.meta?.requestId,
          service: serviceResponse?.meta?.service,
        },
      };
    }
  }
}
