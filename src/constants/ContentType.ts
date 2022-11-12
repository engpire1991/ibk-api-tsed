export const CONTENT_TYPE = {
	XML: 'application/xml',
	CSV: 'text/csv',
	XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  XLS: 'application/vnd.ms-excel',
  ZIP: 'application/zip',
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC: 'application/msword',
  TIFF: 'image/tiff',
  EDOC: 'application/edoc',
  PNG: 'image/png'
};

export const CONTENT_TYPE_BY_MIME = {
  ".xml": CONTENT_TYPE.XML,
  ".csv": CONTENT_TYPE.CSV,
  ".xlsx": CONTENT_TYPE.XLSX,
  ".xls": CONTENT_TYPE.XLS,
  ".zip": CONTENT_TYPE.ZIP,
  ".pdf": CONTENT_TYPE.PDF,
  ".docx": CONTENT_TYPE.DOCX,
  ".doc": CONTENT_TYPE.DOC,
  ".tiff": CONTENT_TYPE.TIFF,
  ".edoc": CONTENT_TYPE.EDOC
}