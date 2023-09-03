import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

// Define an interface for the Department document
interface IDepartment extends Document {
    name: string;
    univ_id: string;
    email: string;
    password: string;
    comparePassword(
        candidatePassword: string,
   
    ): Promise<boolean>;
}

// Define an interface for the Department model
interface IDepartmentModel extends Model<IDepartment> {
    comparePassword(
        candidatePassword: string,
      
    ): Promise<boolean>;
}

// Create the schema
const departmentSchema = new Schema<IDepartment, IDepartmentModel>({
    name: {
        type: String,
        required: true,
    },
    univ_id: {
        type: String,
        required: true,
        ref: 'University',
    },
    email: {
        type: String,
        index: true,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

// Hash the password before saving to the database
departmentSchema.pre<IDepartment>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error: any) {
        return next(error);
    }
});

// Compare hashed passwords
departmentSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};


// Create the Department model
const Department = mongoose.model<IDepartment, IDepartmentModel>(
    'Department',
    departmentSchema
);

export default Department;
