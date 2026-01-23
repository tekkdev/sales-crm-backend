import {
  Inject,
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
import { first, firstValueFrom, timeout } from 'rxjs';
import { handleAsyncWithMessages } from 'src/utils/async-handler.utils';
import { UserGatewayService } from '../user/user.service';
import { ApiResponse } from 'src/utils/api-response.util';
import {
  SERVICE_TIMEOUT_FOR_OPERATION,
  SERVICE_UNAVAILABLE_FOR_OPERATION,
  TOKEN_EXPIRED,
  INVALID_TOKEN,
  NEW_PASSWORD_SAME_AS_OLD
} from 'src/constants/error.constants';
import { SetNewPasswordDto, SetNewPasswordInternalDto } from './dto/auth.dto';

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
    if (!response.success) {
      this.handleServiceError(response, serviceName);
    }

    if (!response.data) {
      throw new HttpException(
        `${serviceName} did not return expected data`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      // Step 1: Create user in User Service
      this.logger.log(`📤 Creating user in User Service`);
      const userData = {
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
      };

      // const userExists: ApiResponse =
      //   await this.userGatewayService.getUserByEmail(registrationData.email);

      // if (userExists.success && userExists.data) {
      //   this.logger.warn(
      //     `⚠️ User with email ${registrationData.email} already exists`,
      //   );
      //   throw new HttpException(
      //     `User with email ${registrationData.email} already exists`,
      //     HttpStatus.CONFLICT,
      //   );
      // }

      const userResponse: ApiResponse =
        await this.userGatewayService.createUser(userData);

      // Validate User Service response
      this.validateServiceResponse(userResponse, 'User Service');
      this.logger.log(`✅ Validating User Service Response: ${JSON.stringify(userResponse)}`);


      const userId = userResponse.data._id || userResponse.data.id;
      this.logger.log(`✅ User created successfully with ID: ${userId}`);

      // Step 2: Create auth user in Auth Service with userId
      this.logger.log(`📤 Creating auth user in Auth Service`);
      
      const authData = {
        email: registrationData.email,
        password: registrationData.password,
        confirmPassword: registrationData.confirmPassword,
        userId,
      };

      const authResponse = await handleAsyncWithMessages(
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

    const authResponse = await handleAsyncWithMessages(
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

    this.validateServiceResponse(authResponse, 'Auth Service');

    this.logger.log(`✅ User logged in successfully: ${loginData.email}`);
    return authResponse;
  }

  async refreshToken(refreshTokenDto: any) {
    this.logger.log(`📤 Starting token refresh process`);

    const authResponse = await handleAsyncWithMessages(
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

    const authResponse = await handleAsyncWithMessages(
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

  async setNewPassword(setNewPasswordDto: SetNewPasswordDto) {
    // Step 1: Verify reset token with Auth Service
    this.logger.log(`📤 Starting reset token verification process`);

    const authResponse = await handleAsyncWithMessages(
      () =>
        firstValueFrom(
          this.authClient
            .send({ cmd: 'verify_reset_token' }, setNewPasswordDto.token)
            .pipe(timeout(5000)),
        ),
      this.logger,
      '📥 Received response from Auth Service for reset token verification',
      '📡 Service unavailable for reset token verification',
    );

    if (!authResponse)
      throw new HttpException(
        SERVICE_UNAVAILABLE_FOR_OPERATION('reset token verification'),
        HttpStatus.SERVICE_UNAVAILABLE,
      );

    this.logger.log(`✅ Reset token verified successfully`, JSON.stringify(authResponse));

    this.validateServiceResponse(authResponse, 'Auth Service');
    this.logger.log(`✅ Reset token verified successfully`);

    // Step 2: Set new password in Auth Service
    this.logger.log(`📤 Setting new password in Auth Service`);

    const payload: SetNewPasswordInternalDto = {
      newPassword: setNewPasswordDto.newPassword,
      confirmPassword: setNewPasswordDto.confirmPassword,
      userId: authResponse.data.userId,
    };

    const setNewPasswordResponse = await handleAsyncWithMessages(
      () => firstValueFrom(
      this.authClient.send({cmd: "set_new_password"}, payload).pipe(timeout(5000))),
      this.logger,
      '📥 Received response from Auth Service for setting new password',
      '📡 Service unavailable for setting new password',
    );

    console.log(setNewPasswordResponse);

    if(!setNewPasswordResponse)
      throw new HttpException(
        SERVICE_UNAVAILABLE_FOR_OPERATION('setting new password'),
        HttpStatus.SERVICE_UNAVAILABLE,
      );

    this.validateServiceResponse(setNewPasswordResponse, 'Auth Service');

    this.logger.log(`✅ New password set successfully`);
    return setNewPasswordResponse;
  }
}