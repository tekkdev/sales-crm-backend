import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { createDecipheriv, createHash } from 'crypto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Token is missing in request');
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: `${process.env.JWT_ACCESS_SECRET}`,
      });
      let userInfo: any = await this.decryptData(payload?.userInfo);
      userInfo = JSON.parse(userInfo);

      delete payload.userInfo;
      request['user'] = {
        ...payload,
        userInfo,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError')
        throw new UnauthorizedException('Your token has been expired');
      if (error.name === 'SyntaxError')
        throw new UnauthorizedException('Invalid token');
      throw new UnauthorizedException(error?.message || error);
    }

    return true;
  }

  async decryptData(encryptedData: string) {
    if (!process.env.USER_ENCRYPT_KEY)
      throw new Error('Encryption key is not set in environment variables');
    const key = createHash('sha256')
      .update(process.env.USER_ENCRYPT_KEY)
      .digest('base64')
      .substr(0, 32);
    const [ivBase64, encryptedBase64] = encryptedData.split(':');
    const iv = Buffer.from(ivBase64, 'base64');
    const encryptedText = Buffer.from(encryptedBase64, 'base64').toString(
      'hex',
    );
    const decipher = createDecipheriv('aes-256-ctr', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
