import mongoose, { Document, Schema } from 'mongoose';

interface IAbsence {
    absense_id: string;
    teacher_id: string;
    absences_count: number;
    justifications: string[];
    created_at: Date;
}

export interface IStudent extends Document {
    studentId: typeof mongoose.Types.ObjectId;
    full_name: string;
    email: string;
    group_id: string;
    department_id?: string;
    absences: any[];
}

const studentSchema = new Schema<IStudent>({
    studentId: { type: mongoose.Types.ObjectId, index: true },
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    group_id: { type: String, ref: 'Group', required: true },
    department_id: { type: String, ref: 'Department', required: true },
    absences: [
        {
            absense_id: Schema.Types.ObjectId,
            teacher_id: {
                type: String,
                ref: 'Teacher',
            },
            absences_count: Number,
            justifications: [],
            created_at: Date,
        },
    ], 
});

// Define default population and field selection options
const defaultPopulateOptions = [
    {
        path: 'group_id',
    },
];

// Apply the default population and field selection options to all 'find' queries
studentSchema.pre<IStudent>('find', function () {
    this.populate(defaultPopulateOptions);
});

export const StudentModel = mongoose.model<IStudent>('Student', studentSchema);
