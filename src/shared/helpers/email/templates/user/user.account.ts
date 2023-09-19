import fs from 'fs';
import ejs from 'ejs';

class UserTemplates {
    public createUserAccountTemplate(userInfo: {
        full_name: string;
        email: string;
        password: string;
    }): string {
        return ejs.render(
            fs.readFileSync(__dirname + '/user.account.template.ejs', 'utf8'),
            {
                ...userInfo,
            }
        );
    }
}

export const userTemplates: UserTemplates = new UserTemplates();
