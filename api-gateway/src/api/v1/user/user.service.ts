import {
  Injectable,
  Logger,
  OnModuleInit,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { handleAsyncWithMessages } from 'src/utils/async-handler.utils';
import {
  SERVICE_TIMEOUT_FOR_OPERATION,
  SERVICE_UNAVAILABLE_FOR_OPERATION,
} from 'src/constants/error.constants';
import { ApiResponse } from 'src/utils/api-response.util';

@Injectable()
export class UserGatewayService implements OnModuleInit {
  private readonly logger = new Logger(UserGatewayService.name);

  constructor(@Inject('USER_SERVICE') private userClient: ClientProxy) {}

  async onModuleInit() {
    await handleAsyncWithMessages(
      () => this.userClient.connect(),
      this.logger,
      '✅ Successfully connected to User Service via RabbitMQ',
      '❌ Failed to connect to User Service via RabbitMQ',
    );
  }

  async testConnection(): Promise<string | null> {
    return await handleAsyncWithMessages(
      () =>
        firstValueFrom(
          this.userClient
            .send<string>({ cmd: 'test_connection' }, {})
            .pipe(timeout(5000)),
        ),
      this.logger,
      '✅ Successfully tested connection to User Service',
      '❌ Failed to test connection to User Service',
    );
  }

  async getAllUsers(): Promise<ApiResponse> {
    this.logger.log(`📤 Sending request to User Service for all users`);

    const result = await handleAsyncWithMessages(
      () =>
        firstValueFrom(
          this.userClient
            .send({ cmd: 'get_all_users' }, {})
            .pipe(timeout(5000)),
        ),
      this.logger,
      '📥 Received response from User Service for all users',
      '📡 Service unavailable for user retrieval',
    );

    if (!result)
      throw new HttpException(
        SERVICE_UNAVAILABLE_FOR_OPERATION(`user retrieval`),
        HttpStatus.SERVICE_UNAVAILABLE,
      );

    return result;
  }

  async getUser(id: string): Promise<ApiResponse> {
    this.logger.log(`📤 Sending request to User Service for ID: ${id}`);

    const result = await handleAsyncWithMessages(
      () =>
        firstValueFrom(
          this.userClient.send({ cmd: 'get_user' }, { id }).pipe(timeout(5000)),
        ),
      this.logger,
      `📥 Received response from User Service for ID: ${id}`,
      `📡 Service unavailable for user ID: ${id}`,
    );

    if (!result) {
      throw new HttpException(
        SERVICE_UNAVAILABLE_FOR_OPERATION(`user retrieval for ID: ${id}`),
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return result;
  }

  async createUser(data: any) {
    this.logger.log(`📤 Sending request to User Service to create user`);
    try {
      const result: ApiResponse = await firstValueFrom(
        this.userClient.send({ cmd: 'create_user' }, data).pipe(timeout(5000)),
      );
      this.logger.log(`📥 Received response from User Service to create user`);
      return result;
    } catch (error) {
      if (error.name === 'TimeoutError') {
        this.logger.error(`⏰ Service timeout for user creation`, error);
        throw new HttpException(
          SERVICE_TIMEOUT_FOR_OPERATION(`user creation`),
          HttpStatus.REQUEST_TIMEOUT,
        );
      }

      this.logger.error(`📡 Service unavailable for user creation`, error);
      throw new HttpException(
        SERVICE_UNAVAILABLE_FOR_OPERATION(`user creation`),
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async updateProfile(data: any): Promise<ApiResponse> {
    this.logger.log(`📤 Sending request to User Service to update profile`);

    try {
      const result = await firstValueFrom(
        this.userClient
          .send({ cmd: 'update_user_profile' }, data)
          .pipe(timeout(5000)),
      );
      this.logger.log(
        `📥 Received response from User Service to update profile`,
      );
      return result;
    } catch (error) {
      if (error.name === 'TimeoutError') {
        this.logger.error(`⏰ Service timeout for profile update`, error);
        throw new HttpException(
          SERVICE_TIMEOUT_FOR_OPERATION(`user profile update`),
          HttpStatus.REQUEST_TIMEOUT,
        );
      }

      this.logger.error(`📡 Service unavailable for profile update`, error);
      throw new HttpException(
        SERVICE_UNAVAILABLE_FOR_OPERATION(`user profile update`),
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
