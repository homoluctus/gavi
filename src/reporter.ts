import { ErrorObject } from 'ajv/dist/types';
import { ReportFormat, ErrorReport } from './interfaces';

export class Reporter {
  format: ReportFormat;

  constructor(format: ReportFormat = 'table') {
    this.format = format;
  }

  dump(raw: ErrorObject[]): void {
    const errors = this.formatErrors(raw);

    switch (this.format) {
      case 'json':
        console.log(this.json(errors, '\t'));
        break;
      case 'table':
        console.table(errors);
        break;
    }
  }

  private json(errors: ErrorReport[], space?: string): string {
    return JSON.stringify(errors, null, space);
  }

  private formatErrors(rawErrors: ErrorObject[]): ErrorReport[] {
    const newErrorObj: ErrorReport[] = [];
    rawErrors.forEach((err) =>
      newErrorObj.push({
        instancePath: err.instancePath,
        params: err.params,
        message: err.message as string
      })
    );
    return newErrorObj;
  }
}
