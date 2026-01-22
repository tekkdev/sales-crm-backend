// user-service/src/utils/service-response.util.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { ServiceResponse } from '../interfaces/response.interface';

@Injectable()
export class ServiceResponseUtil {
  private readonly serviceName = 'user-service';

  createSuccess<T>(
    data: T,
    message?: string,
    requestId?: string,
  ): ServiceResponse<T> {
    return {
      success: true,
      data,
      message,
      statusCode: HttpStatus.OK,
      meta: {
        timestamp: new Date().toISOString(),
        service: this.serviceName,
        requestId: requestId || `req-${Date.now()}`,
      },
    };
  }

  createError(
    code: string,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: any,
    requestId?: string,
  ): ServiceResponse<null> {
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
        requestId: requestId || `req-${Date.now()}`,
      },
    };
  }

  createNotFound(
    resource: string,
    id: string,
    requestId?: string,
  ): ServiceResponse<null> {
    return this.createError(
      'RESOURCE_NOT_FOUND',
      `${resource} with ID ${id} not found`,
      HttpStatus.NOT_FOUND,
      { resource, id },
      requestId,
    );
  }

  createValidationError(
    message: string,
    validationDetails?: any,
    requestId?: string,
  ): ServiceResponse<null> {
    return this.createError(
      'VALIDATION_ERROR',
      message,
      HttpStatus.BAD_REQUEST,
      validationDetails,
      requestId,
    );
  }

  createServerError(
    message: string = 'Internal server error',
    details?: any,
    requestId?: string,
  ): ServiceResponse<null> {
    return this.createError(
      'INTERNAL_ERROR',
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      details,
      requestId,
    );
  }
}
