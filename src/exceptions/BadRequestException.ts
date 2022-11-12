import { BadRequest } from "@tsed/exceptions";
import { ErrorCodeName, ErrorCodes, getErrorName } from "../constants/ErrorCodes";
import { PortalErrorResponseType } from "../types/PortalErrorResponseType";

export class BadRequestException extends BadRequest {
  constructor(field: string, errorCode: ErrorCodes)
  constructor(fields: { [key: string]: ErrorCodeName[] }, parent?: string)
  constructor(fields: { [key: string]: ErrorCodeName[] } | string, parent?: ErrorCodes | string) {
    super(BadRequestException.buildMessage(fields, parent));
  }

  type = "json_exception";

  /**
   *
   * @returns {string}
   * @param target
   * @param propertyName
   */
  static buildMessage(fields: { [key: string]: ErrorCodeName[] } | string, parent?: ErrorCodes | string): string {
    let error: PortalErrorResponseType = {
      error: "bad_request"
    };
    if (typeof fields == "string") {
      error.fields = { [fields]: [getErrorName(<string>parent)] };
    } else {
      error.fields = fields;
      error.parent = <string>parent;
    }
    return JSON.stringify(error);
  }
}