import logger, { Logger } from '@utils/logger';
import GroupModel, { IGroup } from '@group/groups.model';
import { GroupData } from '@group/groups.types';
import { ObjectId } from 'mongodb';

const log: Logger = logger('group.services.ts');

class GroupServices {
    async getGroupByGroupKey(groupKey: string, department_id: string) {
        try {
            return await GroupModel.find({
                department_id,
                group_key: { $regex: groupKey, $options: 'i' },
            });
        } catch (error) {
            log.error(error);
        }
    }

    async getAllGroups(department_id: string): Promise<IGroup[]> {
        console.log('Dep ID : ', new ObjectId(department_id));

        try {
            const groups = await GroupModel.find({
                department_id: new ObjectId(department_id),
            });
            console.log(groups);

            return groups;
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async create(groupData: GroupData) {
        try {
            return await GroupModel.create(groupData);
        } catch (error) {
            log.error(error);
        }
    }

    async updateGroupById(id: string, updatedData: Partial<GroupData>) {
        try {
            return await GroupModel.findByIdAndUpdate(id, updatedData, {
                new: true,
            });
        } catch (error) {
            log.error(error);
            throw error;
        }
    }

    async deleteGroupById(id: string) {
        try {
            return await GroupModel.findByIdAndRemove(id);
        } catch (error) {
            log.error(error);
            throw error; // Rethrow the error to be handled by the caller
        }
    }
}

export const groupServices: GroupServices = new GroupServices();
