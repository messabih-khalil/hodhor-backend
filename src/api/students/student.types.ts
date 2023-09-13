import mongoose from 'mongoose';

export interface CreateStudentData {
    studentId: mongoose.Types.ObjectId;
    full_name: string;
    email: string;
    group_id: string;
    department_id?: string;
}

export interface UpdateStudentData {
    full_name?: string;
    email?: string;
    group_id?: string;
    department_id?: string;
}
