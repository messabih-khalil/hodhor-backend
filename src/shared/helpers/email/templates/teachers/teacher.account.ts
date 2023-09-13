import fs from 'fs';
import ejs from 'ejs';
import { DepartmentData } from '@api/department/department.types';
import { TeacherData } from '@api/teachers/teacher.types';

class TeacherTemplates {
    public createTeacherAccount(
        deparatmentData: Omit<TeacherData, 'department_id' | 'groups'>
    ): string {
        return ejs.render(
            fs.readFileSync(
                __dirname + '/teacher.account.template.ejs',
                'utf8'
            ),
            {
                ...deparatmentData,
            }
        );
    }
}

export const teacherTemplates: TeacherTemplates = new TeacherTemplates();
