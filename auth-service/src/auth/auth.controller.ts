import {
  Controller,
  Logger,
  UsePipes,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ServiceResponseUtil } from 'src/utils/service-response.util';
import { ServiceResponse } from 'src/interfaces/response.interface';
import {
  CreateAuthUserDto,
  ForgotPasswordDto,
  LoginDto,
} from './dto/auth.user.dto';
import { AuthService } from './auth.service';
import {
  USER_SIGNUP_SUCCESS_WITH_EMAIL,
  LOGIN_SUCCESS_FOR_USER,
  CONNECTION_SUCCESS_TO_SERVICE,
  TOKEN_REFRESH_SUCCESS,
  PASSWORD_RESET_TOKEN_SENT_FOR_USER,
} from 'src/constants/success.constant';
import {
  USER_ALREADY_EXIST_WITH_EMAIL_MESSAGE,
  INVALID_CREDENTIALS_FOR_USER,
  ACCOUNT_INACTIVE_WITH_ID,
  SOMETHING_WENT_WRONG_TRY_AGAIN,
  USER_NOT_FOUND,
  INVALID_CREDENTIALS,
  ACCOUNT_INACTIVE,
  USER_NOT_FOUND_WITH_EMAIL,
  REFRESH_TOKEN_EXPIRED,
  INVALID_REFRESH_TOKEN,
  TOKEN_EXPIRED,
  USER_ALREADY_EXIST_WITH_EMAIL,
} from 'src/constants/error.constants';

@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly responseUtil: ServiceResponseUtil,
    private readonly authService: AuthService,
  ) {}

  @MessagePattern({ cmd: 'test_connection' })
  async testConnection(): Promise<ServiceResponse> {
    return this.responseUtil.createSuccess(
      { status: 'connected', timestamp: new Date().toISOString() },
      CONNECTION_SUCCESS_TO_SERVICE('Auth Service'),
    );
  }

  @MessagePattern({ cmd: 'register_user' })
  async registerUser(
    createAuthUserDto: CreateAuthUserDto,
  ): Promise<ServiceResponse> {
    const requestId = `req-${Date.now()}`;
    this.logger.log(
      `📨 Received request to register auth user for user Email: ${createAuthUserDto.email}`,
      {
        requestId,
      },
    );

    try {
      const existingAuthUser = await this.authService.findOneByEmail(
        createAuthUserDto.email,
      );
      if (existingAuthUser)
        return this.responseUtil.createError(
          USER_ALREADY_EXIST_WITH_EMAIL,
          USER_ALREADY_EXIST_WITH_EMAIL_MESSAGE(createAuthUserDto.email),
          HttpStatus.CONFLICT,
          { email: createAuthUserDto.email },
          requestId,
        );

      const result = await this.authService.createAuthUser(createAuthUserDto);
      this.logger.log(
        `✅ Auth user registered successfully for user Email: ${createAuthUserDto.email}`,
        {
          requestId,
        },
      );

      return this.responseUtil.createSuccess(
        result,
        USER_SIGNUP_SUCCESS_WITH_EMAIL(createAuthUserDto.email),
        requestId,
      );
    } catch (error) {
      this.logger.error(`❌ Error registering auth user:`, error, {
        requestId,
      });

      return this.responseUtil.createServerError(
        SOMETHING_WENT_WRONG_TRY_AGAIN,
        { originalError: error.message },
        requestId,
      );
    }
  }

  @MessagePattern({ cmd: 'login_user' })
  async loginUser(loginDto: LoginDto): Promise<ServiceResponse> {
    const requestId = `req-${Date.now()}`;
    this.logger.log(`📨 Received request to login user: ${loginDto.email}`, {
      requestId,
    });

    try {
      const result = await this.authService.loginUser(loginDto);

      this.logger.log(`✅ User logged in successfully: ${loginDto.email}`, {
        requestId,
      });

      return this.responseUtil.createSuccess(
        result,
        LOGIN_SUCCESS_FOR_USER(loginDto.email),
        requestId,
      );
    } catch (error) {
      this.logger.error(`❌ Error logging in user:`, error, {
        requestId,
      });

      if (
        error.message.includes(INVALID_CREDENTIALS) ||
        error.message.includes(USER_NOT_FOUND)
      ) {
        return this.responseUtil.createError(
          INVALID_CREDENTIALS,
          INVALID_CREDENTIALS_FOR_USER(loginDto.email),
          HttpStatus.UNAUTHORIZED,
          { email: loginDto.email },
          requestId,
        );
      }

      if (error.message.includes(ACCOUNT_INACTIVE))
        return this.responseUtil.createError(
          'ACCOUNT_INACTIVE',
          ACCOUNT_INACTIVE_WITH_ID(loginDto.email),
          HttpStatus.UNAUTHORIZED,
          { email: loginDto.email },
          requestId,
        );

      return this.responseUtil.createServerError(
        SOMETHING_WENT_WRONG_TRY_AGAIN,
        { originalError: error.message },
        requestId,
      );
    }
  }

  @MessagePattern({ cmd: 'refresh_token' })
  async refreshToken(refreshTokenDto: any): Promise<ServiceResponse> {
    const requestId = `req-${Date.now()}`;
    this.logger.log(`📨 Received request to refresh token`, {
      requestId,
    });

    try {
      const result = await this.authService.refreshToken(refreshTokenDto);
      this.logger.log(`✅ Token refreshed successfully`, {
        requestId,
      });

      return this.responseUtil.createSuccess(
        result,
        TOKEN_REFRESH_SUCCESS,
        requestId,
      );
    } catch (error) {
      this.logger.error(`❌ Error refreshing token:`, error, { requestId });

      // Handle specific token errors
      if (error.message.includes('expired'))
        return this.responseUtil.createError(
          TOKEN_EXPIRED,
          REFRESH_TOKEN_EXPIRED,
          HttpStatus.UNAUTHORIZED,
          null,
          requestId,
        );

      if (error.message.includes('Invalid refresh token'))
        return this.responseUtil.createError(
          'INVALID_TOKEN',
          INVALID_REFRESH_TOKEN,
          HttpStatus.UNAUTHORIZED,
          null,
          requestId,
        );

      return this.responseUtil.createServerError(
        SOMETHING_WENT_WRONG_TRY_AGAIN,
        { originalError: error.message },
        requestId,
      );
    }
  }

  @MessagePattern({ cmd: 'reset_password' })
  async resetPasswordToken(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ServiceResponse> {
    const requestId = `req-${Date.now()}`;
    this.logger.log(`📨 Received request to reset password token`, {
      requestId,
    });

    try {
      const result = await this.authService.resetPasswordToken(
        forgotPasswordDto.email,
      );

      this.logger.log(`✅ Reset password token sent successfully`, {
        requestId,
      });

      return this.responseUtil.createSuccess(
        result,
        PASSWORD_RESET_TOKEN_SENT_FOR_USER(forgotPasswordDto.email),
        requestId,
      );
    } catch (error) {
      this.logger.error(`❌ Error sending reset password token:`, error, {
        requestId,
      });

      if (error.message.includes(USER_NOT_FOUND))
        return this.responseUtil.createError(
          USER_NOT_FOUND,
          USER_NOT_FOUND_WITH_EMAIL(forgotPasswordDto.email),
          HttpStatus.NOT_FOUND,
          { email: forgotPasswordDto.email },
          requestId,
        );

      return this.responseUtil.createServerError(
        SOMETHING_WENT_WRONG_TRY_AGAIN,
        { originalError: error.message },
        requestId,
      );
    }
  }
}
