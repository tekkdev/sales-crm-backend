import { Document, Types } from 'mongoose';

export interface IAuth extends Document {
  userId: Types.ObjectId;
  email: string;
  password: string;
  refreshToken?: string;
  lastLoginAt?: Date;
  isVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DecodedRefreshToken {
  sub: string; // User ID (MongoDB ObjectId as string)
  email: string; // User's email address
  aud: string; // Audience: 'auth'
  type: string; // Token type: 'refresh'
  iat: number; // Issued at (Unix timestamp)
  exp: number; // Expires at (Unix timestamp)
}