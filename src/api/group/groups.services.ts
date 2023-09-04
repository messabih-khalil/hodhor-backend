import logger, { Logger } from '@utils/logger';
import GroupModel, { IGroup } from './groups.model';
import { GroupData } from './groups.types';

const log: Logger = logger('group.services.ts');

class GroupServices {
    async getGroupByGroupKey(groupKey: string) {
        try {
            return await GroupModel.find({
                group_key: { $regex: groupKey, $options: 'i' },
            });
        } catch (error) {
            log.error(error);
        }
    }

    async getAllGroups(): Promise<IGroup[]> {
        try {
            const groups = await GroupModel.find();
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
          return await GroupModel.findByIdAndUpdate(id, updatedData, { new: true });
        } catch (error) {
          log.error(error);
          throw error; // Rethrow the error to be handled by the caller
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
