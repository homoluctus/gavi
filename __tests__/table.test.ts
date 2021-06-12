import * as fs from 'fs';
import * as path from 'path';
import { table } from '../src/reporter/table';

describe('table test', () => {
  const oldColumns = process.stdout.columns;

  const testData = [
    {
      propertyPath: '',
      parameter: { missingProperty: 'description' },
      message: "must have required property 'description'"
    },
    {
      propertyPath: '',
      parameter: { missingProperty: 'runs' },
      message: "must have required property 'runs'"
    },
    {
      propertyPath: '/inputs/message',
      parameter: { missingProperty: 'description' },
      message: "must have required property 'description'"
    }
  ];

  function readExpectedTable(width: number): string {
    const fixtureDir = path.join(__dirname, 'fixtures/table');
    const p = path.join(fixtureDir, `col_${width}.txt`);
    return fs.readFileSync(p, { encoding: 'utf-8' });
  }

  beforeEach(() => {
    process.stdout.columns = oldColumns;
  });

  test('maxWidth = 156', () => {
    const width = 156;
    expect(table(testData, width)).toBe(readExpectedTable(width));
  });

  test('maxWidth = 78', () => {
    const width = 78;
    expect(table(testData, width)).toBe(readExpectedTable(width));
  });

  test('maxWidth = 60', () => {
    const width = 60;
    expect(table(testData, width)).toBe(readExpectedTable(width));
  });

  test('process.stdout.columns = 60, without width argument', () => {
    const width = 60;
    process.stdout.columns = width;
    expect(table(testData)).toBe(readExpectedTable(width));
  });
});
