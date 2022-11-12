import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { ColumnOptions } from "typeorm";

export interface ExtendedColumnOptions extends ColumnOptions {
  encrypt?: boolean,
  secret?: string
}
export function encryptCipheriv(data: any, secret: string, algorithm: string = 'aes-256-cbc'): string {
  let iv = randomBytes(16);
  let cipher = createCipheriv(algorithm, Buffer.from(secret, "utf8"), iv);
  let start = cipher.update(Buffer.from(data, "utf8"));
  let final = cipher.final();
  return Buffer.concat([iv, start, final]).toString("base64");
}

export function decryptCipheriv(encryptedData: any, secret: string, algorithm: string = 'aes-256-cbc'): string {
  let data = Buffer.from(encryptedData, "base64");
  let iv = data.slice(0, 16);
  let decipher = createDecipheriv(algorithm, Buffer.from(secret, "utf8"), iv);
  let start = decipher.update(data.slice(16));
  let final = decipher.final();
  return Buffer.concat([start, final]).toString("utf8");
}