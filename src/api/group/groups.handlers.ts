import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { BadRequestError } from '@utils/error-handlers';
import { groupServices } from './groups.services';
import {
    CreateGroupBodyRequest,
    UpdateGroupBodyRequest,
    createGroupRequestBodySchema,
    updateGroupRequestBodySchema,
} from './groups.validators';

import { AsyncErrorHandler } from '@helpers/decorators/asyncError.decorator';
import Validate from '@helpers/decorators/zod.decorator';

class GroupHandlers {
    @Validate(createGroupRequestBodySchema)
    @AsyncErrorHandler
    async createGroup(
        req: Request<{}, {}, CreateGroupBodyRequest['body']>,
        res: Response,
        next: NextFunction
    ) {
        // 1 - Get Data From Request Body
        const { group_key } = req.body;

        // 2 - Check if a group with the provided group_key already exists
        const isExist = await groupServices.getGroupByGroupKey(group_key);

        if (isExist!.length > 0) {
            return next(
                new BadRequestError('Provided group_key already exists')
            );
        }

        // 3 - Create the group
        const groupData = {
            group_key,
            department_id: req.user.data.id,
        };
        const resault = await groupServices.create(groupData);

        // 4 - Response data
        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: {
                id: resault?._id,
                group_key,
            },
        });
    }

    @AsyncErrorHandler
    async getAllGroups(req: Request, res: Response, next: NextFunction) {
        try {
            // Get the search query from the request query parameters
            const { name } = req.query;

            // Fetch all groups from the database
            const groups = !name
                ? await groupServices.getAllGroups()
                : await groupServices.getGroupByGroupKey(name as string);

            res.status(HTTP_STATUS.OK).json({
                status: 'success',
                data: groups,
            });
        } catch (error) {
            next(error);
        }
    }

    @Validate(updateGroupRequestBodySchema)
    @AsyncErrorHandler
    async updateGroup(
        req: Request<{ groupId: string }, {}, UpdateGroupBodyRequest['body']>,
        res: Response,
        next: NextFunction
    ) {
        // 1 - Get the groupKey from the route parameters
        const { groupId } = req.params;
        const updatedData = req.body;

        // 2 - Update the group by groupKey
        const updatedGroup = await groupServices.updateGroupById(
            groupId,
            updatedData
        );

        if (!updatedGroup) {
            return next(new BadRequestError('Group not found'));
        }

        // 3 - Response data
        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: updatedGroup,
        });
    }

    @AsyncErrorHandler
    async deleteGroup(
        req: Request<{ groupId: string }, {}, {}>, // Rename groupKey to groupId
        res: Response,
        next: NextFunction
    ) {
        // 1 - Get the groupId from the route parameters
        const { groupId } = req.params;

        // 2 - Delete the group by groupId using the updated method
        const deletedGroup = await groupServices.deleteGroupById(groupId);

        if (!deletedGroup) {
            return next(new BadRequestError('Group not found'));
        }

        // 3 - Response data
        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Group deleted successfully',
        });
    }
}

export default GroupHandlers;
