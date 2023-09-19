import { UserModel, IUser } from './auth.model';
import logger, { Logger } from '@utils/logger';
import { IUserInfo } from './auth.types';
import { createAccountEmailQueue } from '@helpers/email/email.queue';
import { userTemplates } from '@helpers/email/templates/user/user.account';

const log: Logger = logger('auth.services.ts');

class AuthService {
    async createUser(user: IUserInfo) {
        try {
            // Send account information to the provided email

            createAccountEmailQueue.addEmailJob('createTeacherAccount', {
                template: userTemplates.createUserAccountTemplate({
                    full_name: user.username,
                    email: user.email,
                    password: user.password,
                }),
                receiverEmail: user.email,
                subject: '@Hodhor : Your account informations',
            });

            return await UserModel.create(user);
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async getUserByEmail(email: string) {
        try {
            return await UserModel.findOne({ email });
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async updateUser(
        userId: string,
        userInfo: Omit<IUserInfo, 'password' | 'role'>
    ) {
        try {
            return await UserModel.findByIdAndUpdate(userId, userInfo);
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async getUserByFullName(fullName: string) {
        try {
            return await UserModel.findOne({ full_name: fullName });
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async getUserById(userId: string) {
        try {
            return await UserModel.findById(userId);
        } catch (error) {
            log.error(error);
            throw error;
        }
    }
}

export const authService: AuthService = new AuthService();
