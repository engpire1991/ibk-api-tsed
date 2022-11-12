import { Context, Inject, OverrideProvider } from "@tsed/common";
import { PassportMiddleware } from "@tsed/passport";
import { User } from "../entities/User";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { UserRepository } from "../repositories/UserRepository";

@OverrideProvider(PassportMiddleware)
export class PassportMiddlewareOverride extends PassportMiddleware {
  @Inject()
  private userRepository: UserRepository;

  async use(@Context() ctx: Context) {
    const request = ctx.getRequest() as Express.Request;
    const user: User = request.user as User;
    if (request.user && request.isAuthenticated()) {
      // if session is used, then full user info is not avaliable, so lets make sure to add it if necesarry
      if (!user.id || !user.profile) {
        // id or profile is missing lets get user data
        const fullUser = await this.userRepository.findOne({ username: user.username });
        if (!fullUser) {
          // user with such email doesn't exist
          // SECURITY: POSSIBLE_ATTACK_ATTEMPT, do something
          throw new UnauthorizedException();
        }
        request.user = fullUser;
      }
    }
    return super.use(ctx);
  }
}