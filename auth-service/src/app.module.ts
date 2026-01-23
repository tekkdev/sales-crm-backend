import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { DatabaseModule } from './database/database.module';
import { JwtTokenService } from './jwt-token/jwt-token.service';
import { AuthModule } from './auth/auth.module';
import { ServiceResponseUtil } from './utils/service-response.util';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: async (
        configService: ConfigService,
      ): Promise<JwtModuleOptions> => {
        const secret = configService.get<string>('JWT_SECRET');
        const expires = configService.get<string>('JWT_EXPIRES_IN') || '24h';
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

        if (!secret)
          throw new Error('JWT_SECRET environment variable is required');

        if (secret.length < 32)
          throw new Error(
            'JWT_SECRET must be at least 32 characters long for security',
          );

        if (isProduction && secret === 'default-secret-key')
          throw new Error(
            'Default JWT_SECRET is not allowed in production environment',
          );

        // Validate expiration format
        const validExpiresPattern = /^(\d+[smhd]|\d+)$/;
        if (!validExpiresPattern.test(expires))
          throw new Error(
            'JWT_EXPIRES_IN must be a valid time format (e.g., "24h", "7d", "3600s")',
          );

        const expiresInValue = /^\d+$/.test(expires)
          ? parseInt(expires, 10)
          : (expires as any);

        return {
          secret,
          signOptions: {
            expiresIn: expiresInValue,
          },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: `${process.env.MONGODB_DB}`,
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtTokenService, ServiceResponseUtil],
})
export class AppModule {}
