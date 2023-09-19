import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

import { IUniversity } from '@api/university/index';

const universitySchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        location: { type: String, required: true },
    },
    { timestamps: true }
);

const University = mongoose.model<IUniversity>('University', universitySchema);

export default University;
