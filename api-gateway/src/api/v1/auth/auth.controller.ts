import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { CONNECTION_SUCCESS_TO_SERVICE } from 'src/constants/success.constant';
import { ApiResponse, ApiResponseUtil } from 'src/utils/api-response.util';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';

@Controller('public/auth')
export class AuthGatewayController {
  private readonly logger = new Logger(AuthGatewayController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly apiResponseUtil: ApiResponseUtil,
  ) {}

  @Get('/test-connection')
  async testConnection(): Promise<ApiResponse> {
    const serviceResponse: string | null =
      await this.authService.testConnection();
    return this.apiResponseUtil.transformServiceResponse(
      serviceResponse,
      CONNECTION_SUCCESS_TO_SERVICE('Auth Service'),
    );
  }

  @Post('/register')
  async register(@Body() registrationData: RegisterDto): Promise<ApiResponse> {
    this.logger.log(`📥 API Gateway: Received user registration request`);

    const serviceResponse =
      await this.authService.registerUser(registrationData);

    return this.apiResponseUtil.transformServiceResponse(
      serviceResponse,
      'User registration successful',
    );
  }

  @Post('/login')
  async login(@Body() loginData: LoginDto): Promise<ApiResponse> {
    this.logger.log(
      `📥 API Gateway: Received user login request for ${loginData.email}`,
    );

    const serviceResponse = await this.authService.loginUser(loginData);

    return this.apiResponseUtil.transformServiceResponse(
      serviceResponse,
      'User login successful',
    );
  }

  @Post('/refresh-token')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ApiResponse> {
    this.logger.log(`📥 API Gateway: Received refresh token request`);

    const serviceResponse =
      await this.authService.refreshToken(refreshTokenDto);

    return this.apiResponseUtil.transformServiceResponse(
      serviceResponse,
      'Token refresh successful',
    );
  }

  @Post('/reset-password')
  async resetPassword(@Body() email: string): Promise<ApiResponse> {
    this.logger.log(`📥 API Gateway: Received reset password request`);

    const serviceResponse = await this.authService.resetPassword(email);

    return this.apiResponseUtil.transformServiceResponse(
      serviceResponse,
      'Password reset successful',
    );
  }
}
