import { fromBuffer } from "file-type";
import path from "path";
import { CONTENT_TYPE_BY_MIME } from "../constants/ContentType";

const docXlsMagicNumber = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
export async function getFileType(buffer: Buffer, filename?: string): Promise<{ ext: string, mime: string } | undefined> {
  // return undefined if buffer is not received
  if (buffer == null) return undefined;

  let extention = '';
  // get extention based on filename if provided
  if (filename) extention = path.parse(filename).ext;

  // check for .doc and .xls types
  if (buffer.compare(docXlsMagicNumber) && (extention === ".doc" || extention === ".xls")) {
    // handle as the input extention, as we can't be sure any other way
    return { ext: extention, mime: CONTENT_TYPE_BY_MIME[extention] };
  }

  // try to get file type
  const type = await fromBuffer(buffer);
  // return the type if it was parsed
  if (type) return type;
  
  // type not found, check if BOM exists at the beggining of file
  // returne a filetype parse of the file wiht BOM removed, if it was present
  if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) return fromBuffer(buffer.slice(3));
  

  // return nothing
  return undefined;
}