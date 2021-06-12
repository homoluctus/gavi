import { ErrorObject } from 'ajv/dist/types';
import { table } from './table';
import { ReportFormat, ReportObject } from '../interfaces';
import { logger } from '../logger';

export class Reporter {
  format: ReportFormat;

  constructor(format: ReportFormat = 'table') {
    this.format = format;
  }

  dump(raw: ErrorObject[]): void {
    const errors = this.formatErrors(raw);
    console.log(this.build(errors));
  }

  private build(obj: ReportObject[]): string {
    switch (this.format) {
      case 'json':
        return this.json(obj, '\t');
      case 'table':
        return table(obj);
    }
  }

  private json(obj: ReportObject[], space?: string): string {
    return JSON.stringify(obj, null, space);
  }

  private formatErrors(rawErrors: ErrorObject[]): ReportObject[] {
    const reportObj: ReportObject[] = [];
    rawErrors.forEach((err) =>
      reportObj.push({
        propertyPath: err.instancePath,
        parameter: err.params,
        message: err.message as string
      })
    );
    logger.info(JSON.stringify(reportObj));
    return reportObj;
  }
}
