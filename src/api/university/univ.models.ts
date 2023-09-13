import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

import { IUniversity } from '@api/university/index';

// Interface for the University model
interface IUniversityModel extends Model<IUniversity> {
    encryptPassword(password: string): Promise<string>;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const universitySchema = new Schema<IUniversity>(
    {
        name: { type: String, required: true, index: true, unique: true },
        location: { type: String, required: true },
        root: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

// Hash the password before saving
universitySchema.pre<IUniversity>('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error: any) {
        return next(error);
    }
});

// Static method to encrypt a password
universitySchema.statics.encryptPassword = async function (
    password: string
): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

// Instance method to compare plain text password with stored hashed password
universitySchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const University: IUniversityModel = mongoose.model<
    IUniversity,
    IUniversityModel
>('University', universitySchema);

export default University;
