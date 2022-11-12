import { Context, ConverterService, ResponseFilter, ResponseFilterMethods } from "@tsed/common";

@ResponseFilter("*/*")
export class SendResponseMiddleware implements ResponseFilterMethods {
  constructor(private converterService: ConverterService) {
  }

  public transform(data: any, ctx: Context) {
    const response = ctx.getResponse();
    // do nothing if response is sending file
    if (response.get('sendingFile')) return data;

    const type = typeof data;

    // return data if it is undefined
    if (data === undefined) return data;

    // return string version of the data if it is a simple type
    if (data === null || ["number", "boolean", "string"].includes(type)) return String(data);

    // check if we have a module for this response
    let storedResponses = ctx.endpoint.store.get('responses') || {};
    let options: any;
    // if type is set for the status code then set the option type as the one set
    if (storedResponses[response.statusCode]?.type) options = { type: storedResponses[response.statusCode].type };
    return this.converterService.serialize(data, options);
  }
}