import mongoose from 'mongoose';

// Define the interface for the data you expect when creating or updating a group
interface GroupData {
    group_key: string;
    department_id: string;
}

// Define the interface for the Mongoose document representing a Group
interface IGroup extends mongoose.Document {
    group_key: string;
    department_id: string;
}

export { GroupData, IGroup };
