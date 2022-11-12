import { Catch, ExceptionFilterMethods, PlatformContext, ResponseErrorObject } from "@tsed/common";
import { Exception } from "@tsed/exceptions";
import { ErrorObject } from "ajv";
import { ErrorCodeName, getErrorName } from "../constants/ErrorCodes";
import { InternalServerException } from "../exceptions/InternalServerException";
import { ValidationException } from "../exceptions/ValidationException";
import { isEmpty } from "../utils/Basic";

@Catch(Exception, Error)
export class HttpExceptionFilter implements ExceptionFilterMethods {
  catch(exception: Exception, ctx: PlatformContext) {
    const { response, logger } = ctx;
    const headers = this.getHeaders(exception);

    let error = this.handlePassThroughError(exception);

    logger.error({ error });
    console.log(`error ===================> `, error, ctx.request.body);
    let status: number = error.status;
    let body: any;
    if (error instanceof Exception && error.type === "json_exception") {
      // set body as the message of the exception
      body = error.message;
    } else if (error && error.name == 'BAD_REQUEST' && !isEmpty(error.errors)) {
      // default status to 400
      if (!status) status = 400;

      // set body as teh errors array
      body = error.errors;
    } else {
      // unhandled error, send it as Internal Error
      error = new InternalServerException("Internal Error");
      // set the status as 500
      status = 500;
      // set body as the message of the exception
      body = error.message;
    }

    response
      .setHeaders(headers)
      .status(status)
      .body(body);
  }

  mapError(error: any) {
    return {
      name: error.origin?.name || error.name,
      message: error.message,
      status: error.status || 500,
      errors: this.getErrors(error)
    };
  }

  protected getErrors(error: any) {
    return [error, error.origin].filter(Boolean).reduce((errs, { errors }: ResponseErrorObject) => {
      return [...errs, ...(errors || [])];
    }, []);
  }

  protected getHeaders(error: any) {
    return [error, error.origin].filter(Boolean).reduce((obj, { headers }: ResponseErrorObject) => {
      return {
        ...obj,
        ...(headers || {})
      };
    }, {});
  }

  private handlePassThroughError(error: any) {
    // return the input if if it undefined or has no origin
    if (!error || !error.origin) return error;

    // return the origin if its type is json_exception
    if (error.origin.type == "json_exception") return error.origin;

    if (error.origin.name == "AJV_VALIDATION_ERROR") {
      const fields: { [key: string]: ErrorCodeName[] } = {};
      const errorStack: ErrorObject[] = error.origin["errors"];
      // delete dataPath if it is empty or a string "undefined"
      if (isEmpty(error.dataPath) || error.dataPath == "undefined") delete error.dataPath;

      // return validation error if errorStack is empty
      if (isEmpty(errorStack)) return new ValidationException(fields, error.dataPath);
      for (const err of errorStack) {
        let path = `${err.data || ''}`;
        if (err.keyword == "required" && err.params.missingProperty) {
          // add . to path if it is not empty
          if (!isEmpty(path)) path += ".";

          // add missing property to path
          path += err.params.missingProperty;
        }

        // remove leading . if it exists
        if (!isEmpty(path) && path[0] == ".") path = path.substring(1);

        // set empty array for fields by path if it has no value
        if (isEmpty(fields[path], true)) fields[path] = [];

        // get error name
        const errorName = getErrorName(err.keyword);

        // throw error if error name was not found
        if (!errorName) throw new InternalServerException(`Error with name '${err.keyword}' is not handled`);

        // add error to fields by path
        fields[path].push(errorName);
      }

      return new ValidationException(fields, error.dataPath);
    }

    return error;
  }
}