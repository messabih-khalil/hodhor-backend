import { Document } from 'mongoose';

// Interface for the University document
export interface IUniversity extends Document {
    location: string;
    user_id: string;
}

// Interface for the request body
export interface CreateUniversityRequest {
    username: string;
    location: string;
    email: string;
   
}
