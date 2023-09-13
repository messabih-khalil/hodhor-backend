// teacher.services.ts
import logger, { Logger } from '@utils/logger';
import Teacher from '@teachers/teacher.models';
import { TeacherData } from '@teachers/teacher.types';
import { BadRequestError } from '@utils/error-handlers';

import GroupModel from '@api/group/groups.model';
import { StudentModel } from '@api/students/student.model';

const log: Logger = logger('teacher.services.ts');

class TeacherServices {
    async getTeacherByEmail(email: string) {
        try {
            return await Teacher.findOne({ email });
        } catch (error) {
            log.error(error);
        }
    }

    async create(teacherData: TeacherData) {
        try {
            await Teacher.create(teacherData);
        } catch (error) {
            log.error(error);
        }
    }

    async getTeachersByDepartmentId(department_id: string, full_name?: string) {
        try {
            const baseQuery: Record<string, any> = {
                department_id,
            };

            if (full_name) {
                baseQuery.full_name = { $regex: new RegExp(full_name, 'i') };
            }
            // Find all teachers with the specified department_id
            const teachers = await Teacher.find(baseQuery).select(
                '-__v -password'
            );
            return teachers;
        } catch (error) {
            // Handle any errors or add more specific error handling
            throw error;
        }
    }

    async updateTeacher(
        teacherId: string,
        teacherData: Omit<TeacherData, 'password' | 'department_id'>
    ) {
        try {
            const teacher = await Teacher.findByIdAndUpdate(
                teacherId,
                teacherData
            ).exec();

            if (!teacher) {
                throw new Error('Teacher not found');
            }

            return teacher;
        } catch (error) {
            // Handle errors
            throw error;
        }
    }

    async getGroupsForTeacher(teacherId: string) {
        try {
            const teacher = await Teacher.find({ _id: teacherId }).select(
                '-full_name -email -password -department_id -_id'
            );

            if (!teacher) {
                throw new BadRequestError('Teacher not found');
            }

            // Return the 'groups' array from the teacher document
            return teacher;
        } catch (error) {
            // Handle errors
            throw error;
        }
    }

    async getGroupsWithStudentsForTeacher(teacherId: string) {
        try {
            const teacher = await Teacher.findById(teacherId);

            if (!teacher) {
                throw new BadRequestError('Teacher not found');
            }

            // Retrieve group information along with students
            const groupsWithStudents = await Promise.all(
                teacher.groups.map(async (groupId) => {
                    const group = await GroupModel.findById(groupId);
                    if (!group) {
                        throw new Error('Group not found');
                    }

                    // Retrieve students for the group
                    const students = await StudentModel.find({
                        group_id: group._id,
                    });

                    // Calculate absence count for each student in the group for the specific teacher
                    const studentsWithAbsenceCount = students.map((student) => {
                        // Find the absences related to the specific teacher_id
                        const teacherAbsence = student.absences.find(
                            (absence) => absence.teacher_id === teacherId
                        );

                        // Get the absence_count for the specific teacher or default to 0 if not found
                        const absenceCountForTeacher = teacherAbsence
                            ? teacherAbsence.absences_count
                            : 0;

                        return {
                            _id: student._id,
                            full_name: student.full_name,
                            email: student.email,
                            absence_count: absenceCountForTeacher,
                        };
                    });

                    return {
                        group_id: group._id,
                        group_key: group.group_key,
                        students: studentsWithAbsenceCount,
                    };
                })
            );

            return groupsWithStudents;
        } catch (error) {
            // Handle errors here
            throw error;
        }
    }
}

export const teacherServices: TeacherServices = new TeacherServices();
