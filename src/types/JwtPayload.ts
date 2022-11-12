import { JwtPayload as OriginalJwtPayload } from 'jsonwebtoken';

export interface JwtPayload extends OriginalJwtPayload {
  username: string;
  sessionId?: string;
}