import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ITeacher extends Document {
    department_id?: string;
    groups: string[];
    user_id: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

interface ITeacherModel extends Model<ITeacher> {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const teacherSchema = new Schema({
    groups: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Group',
        },
    ],
    department_id: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

// Define default population and field selection options
const defaultPopulateOptions = [
    {
        path: 'groups',
        select: '_id group_key',
    },
    {
        path: 'user_id',
        select: 'username email role',
    },
];

// Apply the default population and field selection options to all 'find' queries
teacherSchema.pre('find', function () {
    this.populate(defaultPopulateOptions);
});

const Teacher = mongoose.model<ITeacher, ITeacherModel>(
    'Teacher',
    teacherSchema
);

export default Teacher;
