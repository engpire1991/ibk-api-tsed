import { Unauthorized } from "@tsed/exceptions";

export class UnauthorizedException extends Unauthorized {
  constructor(message?: string) {
    super(message || "Unauthorized");
  }
  type = "json_exception";
}