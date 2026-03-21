import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkout extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  exercises: Array<{
    id: string;
    name: string;
    sets: number;
    reps: number;
    muscleGroup: string;
  }>;
  totalDuration: number;
  intensity: 'light' | 'normal' | 'push';
  readinessScore: number;
  completed: boolean;
  completedExercises: string[];
  createdAt: Date;
  updatedAt: Date;
}

const workoutSchema = new Schema<IWorkout>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    exercises: [
      {
        id: String,
        name: String,
        sets: Number,
        reps: Number,
        muscleGroup: String,
      },
    ],
    totalDuration: Number,
    intensity: { type: String, enum: ['light', 'normal', 'push'], default: 'normal' },
    readinessScore: { type: Number, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    completedExercises: [String],
  },
  { timestamps: true }
);

export const Workout = mongoose.model<IWorkout>('Workout', workoutSchema);
