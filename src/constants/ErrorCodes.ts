import { toSnakeCase } from "../utils/Basic";

export enum ErrorCodes {
  CONST = 1000,
  ENUM,
  FORMAT,
  MAXIMUM,
  MINIMUM,
  EXCLUSIVE_MAXIMUM,
  EXCLUSIVE_MINIMUM,
  MAX_LENGTH,
  MIN_LENGTH,
  MAX_ITEMS,
  MIN_ITEMS,
  MAX_PROPERTIES,
  MIN_PROPERTIES,
  FORMAT_MAXIMUM,
  FORMAT_MINIMUM,
  FORMAT_EXCLUSIVE_MAXIMUM,
  FORMAT_EXCLUSIVE_MINIMUM,
  MULTIPLE_OF,
  PATTERN,
  REQUIRED,
  UNIQUE_ITEM,
  INVALID,
  NOT_ALLOWED,
  MUST_MATCH,
  NOTHING_FOUND,
  CAN_NOT_BE_CHANGED,
  CAN_NOT_BE_REMOVED,
  NOT_ACTIVATED,
  MAX_SIZE
}

export type ErrorCodeName = keyof typeof ErrorCodes;

export function getErrorCodeByName(name: string): ErrorCodes {
  return ErrorCodes[toSnakeCase(name) as ErrorCodeName];
}

export function getErrorName(codeOrString: string | number): ErrorCodeName | undefined {
  // return error code by number if number was passed
  if (typeof codeOrString == "number") return ErrorCodes[codeOrString] as ErrorCodeName;
  
  // throw error if nor number nor a string was received
  if (typeof codeOrString != "string") throw new Error("codeOrString must be of type 'string' or 'number'");

  // get the snake case value of the input string
  const snakeCase = toSnakeCase(codeOrString) as ErrorCodeName;
  
  // return the snake case value if it is a valid error code
  if (ErrorCodes[snakeCase]) return snakeCase;

  return undefined;
}