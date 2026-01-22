import { Injectable } from '@nestjs/common';
import { ServiceResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseUtil {
  private readonly serviceName: string;

  constructor(serviceName: string = 'unknown-service') {
    this.serviceName = serviceName;
  }

  createSuccessResponse<T>(
    data: T,
    statusCode: number = 200,
    requestId?: string,
  ): ServiceResponse<T> {
    return {
      success: true,
      data,
      statusCode,
      meta: {
        timestamp: new Date().toISOString(),
        service: this.serviceName,
        requestId,
      },
    };
  }

  createErrorResponse(
    code: string,
    message: string,
    statusCode: number = 400,
    details?: any,
    requestId?: string,
  ): ServiceResponse<any> {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      statusCode,
      meta: {
        timestamp: new Date().toISOString(),
        service: this.serviceName,
        requestId,
      },
    };
  }
}
