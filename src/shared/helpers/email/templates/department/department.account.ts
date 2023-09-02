import fs from 'fs';
import ejs from 'ejs';
import { DepartmentData } from '@api/department/department.types';

class DeparmentTemplates {
    public createDepartmentAccount(
        deparatmentData: Omit<DepartmentData, 'univ_id'>
    ): string {
        return ejs.render(
            fs.readFileSync(
                __dirname + '/department.account.template.ejs',
                'utf8'
            ),
            {
                ...deparatmentData,
            }
        );
    }
}

export const departmentTemplate: DeparmentTemplates = new DeparmentTemplates();
