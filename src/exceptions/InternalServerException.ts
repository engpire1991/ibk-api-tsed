import { InternalServerError } from "@tsed/exceptions";

export class InternalServerException extends InternalServerError {
  constructor(originalError: any, msg?: string, param?: string) {
    super(InternalServerException.buildMessage(msg || 'server', param || 'server_error'));
    this.innerException = originalError;
  }

  type = "json_exception";

  /**
   *
   * @returns {string}
   * @param target
   * @param propertyName
   */
  static buildMessage(msg: string, param: string) {
    return JSON.stringify({ error: msg, error_param: param });
  }
}