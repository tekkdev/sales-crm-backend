import {
  Inject,
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { firstValueFrom, timeout } from 'rxjs';
import { handleAsyncWithMessages } from 'src/utils/async-handler.utils';
import { UserGatewayService } from '../user/user.service';
import { ApiResponse } from 'src/utils/api-response.util';
import {
  SERVICE_TIMEOUT_FOR_OPERATION,
  SERVICE_UNAVAILABLE_FOR_OPERATION,
} from 'src/constants/error.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    private readonly userGatewayService: UserGatewayService,
  ) {}

  /**
   * Helper method to handle service response errors consistently
   */
  private handleServiceError(
    response: ApiResponse,
    serviceName: string,
  ): never {
    const errorMessage =
      response.error?.message ||
      response.message ||
      `Failed to process request in ${serviceName}`;

    this.logger.error(`❌ ${serviceName} returned error: ${errorMessage}`);

    throw new HttpException(
      errorMessage,
      response.statusCode || HttpStatus.BAD_REQUEST,
    );
  }

  /**
   * Helper method to safely extract data from service response
   */
  private validateServiceResponse(
    response: ApiResponse,
    serviceName: string,
  ): void {
    if (!response.success) this.handleServiceError(response, serviceName);

    if (!response.data)
      throw new HttpException(
        `${serviceName} did not return expected data`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
  }

  async onModuleInit() {
    await handleAsyncWithMessages(
      () => this.authClient.connect(),
      this.logger,
      '✅ Successfully connected to Auth Service via RabbitMQ',
      '❌ Failed to connect to Auth Service via RabbitMQ',
    );
  }

  async testConnection(): Promise<string | null> {
    return await handleAsyncWithMessages(
      () =>
        firstValueFrom(
          this.authClient
            .send<string>({ cmd: 'test_connection' }, {})
            .pipe(timeout(5000)),
        ),
      this.logger,
      '✅ Successfully tested connection to Auth Service',
      '❌ Failed to test connection to Auth Service',
    );
  }

  async registerUser(registrationData: any) {
    this.logger.log(`📤 Starting user registration process`);

    try {
      // Step 1: Check if user already exists
      this.logger.log(
        `📤 Checking if user exists with email: ${registrationData.email}`,
      );
      const userExists: ApiResponse | null = await handleAsyncWithMessages(
        () => this.userGatewayService.getUserByEmail(registrationData.email),
        this.logger,
        `📥 Received response from User Service for email check: ${registrationData.email}`,
        `📡 Service unavailable for user email check: ${registrationData.email}`,
      );

      if (userExists?.success && userExists?.data) {
        this.logger.warn(
          `⚠️ User with email ${registrationData.email} already exists`,
        );
        throw new HttpException(
          `User with email ${registrationData.email} already exists`,
          HttpStatus.CONFLICT,
        );
      }

      // Step 2: Create user in User Service
      this.logger.log(`📤 Creating user in User Service`);
      const userData = {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
      };

      const userResponse: ApiResponse | null = await handleAsyncWithMessages(
        () => this.userGatewayService.createUser(userData),
        this.logger,
        `📥 Received response from User Service for user creation: ${registrationData.email}`,
        `📡 Service unavailable for user creation: ${registrationData.email}`,
      );

      if (!userResponse)
        throw new HttpException(
          SERVICE_UNAVAILABLE_FOR_OPERATION('user creation'),
          HttpStatus.SERVICE_UNAVAILABLE,
        );

      // Validate User Service response
      this.validateServiceResponse(userResponse, 'User Service');

      const userId = userResponse.data._id || userResponse.data.id;
      this.logger.log(`✅ User created successfully with ID: ${userId}`);

      // Step 3: Create auth user in Auth Service with userId
      this.logger.log(`📤 Creating auth user in Auth Service`);
      const authData = {
        email: registrationData.email,
        password: registrationData.password,
        confirmPassword: registrationData.confirmPassword,
        userId,
      };

      const authResponse: ApiResponse = await handleAsyncWithMessages(
        () =>
          firstValueFrom(
            this.authClient
              .send({ cmd: 'register_user' }, authData)
              .pipe(timeout(5000)),
          ),
        this.logger,
        '📥 Received response from Auth Service for user registration',
        '📡 Service unavailable for user registration',
      );

      if (!authResponse)
        throw new HttpException(
          SERVICE_UNAVAILABLE_FOR_OPERATION('user registration'),
          HttpStatus.SERVICE_UNAVAILABLE,
        );

      this.validateServiceResponse(authResponse, 'Auth Service');

      this.logger.log(`✅ Auth user created successfully`);
      return authResponse;
    } catch (error) {
      this.logger.error(`❌ User registration failed:`, error);
      throw error;
    }
  }

  async loginUser(loginData: any) {
    this.logger.log(
      `📤 Starting user login process for email: ${loginData.email}`,
    );

    const authResponse: ApiResponse = await handleAsyncWithMessages(
      () =>
        firstValueFrom(
          this.authClient
            .send({ cmd: 'login_user' }, loginData)
            .pipe(timeout(5000)),
        ),
      this.logger,
      `📥 Received response from Auth Service for login: ${loginData.email}`,
      `📡 Service unavailable for login: ${loginData.email}`,
    );

    if (!authResponse)
      throw new HttpException(
        SERVICE_UNAVAILABLE_FOR_OPERATION('login'),
        HttpStatus.SERVICE_UNAVAILABLE,
      );

    const userResponse: ApiResponse | null = await handleAsyncWithMessages(
      () => this.userGatewayService.getUserById(authResponse.data.user.userId),
      this.logger,
      `📥 Received response from User Service for fetching user data: ${loginData.email}`,
      `📡 Service unavailable for fetching user data: ${loginData.email}`,
    );

    authResponse.data.user.userId = userResponse?.data;

    this.validateServiceResponse(authResponse, 'Auth Service');

    this.logger.log(`✅ User logged in successfully: ${loginData.email}`);
    return authResponse;
  }

  async refreshToken(refreshTokenDto: any) {
    this.logger.log(`📤 Starting token refresh process`);

    const authResponse: ApiResponse = await handleAsyncWithMessages(
      () =>
        firstValueFrom(
          this.authClient
            .send({ cmd: 'refresh_token' }, refreshTokenDto)
            .pipe(timeout(5000)),
        ),
      this.logger,
      '📥 Received response from Auth Service for token refresh',
      '📡 Service unavailable for token refresh',
    );

    if (!authResponse)
      throw new HttpException(
        SERVICE_UNAVAILABLE_FOR_OPERATION('token refresh'),
        HttpStatus.SERVICE_UNAVAILABLE,
      );

    this.validateServiceResponse(authResponse, 'Auth Service');

    this.logger.log(`✅ Token refreshed successfully`);
    return authResponse;
  }

  async resetPassword(email: string) {
    this.logger.log(`📤 Starting password reset process for email: ${email}`);

    const authResponse: ApiResponse = await handleAsyncWithMessages(
      () =>
        firstValueFrom(
          this.authClient
            .send({ cmd: 'reset_password' }, email)
            .pipe(timeout(5000)),
        ),
      this.logger,
      `📥 Received response from Auth Service for password reset: ${email}`,
      `📡 Service unavailable for password reset: ${email}`,
    );

    if (!authResponse)
      throw new HttpException(
        SERVICE_UNAVAILABLE_FOR_OPERATION('password reset'),
        HttpStatus.SERVICE_UNAVAILABLE,
      );

    this.validateServiceResponse(authResponse, 'Auth Service');

    this.logger.log(`✅ Password reset email sent successfully`);
    return authResponse;
  }
}
