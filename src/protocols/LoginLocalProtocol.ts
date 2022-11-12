import { BodyParams, Req } from "@tsed/common";
import { OnVerify, Protocol } from "@tsed/passport";
import { IStrategyOptions, Strategy } from "passport-local";
import { User } from "../entities/User";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { UserRepository } from "../repositories/UserRepository";

@Protocol<IStrategyOptions>({
  name: "login",
  useStrategy: Strategy,
  settings: {
    usernameField: "username",
    passwordField: "password"
  }
})
export class LoginLocalProtocol implements OnVerify {
  constructor(private userRepository: UserRepository) {
  }

  async $onVerify(@Req() request: Req, @BodyParams() credentials: { username: string, password: string }) {
    const { username, password } = credentials;

    // const user = await this.userRepository.findOne({ username });
    const user = new User();
    user.id = 0;
    user.username = username;

    // throw unauthorized if user was not found
    if (!user) throw new UnauthorizedException('username_or_password');

    // TODO: implement normal password check
    // throw unauthorized exception if password is not correct
    if (password != 'test') throw new UnauthorizedException('username_or_password');

    return user;
  }
}