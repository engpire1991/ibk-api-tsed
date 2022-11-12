import { Inject, Req } from "@tsed/common";
import { Arg, OnVerify, Protocol } from "@tsed/passport";
import { Strategy, StrategyOptions } from "passport-jwt";
import { UserRepository } from "../repositories/UserRepository";
import { AuthorizationService } from "../services/AuthorizationService";

@Protocol<StrategyOptions>({
  name: "jwt",
  useStrategy: Strategy,
  settings: {
    jwtFromRequest: AuthorizationService.jwtOptions.jwtFromRequest,
    secretOrKey: AuthorizationService.jwtOptions.secretOrKey,
    issuer: AuthorizationService.jwtSignOptions.issuer,
    audience: AuthorizationService.jwtSignOptions.audience as string
  }
})
export class JwtProtocol implements OnVerify {
  @Inject()
  private userRepository: UserRepository

  async $onVerify(@Req() req: Req, @Arg(0) jwtPayload: any) {
    const user = await this.userRepository.findOne({username: jwtPayload.username});
    return user || false;
  }
}