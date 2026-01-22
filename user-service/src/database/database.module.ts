import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelDefinition } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/model/user.model';

const mongooseModels: Array<ModelDefinition> = [
  { name: User.name, schema: UserSchema },
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
        bufferMaxEntries: 0,
      }),
    }),
    MongooseModule.forFeature([...mongooseModels]),
  ],
  exports: [MongooseModule.forFeature([...mongooseModels])],
})
export class DatabaseModule {}
