import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseModule } from 'src/database/database.module';
import { ServiceResponseUtil } from 'src/utils/service-response.util';

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService, ServiceResponseUtil],
})
export class UserModule {}
