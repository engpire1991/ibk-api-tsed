import { PlatformContext } from "@tsed/common";
import { Catch, ExceptionFilterMethods, ResourceNotFound } from "@tsed/platform-exceptions";
import { ONotFoundModel } from "../models/outgoing/ONotFoundModel";

@Catch(ResourceNotFound)
export class ResourceNotFoundFilter implements ExceptionFilterMethods {

  async catch(exception: ResourceNotFound, ctx: PlatformContext) {
    // if file is being sent then do nothing
    if (ctx.response.get('sendingFile')) return;

    // send a json version of the Not Found error
    ctx.response.status(404).body(new ONotFoundModel(exception.url));
  }
}