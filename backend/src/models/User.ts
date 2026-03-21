import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  phone: string;
  email?: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  language: 'en' | 'ta' | 'hi';
  password?: string;
  bodyType?: 'ectomorph' | 'mesomorph' | 'endomorph';
  lifestyle?: 'sedentary' | 'moderate' | 'active';
  jobType?: string;
  gymExperience?: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoal?: 'fat-loss' | 'muscle-gain' | 'strength' | 'general-fitness';
  dietType?: 'veg' | 'non-veg' | 'vegan';
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    height: { type: Number, required: true }, // cm
    weight: { type: Number, required: true }, // kg
    language: { type: String, enum: ['en', 'ta', 'hi'], default: 'en' },
    password: String,
    bodyType: { type: String, enum: ['ectomorph', 'mesomorph', 'endomorph'] },
    lifestyle: { type: String, enum: ['sedentary', 'moderate', 'active'] },
    jobType: String,
    gymExperience: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    fitnessGoal: {
      type: String,
      enum: ['fat-loss', 'muscle-gain', 'strength', 'general-fitness'],
    },
    dietType: { type: String, enum: ['veg', 'non-veg', 'vegan'] },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
