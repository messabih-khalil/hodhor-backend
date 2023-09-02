import { Document } from 'mongoose';

// Interface for the University document
export interface IUniversity extends Document {
    name: string;
    location: string;
    root: string;
    password: string;
    comparePassword(candidatePassword: string): Promise<boolean>; 
}

// Interface for the request body
export interface CreateUniversityRequest {
    name: string;
    location: string;
    root: string;
    password: string;
}
