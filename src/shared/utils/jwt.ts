import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import config from 'config';
import { Logger } from 'pino';
import logger from './logger';
const log: Logger = logger('jwt.ts');

class JWT {
    private secretKey: string;
    private jwtOptions: SignOptions;

    constructor() {
        this.secretKey = config.get('jwt_secret_key');
        this.jwtOptions = {
            expiresIn: '30d',
        };
    }

    // Generate a JWT with "iat" claim
    generateJWT(data: any): string {
        const payload: JwtPayload = {
            data,
            iat: Math.floor(Date.now() / 1000), // Current timestamp in seconds
        };

        const token: string = jwt.sign(
            payload,
            this.secretKey,
            this.jwtOptions
        );
        return token;
    }

    // Validate a JWT and check "iat" claim
    validateJWT(token: string): any {
        try {
            const decoded: JwtPayload = jwt.verify(
                token,
                this.secretKey
            ) as JwtPayload;
            if (decoded.iat) {
                const issuedAt: Date = new Date(decoded.iat * 1000); // Convert to milliseconds
            }
            return decoded;
        } catch (error: any) {
            log.error('Token validation failed:', error);
        }
    }
}

export const jwtUtil: JWT = new JWT();
