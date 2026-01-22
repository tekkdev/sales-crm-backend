import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'auth_users',
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
})
export class AuthUser {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    minlength: 6,
  })
  password: string;

  @Prop({
    type: String,
  })
  refreshToken?: string;

  @Prop({
    type: Date,
  })
  lastLoginAt?: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
  isVerified: boolean;

  @Prop({
    type: String,
  })
  emailVerificationToken?: string;

  @Prop({
    type: Date,
  })
  emailVerificationExpires?: Date;

  @Prop({
    type: String,
  })
  passwordResetToken?: string;

  @Prop({
    type: Date,
  })
  passwordResetExpires?: Date;

  @Prop({
    default: 0,
  })
  failedLoginAttempts: number;

  @Prop({
    type: Date,
  })
  accountLockedUntil?: Date;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    default: Date.now,
  })
  updatedAt: Date;
}

export type AuthUserDocument = AuthUser & Document;
export const AuthUserSchema = SchemaFactory.createForClass(AuthUser);
