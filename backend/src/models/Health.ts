import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodLog extends Document {
  userId: mongoose.Types.ObjectId;
  foodId: string;
  servings: number;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  createdAt: Date;
}

const foodLogSchema = new Schema<IFoodLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    foodId: { type: String, required: true },
    servings: { type: Number, required: true, default: 1 },
    date: { type: Date, required: true, default: Date.now, index: true },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
  },
  { timestamps: true }
);

export const FoodLog = mongoose.model<IFoodLog>('FoodLog', foodLogSchema);

// Health Check-in Schema
export interface IHealthCheckIn extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  energy: number; // 1-10
  sleep: number; // hours
  stress: number; // 1-10
  soreness: number; // 1-10
  notes?: string;
  createdAt: Date;
}

const healthCheckInSchema = new Schema<IHealthCheckIn>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, default: Date.now, index: true },
    energy: { type: Number, required: true, min: 1, max: 10 },
    sleep: { type: Number, required: true },
    stress: { type: Number, required: true, min: 1, max: 10 },
    soreness: { type: Number, required: true, min: 1, max: 10 },
    notes: String,
  },
  { timestamps: true }
);

export const HealthCheckIn = mongoose.model<IHealthCheckIn>(
  'HealthCheckIn',
  healthCheckInSchema
);
