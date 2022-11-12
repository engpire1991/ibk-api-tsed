import { Service } from "@tsed/di";
import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import * as uuid from 'uuid';
import { apiBaseDns, jwtSecret, portalBaseDns } from "../config/env";
import { User } from '../entities/User';
import { SettingRepository } from '../repositories/SettingRepository';
import { JwtPayload } from "../types/JwtPayload";


const ExtractJwt = require('passport-jwt').ExtractJwt;

declare module "@tsed/common" {
  export interface Request extends TsED.Request {
    user: User,
    sessionId: string,
  }
}

@Service()
export class AuthorizationService {
  constructor(
    private settingRepository: SettingRepository
  ) { }

  public static jwtOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      ExtractJwt.fromHeader('authorization'),
      ExtractJwt.fromUrlQueryParameter('authorization')
    ]),
    secretOrKey: jwtSecret
  };

  public static jwtSignOptions: SignOptions = {
    expiresIn: 2592000, // 30 days
    issuer: apiBaseDns,
    audience: portalBaseDns
  };

  public static jwtVerifyOptions: VerifyOptions = {

  };

  public static verifyTyoken(token: string): JwtPayload {
    return verify(token, this.jwtOptions.secretOrKey, this.jwtVerifyOptions) as JwtPayload;
  }

  public async generateJWT(username: string, sessionId?: string): Promise<string> {
    // generate sessionId if one does not exist
    if (!sessionId) sessionId = await this.generateSessionId();

    // prepare token
    return sign(<JwtPayload>{ username, sessionId }, AuthorizationService.jwtOptions.secretOrKey, AuthorizationService.jwtSignOptions);
  }


  public async generateSessionId(): Promise<string> {
    const sessionId = uuid.v4();
    return sessionId;
  }
}