import logger, { Logger } from '@utils/logger';
import {
    StudentModel,
    IStudent,
    CreateStudentData,
    UpdateStudentData,
} from '@student/index';
import mongoose from 'mongoose';

import { BadRequestError } from '@utils/error-handlers';

import { studentAbsentEmailQueue } from '@helpers/email/email.queue';
import { studentTemplates } from '@helpers/email/templates/students/student.absent';


import { authService } from '@api/auth/auth.services';

const log: Logger = logger('student.services.ts');

class StudentServices {
    async create(studentData: CreateStudentData): Promise<IStudent> {
        try {
            return await StudentModel.create(studentData);
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async getAllStudents(department_id: string) {
        try {
            // Retrieve all students with the specified department_id
            const students = await StudentModel.find({ department_id });

            return students;
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async getStudentsByGroupId(groupId: string, department_id: string) {
        try {
            const students = await StudentModel.find({
                department_id,
                group_id: groupId,
            }).populate('absences.teacher_id');

            return students;
        } catch (error) {
            throw error;
        }
    }

    async getStudentByFullName(fullName: string) {
        try {
            return await StudentModel.find({
                full_name: { $regex: fullName, $options: 'i' },
            });
        } catch (error) {
            log.error(error);
        }
    }

    async updateById(
        studentId: string,
        updatedData: UpdateStudentData
    ): Promise<IStudent> {
        try {
            const updatedStudent = await StudentModel.findOneAndUpdate(
                { studentId },
                updatedData,
                { new: true }
            );

            if (!updatedStudent) {
                throw new BadRequestError('Student not found');
            }

            return updatedStudent;
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async deleteById(studentId: string): Promise<IStudent> {
        try {
            const deletedStudent = await StudentModel.findOneAndDelete({
                studentId,
            });

            if (!deletedStudent) {
                throw new BadRequestError('Student not found');
            }

            return deletedStudent;
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async searchForAStudent(
        full_name: string,
        group_id?: string,
        department_id?: string
    ): Promise<IStudent[]> {
        try {
            // Search for students by full name in a case-insensitive manner

            const baseQuery: Record<string, any> = {
                department_id,
                full_name: { $regex: new RegExp(full_name, 'i') },
            };

            // If group_id is provided and not empty, add it to the query
            if (group_id) {
                baseQuery.group_id = { $regex: new RegExp(group_id, 'i') };
            }

            const students = await StudentModel.find(baseQuery);

            return students;
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async searchByGroupKey(groupKey: string): Promise<IStudent[]> {
        try {
            // Search for students by group_key (assuming group_id is used as group_key)
            const students = await StudentModel.find({ group_id: groupKey });

            return students;
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async createOrUpdateAbsence(studentData: {
        studentId: string;
        teacher_id: string;
    }): Promise<IStudent> {
        try {
            // Find the student by studentId
            const student = await StudentModel.findOne({
                studentId: studentData.studentId,
            });

            if (!student) {
                throw new BadRequestError('Student not found');
            }

            // Check if an absence already exists for the student
            const absenceIndex = student.absences.findIndex((absence) => {
                return absence.teacher_id.toString() === studentData.teacher_id;
            });

            if (absenceIndex === -1) {
                // If absence doesn't exist, create a new one
                student.absences.push({
                    absense_id: new mongoose.Types.ObjectId().toString(),
                    teacher_id: studentData.teacher_id,

                    absences_count: 1,
                    justifications: [],
                    created_at: new Date(),
                });
            } else {
                // If absence already exists, increase the absences_count
                student.absences[absenceIndex].absences_count++;
            }

            student.markModified('absences');

            // Save the updated student document
            const result = await student.save();

            // Send mail to notify student for his absent

            const teacherAccount = await authService.getUserById(
                studentData.teacher_id
            );

            studentAbsentEmailQueue.addEmailJob('createTeacherAccount', {
                template: studentTemplates.createStudnetAbsent({
                    full_name: result.full_name,
                    from: teacherAccount?.username as string,
                    absents_count: result.absences[absenceIndex]
                        ? result.absences[absenceIndex].absences_count
                        : 1,
                }),
                receiverEmail: student.email,
                subject: '@Hodhor : You have a new absence notification',
            });

            return student;
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async decreaseAbsences(studentData: {
        studentId: string;
        absense_id: string;
    }): Promise<IStudent> {
        try {
            // Find the student by studentId
            const student = await StudentModel.findOne({
                studentId: studentData.studentId,
            });

            if (!student) {
                throw new BadRequestError('Student not found');
            }

            // Check if an absence already exists for the student
            const absenceIndex = student.absences.findIndex((absence) => {
                return absence.absense_id == studentData.absense_id;
            });

            if (absenceIndex === -1) {
                throw new BadRequestError(
                    'Absence record not found for this student'
                );
            }

            // Decrease the absences_count
            if (student.absences[absenceIndex].absences_count <= 0) {
                throw new BadRequestError('Absences count is already at 0');
            }

            student.absences[absenceIndex].absences_count--;

            student.markModified('absences');

            // Save the updated student document
            await student.save();

            return student;
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async submitJustification(
        studentData: {
            studentId: string;
            absense_id: string;
        },
        justificationData: {
            image_url: string;
            _id: string;
            created_at: string;
        }
    ): Promise<IStudent> {
        try {
            // Find the student by studentId
            const student = await StudentModel.findOne({
                studentId: studentData.studentId,
            });

            if (!student) {
                throw new BadRequestError('Student not found');
            }

            // Check if an absence already exists for the student
            const absenceIndex = student.absences.findIndex((absence) => {
                return absence.absense_id.toString() === studentData.absense_id;
            });

            if (absenceIndex === -1) {
                throw new BadRequestError(
                    'Absence record not found for this student'
                );
            }

            // Decrease the absences_count
            if (student.absences[absenceIndex].absences_count <= 0) {
                throw new BadRequestError('Absences count is already at 0');
            }
            
            

            // Add the justification URL to the absences record
            student.absences[absenceIndex].justifications.push(
                justificationData
            );

            // Decrease the absences_count by 1
            student.absences[absenceIndex].absences_count--;

            student.markModified('absences');

            // Save the updated student document
            await student.save();

            return student;
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async deleteJustification(studentData: {
        studentId: string;
        absense_id: string;
        justificationId: string;
    }): Promise<IStudent> {
        try {
            // Find the student by studentId
            const student = await StudentModel.findOne({
                studentId: studentData.studentId,
            });

            if (!student) {
                throw new BadRequestError('Student not found');
            }

            // Check if an absence already exists for the student
            const absenceIndex = student.absences.findIndex((absence) => {
                return absence.absense_id.toString() === studentData.absense_id;
            });

            if (absenceIndex === -1) {
                throw new BadRequestError(
                    'Absence record not found for this student'
                );
            }

            // Find the justification by _id within the absences record
            const justificationIndex = student.absences[
                absenceIndex
            ].justifications.findIndex((justification: any) => {
                return justification._id === studentData.justificationId;
            });

            if (justificationIndex === -1) {
                throw new BadRequestError('Justification not found');
            }

            // Remove the justification from the absences record
            student.absences[absenceIndex].justifications.splice(
                justificationIndex,
                1
            );

            student.absences[absenceIndex].absences_count++;

            student.markModified('absences');

            // Save the updated student document
            await student.save();

            return student;
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async getAbsencesByStudentId(studentId: string) {
        try {
            const student = await StudentModel.findOne({ studentId })
                .populate({
                    path: 'absences.teacher_id',
                    model: 'Teacher',
                    select: 'full_name',
                })
                .exec();

            if (!student) {
                return null; // Student with the given ID not found
            }

            return student.absences;
        } catch (error) {
            throw error;
        }
    }
}

export const studentServices: StudentServices = new StudentServices();
