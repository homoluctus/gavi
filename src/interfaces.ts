export type LogLevel = 0 | 1 | 2 | 3;

export type SchemaType = 'action' | 'workflow';

export type YamlLoadFormat = string | number | object;

export interface ValidatorOption {
  allErrors: boolean;
  strict?: boolean;
}

export type ReportFormat = 'json' | 'table';

export interface ReportObject {
  propertyPath: string;
  parameter: Record<string, any>;
  message: string;
}

export interface Argv {
  filename: string;
  format: ReportFormat;
  logLevel: LogLevel;
  schemaType: SchemaType;
  silent: boolean;
}
