import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { User } from './model/user.model';
import { IUser } from './interface/user.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findOne(filter: any): Promise<any> {
    return this.userModel.findOne(filter).exec();
  }

  async findOneById(id: string | Types.ObjectId): Promise<any> {
    return this.userModel.findById(id).exec();
  }

  async findOneByEmail(email: string): Promise<any> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll(): Promise<any[]> {
    return this.userModel.find().select('-password').exec();
  }

  async totalUsers(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async findWithPaginationSearchAndCount(
    page: number,
    limit: number,
    search: string,
  ): Promise<any> {
    let sort: { [key: string]: SortOrder | { $meta: any } } = { createdAt: -1 };
    const searchQuery = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.userModel
        .find(searchQuery)
        .sort(sort)
        .select('-password')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(searchQuery),
    ]);

    return { users, total };
  }

  async create(user: any): Promise<IUser | any> {
    return this.userModel.create(user);
  }

  async update(id: string | Types.ObjectId, data: any): Promise<IUser | any> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async hardDelete(id: string | Types.ObjectId): Promise<any> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async softDelete(id: string | Types.ObjectId): Promise<any> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          firstName: 'Deleted',
          lastName: 'User',
          email: `deleted_${new Types.ObjectId()}@example.com`,
          isDeleted: true,
          deletedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }
}
