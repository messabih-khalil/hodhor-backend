export interface IUserInfo {
    username: string;
    email: string;
    password: string;
    role: 'university' | 'department' | 'teacher';
}
