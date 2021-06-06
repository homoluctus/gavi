export type LogLevel = 0 | 1 | 2 | 3;

export type ReportFormat = 'json' | 'table';

export type SchemaType = 'action' | 'workflow';

export type YamlLoadFormat = string | number | object;

export interface ValidatorOption {
  allErrors: boolean;
  strict?: boolean;
}

export interface ErrorReport {
  instancePath: string;
  params: Record<string, any>;
  message: string;
}

export interface Argv {
  filename: string;
  format: ReportFormat;
  logLevel: LogLevel;
  schemaType: SchemaType;
  silent: boolean;
}
