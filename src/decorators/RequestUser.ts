import { Req } from "@tsed/common";
import { useDecorators } from "@tsed/core";
import { User } from "../entities/User";

export function RequestUser(expression?: keyof User): Function {
  const exp = (expression && `.${expression}`) || '';
  
  // if the user is attached to request (req.user)
  return useDecorators(Req(`user${exp}`));
}