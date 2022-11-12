import { ErrorCodeName } from "../constants/ErrorCodes";

export type PortalErrorResponseType = {
  error: string,
  parent?: string,
  fields?: {[name: string]: ErrorCodeName[] | (any & { error: ErrorCodeName })[]}
}