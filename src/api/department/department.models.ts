import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define an interface for the Department document
interface IDepartment extends Document {
    name: string;
    univ_id: string;
    user_id: string;
    email: string;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define an interface for the Department model
interface IDepartmentModel extends Model<IDepartment> {
    comparePassword(candidatePassword: string): Promise<boolean>;
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
    user_id: {
        type: String,
        required: true,
        ref: 'User',
    },
});

// Define default population and field selection options
const defaultPopulateOptions = [
    {
        path: 'user_id',
        select: 'username email role',
    },
];

// Apply the default population and field selection options to all 'find' queries
departmentSchema.pre('find', function () {
    this.populate(defaultPopulateOptions);
});
// Create the Department model
const Department = mongoose.model<IDepartment, IDepartmentModel>(
    'Department',
    departmentSchema
);

export default Department;
