import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
  IsDateString,
  Length,
  IsMongoId,
} from 'class-validator';

export class GetUserDto {
  @IsMongoId({ message: 'Invalid user ID format' })
  id: string;
}

export class GetUserByEmailDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
  lastName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;
}

export class UpdateUserDto {
  @IsMongoId({ message: 'Invalid user ID format' })
  id: string;

  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
  lastName?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'], {
    message: 'Gender must be male, female, or other',
  })
  gender?: string;
}

export class DeleteUserDto {
  @IsMongoId({ message: 'Invalid user ID format' })
  id: string;
}

export class RestoreUserDto {
  @IsMongoId({ message: 'Invalid user ID format' })
  id: string;
}

export class UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: Date;
  gender?: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Virtual field for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
