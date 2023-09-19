// student.routes.ts
import { Router } from 'express';
import { isAuthenticated } from '@middlewares/isAuthenticated.middleware';
import StudentHandlers from '@student/student.handlers';
import multer from 'multer';
import { parser } from '@utils/cloudinary-upload';

const upload = multer({ dest: 'tmp/csv/' });

class StudentRouter {
    private router: Router;

    constructor() {
        this.router = Router();
    }

    routes(): Router {
        this.router.post(
            '/',
            [isAuthenticated],
            StudentHandlers.prototype.createStudent
        );

        this.router.post(
            '/csv',
            [isAuthenticated, upload.single('csvFile')],
            StudentHandlers.prototype.createFromCsv
        );

        this.router.put(
            '/:studentId',
            [isAuthenticated],
            StudentHandlers.prototype.updateStudent
        );

        this.router.delete(
            '/:studentId',
            [isAuthenticated],
            StudentHandlers.prototype.deleteStudent
        );

        this.router.get(
            '/',
            [isAuthenticated],
            StudentHandlers.prototype.getAllStudents
        );

        this.router.get(
            '/group/:groupId',
            [isAuthenticated],
            StudentHandlers.prototype.getStudentsByGroupId
        );

        // Add routes for increase, decrease, and submit justification
        this.router.post(
            '/increase-or-update-absence',
            [isAuthenticated],
            StudentHandlers.prototype.increaseOrUpdateAbsence
        );

        this.router.post(
            '/:studentId/submit-justification',
            [isAuthenticated , parser.single('image')],
            StudentHandlers.prototype.submitJustification
        );

        this.router.post(
            '/:studentId/decrease-absence',
            [isAuthenticated],
            StudentHandlers.prototype.decreaseAbsence
        );

        // this.router.get(
        //     '/:studentId/absenses',
        //     [isAuthenticated],
        //     StudentHandlers.prototype.getStudentAbsences
        // );

        this.router.delete(
            '/:studentId/absenses/:absenseId/justifactions/:justificationId',
            [isAuthenticated],
            StudentHandlers.prototype.deleteJustificationHandler
        );

        return this.router;
    }
}

export const studentRouter: StudentRouter = new StudentRouter();
