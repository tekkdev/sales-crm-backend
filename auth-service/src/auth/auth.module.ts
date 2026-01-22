import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ServiceResponseUtil } from 'src/utils/service-response.util';
import { JwtTokenService } from 'src/jwt-token/jwt-token.service';
import { AuthUser, AuthUserSchema } from './model/auth.user.model';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: AuthUser.name, schema: AuthUserSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, ServiceResponseUtil, JwtTokenService],
})
export class AuthModule {}
