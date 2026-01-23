import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthUser, AuthUserDocument } from './model/auth.user.model';
import { CreateAuthUserDto, LoginDto,SetNewPasswordInternalDto } from './dto/auth.user.dto';
import { JwtTokenService } from '../jwt-token/jwt-token.service';
import { DecodedRefreshToken, IAuth } from './interface/auth.user.interface';
import {
  USER_NOT_FOUND,
  INVALID_CREDENTIALS,
  ACCOUNT_INACTIVE,
    TOKEN_EXPIRED,
    INVALID_TOKEN,
    NEW_PASSWORD_SAME_AS_OLD,
    PASSWORD_MISMATCH
} from 'src/constants/error.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AuthUser.name)
    private readonly authUserModel: Model<AuthUserDocument>,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async findOneByEmail(email: string): Promise<AuthUserDocument | null> {
    return this.authUserModel.findOne({ email }).exec();
  }

  async findOneByUserId(userId: string): Promise<AuthUserDocument | null> {
    return this.authUserModel.findOne({ userId }).exec();
  }

  async createAuthUser(createAuthUserDto: CreateAuthUserDto): Promise<any> {
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      createAuthUserDto.password,
      saltRounds,
    );

    // Create auth user
    const authUser: IAuth = await this.authUserModel.create({
      ...createAuthUserDto,
      userId: new Types.ObjectId(createAuthUserDto.userId),
      password: hashedPassword,
      isVerified: false,
      isActive: true,
    });

    // Generate tokens
    const tokens = await this.jwtTokenService.generateTokenPair(authUser);

    // Update user with refresh token
    authUser.refreshToken = tokens.refreshToken;
    await authUser.save();

    // Remove password from response
    const userResponse = authUser.toObject();
    if (userResponse.password) delete userResponse.password;

    return {
      user: userResponse,
      ...tokens,
    };
  }

  async loginUser(loginDto: LoginDto): Promise<any> {
    // Find user by email
    const authUser = await this.findOneByEmail(loginDto.email);
    if (!authUser) throw new Error(USER_NOT_FOUND);

    // Check if user is active
    if (!authUser.isActive) throw new Error(ACCOUNT_INACTIVE);

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      authUser.password,
    );

    if (!isPasswordValid) {
      // Increment failed login attempts
      authUser.failedLoginAttempts += 1;
      await authUser.save();
      throw new Error(INVALID_CREDENTIALS);
    }

    // Reset failed login attempts and update last login
    authUser.failedLoginAttempts = 0;
    authUser.lastLoginAt = new Date();

    // Generate new tokens
    const tokens = await this.jwtTokenService.generateTokenPair(authUser);

    // Update user with new refresh token
    authUser.refreshToken = tokens.refreshToken;
    await authUser.save();

    // Remove password from response
    const userResponse = authUser.toObject();
    if (userResponse.password) delete userResponse.password;

    return {
      user: userResponse,
      ...tokens,
    };
  }

  async refreshToken(oldRefreshToken: string): Promise<any> {
    try {
      const decryptedRefreshToken: DecodedRefreshToken =
        await this.jwtTokenService.verifyRefreshToken(oldRefreshToken);
      const userId = decryptedRefreshToken.sub;

      // Find user by userId
      const authUser = await this.findOneByUserId(userId);
      if (!authUser) throw new Error(USER_NOT_FOUND);

      // Check if old refresh token is valid
      if (authUser.refreshToken !== oldRefreshToken)
        throw new Error(INVALID_CREDENTIALS);

      // Generate new tokens
      const tokens = await this.jwtTokenService.generateTokenPair(authUser);

      // Update user with new refresh token
      authUser.refreshToken = tokens.refreshToken;
      await authUser.save();

      // Remove password from response
      const userResponse = authUser.toObject();
      if (userResponse.password) delete userResponse.password;

      return {
        user: userResponse,
        ...tokens,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError')
        throw new Error('Refresh token has expired');

      if (error.name === 'JsonWebTokenError')
        throw new Error('Invalid refresh token format');

      throw error;
    }
  }

  async resetPasswordToken(email: string): Promise<any> {
    try {
      const authUser = await this.findOneByEmail(email);
      if (!authUser) throw new Error(USER_NOT_FOUND);

      // Generate reset password token
      const resetToken =
        await this.jwtTokenService.generatePasswordResetToken(authUser);

      // Send reset token to user's email
      // await this.mailService.sendResetPasswordEmail(authUser.email, resetToken);

      return {
        token: resetToken,
        message: 'Reset password token sent successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyResetToken(token: string): Promise<any> {
    try {
      const decodedToken =
        await this.jwtTokenService.verifyPasswordResetToken(token);
      return {
        userId: decodedToken.sub,
        email: decodedToken.email,
        message: 'Reset token is valid',
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError')
        throw new Error(TOKEN_EXPIRED);

      if (error.name === 'JsonWebTokenError')
        throw new Error(INVALID_TOKEN);
          
      throw error;
    }
  }

  async setNewPassword(setNewPasswordInternalDto: SetNewPasswordInternalDto): Promise<any> {
    try { 
      const userAuth = await this.findOneByUserId(setNewPasswordInternalDto.userId); 

      if(!userAuth) throw new Error(USER_NOT_FOUND);

      const oldPassword = userAuth.password;

      if (oldPassword === setNewPasswordInternalDto.newPassword)
        throw new Error(NEW_PASSWORD_SAME_AS_OLD);

      if (setNewPasswordInternalDto.newPassword !== setNewPasswordInternalDto.confirmPassword)
        throw new Error(PASSWORD_MISMATCH);
      
      // Hash the new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(setNewPasswordInternalDto.newPassword, saltRounds);

      // Update user's password
      await this.authUserModel.updateOne(
        { userId: setNewPasswordInternalDto.userId },
        { password: hashedPassword },
      );

      return { message: 'Password updated successfully' };
    }
    catch (error) {
      throw error;
    }
  }
}