import {
  Controller,
  Logger,
  UsePipes,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  GetUserDto,
  CreateUserDto,
  UpdateUserDto,
  GetUserByEmailOrIdDto,
} from './dto/user.dto';
import { UserService } from './user.service';
import { IUser } from './interface/user.interface';
import { ServiceResponseUtil } from 'src/utils/service-response.util';
import { ServiceResponse } from 'src/interfaces/response.interface';
import {
  USER_ALREADY_EXIST_WITH_EMAIL,
  VALIDATION_ERROR_EMAIL_OR_ID_REQUIRED,
  VALIDATION_ERROR_USER_ID_REQUIRED,
  USER_ALREADY_DELETED_WITH_ID,
} from 'src/constants/error.constants';
import {
  USER_RETRIEVAL_SUCCESS,
  USER_CREATION_SUCCESS,
  USER_UPDATE_SUCCESS,
  USERS_RETRIEVAL_SUCCESS,
} from 'src/constants/success.constant';

// user-service/src/user/user.controller.ts
@Controller('user')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly responseUtil: ServiceResponseUtil,
  ) {}

  @MessagePattern({ cmd: 'test_connection' })
  async testConnection(): Promise<ServiceResponse> {
    return this.responseUtil.createSuccess(
      { status: 'connected', timestamp: new Date().toISOString() },
      'User service is healthy and connected',
    );
  }

  @MessagePattern({ cmd: 'get_user' })
  async getUser(data: GetUserDto): Promise<ServiceResponse> {
    const requestId = `req-${Date.now()}`;
    this.logger.log(`📨 Received request for user ID: ${data.id}`, {
      requestId,
    });

    try {
      if (!data.id)
        return this.responseUtil.createValidationError(
          VALIDATION_ERROR_USER_ID_REQUIRED,
          { field: 'id', value: data.id },
          requestId,
        );

      const user: IUser = await this.userService.findOneById(data.id);

      if (!user)
        return this.responseUtil.createNotFound('User', data.id, requestId);

      if (user.isDeleted)
        return this.responseUtil.createError(
          'USER_DELETED',
          USER_ALREADY_DELETED_WITH_ID(data.id),
          HttpStatus.GONE,
          { deletedAt: user.deletedAt },
          requestId,
        );

      return this.responseUtil.createSuccess(
        user,
        USER_RETRIEVAL_SUCCESS,
        requestId,
      );
    } catch (error) {
      this.logger.error(`❌ Error retrieving user ${data.id}:`, error, {
        requestId,
      });

      return this.responseUtil.createServerError(
        'Failed to retrieve user',
        { originalError: error.message },
        requestId,
      );
    }
  }

  @MessagePattern({ cmd: 'get_user_by_email_or_id' })
  async getUserByEmailOrId(
    data: GetUserByEmailOrIdDto,
  ): Promise<ServiceResponse> {
    const requestId = `req-${Date.now()}`;
    this.logger.log(`📨 Received request to get user by email or ID`, {
      requestId,
    });

    try {
      // Build filter dynamically based on provided fields
      const filter: any = {};
      const conditions: any[] = [];

      if (data.id) conditions.push({ _id: data.id });
      if (data.email) conditions.push({ email: data.email });

      if (conditions.length === 0)
        return this.responseUtil.createValidationError(
          VALIDATION_ERROR_EMAIL_OR_ID_REQUIRED,
          { email: data?.email, id: data?.id },
          requestId,
        );

      // Use $or if multiple conditions, otherwise use single condition
      if (conditions.length === 1) Object.assign(filter, conditions[0]);
      else filter.$or = conditions;

      const user: IUser | null = await this.userService.findOne(filter);

      if (!user)
        return this.responseUtil.createNotFound(
          'User',
          data?.id || data?.email || 'unknown',
          requestId,
        );

      if (user.isDeleted)
        return this.responseUtil.createError(
          'USER_DELETED',
          USER_ALREADY_DELETED_WITH_ID(String(user?._id)),
          HttpStatus.GONE,
          { deletedAt: user.deletedAt },
          requestId,
        );

      return this.responseUtil.createSuccess(
        user,
        USER_RETRIEVAL_SUCCESS,
        requestId,
      );
    } catch (error) {
      this.logger.error(`❌ Error retrieving user by email or ID:`, error, {
        requestId,
      });
      return this.responseUtil.createServerError(
        'Failed to retrieve user',
        { originalError: error.message },
        requestId,
      );
    }
  }

  @MessagePattern({ cmd: 'get_all_users' })
  async getAllUsers(data: any = {}): Promise<ServiceResponse> {
    const requestId = `req-${Date.now()}`;
    this.logger.log(`📨 Received request for all users`, { requestId });

    try {
      const { page = 1, limit = 10, search = '' } = data;

      const result = await this.userService.findWithPaginationSearchAndCount(
        page,
        limit,
        search,
      );

      return this.responseUtil.createSuccess(
        {
          users: result.users,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
            hasNext: page * limit < result.total,
            hasPrev: page > 1,
          },
        },
        USERS_RETRIEVAL_SUCCESS,
        requestId,
      );
    } catch (error) {
      this.logger.error(`❌ Error retrieving all users:`, error, { requestId });
      return this.responseUtil.createServerError(
        'Failed to retrieve users',
        { originalError: error.message },
        requestId,
      );
    }
  }

  @MessagePattern({ cmd: 'create_user' })
  async createUser(createUserDto: CreateUserDto): Promise<ServiceResponse> {
    const requestId = `req-${Date.now()}`;
    this.logger.log(`📨 Received request to create user`, { requestId });

    try {
      const existingUser: IUser | null = await this.userService.findOneByEmail(
        createUserDto.email,
      );
      if (existingUser)
        return this.responseUtil.createError(
          'USER_EXISTS',
          USER_ALREADY_EXIST_WITH_EMAIL,
          HttpStatus.CONFLICT,
          { email: createUserDto.email },
          requestId,
        );

      const newUser: IUser = await this.userService.create(createUserDto);

      this.logger.log(`✅ User created successfully with ID: ${newUser._id}`, {
        requestId,
      });

      return this.responseUtil.createSuccess(
        newUser,
        USER_CREATION_SUCCESS,
        requestId,
      );
    } catch (error) {
      this.logger.error(`❌ Error creating user:`, error, { requestId });
      return this.responseUtil.createServerError(
        'Failed to create user',
        { originalError: error.message },
        requestId,
      );
    }
  }

  @MessagePattern({ cmd: 'update_user_profile' })
  async updateUserProfile(data: UpdateUserDto): Promise<ServiceResponse> {
    const requestId = `req-${Date.now()}`;
    this.logger.log(`📨 Received request to update user ID: ${data.id}`, {
      requestId,
    });

    try {
      const user: IUser | null = await this.userService.findOneById(data.id);

      if (!user)
        return this.responseUtil.createNotFound('User', data.id, requestId);

      const updatedUser: IUser = await this.userService.update(data.id, data);

      this.logger.log(
        `✅ User profile updated successfully for ID: ${data.id}`,
        {
          requestId,
        },
      );

      return this.responseUtil.createSuccess(
        updatedUser,
        USER_UPDATE_SUCCESS,
        requestId,
      );
    } catch (error) {
      this.logger.error(`❌ Error updating user profile ${data.id}:`, error, {
        requestId,
      });
      return this.responseUtil.createServerError(
        'Failed to update user profile',
        { originalError: error.message },
        requestId,
      );
    }
  }
}
