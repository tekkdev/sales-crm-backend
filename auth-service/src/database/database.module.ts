import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelDefinition } from '@nestjs/mongoose';
import { AuthUser, AuthUserSchema } from 'src/auth/model/auth.user.model';

const mongooseModels: Array<ModelDefinition> = [
  { name: AuthUser.name, schema: AuthUserSchema },
];

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: `${process.env.MONGODB_URI}`,
        dbName: `${process.env.MONGODB_DB}`,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      }),
    }),
    MongooseModule.forFeature([...mongooseModels]),
  ],
  exports: [MongooseModule.forFeature([...mongooseModels])],
})
export class DatabaseModule {}
