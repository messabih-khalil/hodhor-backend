import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface ITeacher extends Document {
    full_name: string;
    email: string;
    password: string;
    groups: string[];
    department_id?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

interface ITeacherModel extends Model<ITeacher> {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const teacherSchema = new Schema({
    full_name: {
        type: String,
        required: true,
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
});

teacherSchema.pre<ITeacher>('save', async function (next) {
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

teacherSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Define default population and field selection options
const defaultPopulateOptions = [
    {
        path: 'groups',
        select: '_id group_key',
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
