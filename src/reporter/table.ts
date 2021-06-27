import { Table } from 'table-writer';
import yaml from 'js-yaml';
import { ReportObject } from '../interfaces';

export function table(data: ReportObject[], maxWidth?: number): string {
  const rows: string[][] = data.map((d) =>
    Object.values(d).map((cell) =>
      typeof cell === 'object'
        ? yaml.dump(cell, { skipInvalid: true, lineWidth: 50 })
        : cell
    )
  );
  const table = new Table(rows, { style: 'grid' });
  return table.write();
}
