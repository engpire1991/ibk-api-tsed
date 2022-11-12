import { Required } from "@tsed/schema";

export class IAuthorizationPostLoginModel {
  @Required()
  username: string;

  @Required()
  password: string;
}