import { UnprocessableEntity } from "@tsed/exceptions";
import { ErrorCodeName, ErrorCodes, getErrorName } from "../constants/ErrorCodes";
import { PortalErrorResponseType } from "../types/PortalErrorResponseType";

export class ValidationException extends UnprocessableEntity {
  constructor(field: string, errorCode: ErrorCodes)
  constructor(field: string, errors: (any & { error: ErrorCodeName })[])
  constructor(fields: { [key: string]: ErrorCodeName[] }, parent?: string)
  constructor(
    fields: { [key: string]: ErrorCodeName[] } | string,
    parent?: ErrorCodes | string | (any & { error: ErrorCodeName })[]
  ) {
    super(ValidationException.buildMessage(fields, parent));
    if (typeof fields == "string") {
      this.field = fields;
      if (ErrorCodes[parent as ErrorCodes]) {
        this.error = parent as ErrorCodes;
      }
    }
  }

  type = "json_exception";
  field?: string;
  error?: ErrorCodes;

  /**
   *
   * @returns {string}
   * @param target
   * @param propertyName
   */

  static buildMessage(
    fields: { [key: string]: ErrorCodeName[] } | string,
    parent?: ErrorCodes | string | (any & { error: ErrorCodeName })[]
  ): string {
    const error: PortalErrorResponseType = {
      error: "validation"
    };

    if (typeof fields == "string") {
      if (Array.isArray(parent)) {
        error.fields = { [fields]: parent };
      } else {
        error.fields = { [fields]: [getErrorName(<string>parent)] };
      }
    } else {
      error.fields = fields;
      error.parent = <string>parent;
    }
    return JSON.stringify(error);
  }
}