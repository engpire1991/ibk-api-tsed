import { JoinColumn } from "typeorm";
import { camelToUnder } from "../utils/Basic";

export function JoinCamelColumn(name: string): Function {
  return JoinColumn({ name: camelToUnder(name) });
}