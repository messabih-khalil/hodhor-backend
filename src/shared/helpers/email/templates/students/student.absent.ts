import fs from 'fs';
import ejs from 'ejs';

class StudentTemplates {
    public createStudnetAbsent(data: {
        from: string;
        full_name: string;
        absents_count: number;
    }): string {
        return ejs.render(
            fs.readFileSync(__dirname + '/student.absent.template.ejs', 'utf8'),
            {
                ...data,
            }
        );
    }
}

export const studentTemplates: StudentTemplates = new StudentTemplates();
