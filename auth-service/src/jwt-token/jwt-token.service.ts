import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ==================== TOKEN GENERATION ====================

  async generateTokenPair(
    user: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const basePayload = {
      sub: user._id || user.id,
      email: user.email,
      aud: 'auth',
    };

    const accessPayload = {
      ...basePayload,
      type: 'access',
    } as any;

    const refreshPayload = {
      ...basePayload,
      type: 'refresh',
    } as any;

    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      expiresIn: accessExpiresIn as any,
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: refreshExpiresIn as any,
    });

    return { accessToken, refreshToken };
  }

  async generateEmailVerificationToken(user: any): Promise<string> {
    const payload = {
      sub: user._id || user.id,
      email: user.email,
      type: 'email_verification',
      aud: 'email',
    } as any;

    return await this.jwtService.signAsync(payload, {
      expiresIn: '24h' as any,
    });
  }

  async generatePasswordResetToken(user: any): Promise<string> {
    const payload = {
      sub: user._id || user.id,
      email: user.email,
      type: 'password_reset',
      aud: 'password',
    } as any;

    return await this.jwtService.signAsync(payload, {
      expiresIn: '1h' as any,
    });
  }

  // ==================== TOKEN VERIFICATION ====================

  async verifyAccessToken(token: string): Promise<any> {
    const decoded = await this.jwtService.verifyAsync(token);
    if (decoded.type !== 'access') {
      throw new Error('Invalid access token');
    }
    return decoded;
  }

  async verifyRefreshToken(token: string): Promise<any> {
    const decoded = await this.jwtService.verifyAsync(token);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }
    return decoded;
  }

  async verifyEmailVerificationToken(token: string): Promise<any> {
    const decoded = await this.jwtService.verifyAsync(token);
    if (decoded.type !== 'email_verification') {
      throw new Error('Invalid email verification token');
    }
    return decoded;
  }

  async verifyPasswordResetToken(token: string): Promise<any> {
    const decoded = await this.jwtService.verifyAsync(token);
    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid password reset token');
    }
    return decoded;
  }

  // ==================== TOKEN REFRESH ====================

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    const decoded = await this.verifyRefreshToken(refreshToken);

    const newPayload = {
      sub: decoded.sub,
      email: decoded.email,
      type: 'access',
      aud: 'auth',
    } as any;

    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';

    const accessToken = await this.jwtService.signAsync(newPayload, {
      expiresIn: accessExpiresIn as any,
    });

    return { accessToken };
  }

  // ==================== UTILITY METHODS ====================

  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
