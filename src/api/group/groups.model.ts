import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for your document
export interface IGroup extends Document {
  group_key: string;
  department_id: string;
}

// Define the Mongoose schema
export const GroupSchema = new Schema<IGroup>({
  group_key: { type: String, index: true },
  department_id: { type: String, ref: 'Department' },
});

// Define the model based on the schema
const GroupModel = mongoose.model<IGroup>('Group', GroupSchema);

export default GroupModel;
