import * as path from 'path';
import { validate } from '../src/validator';
import { logger, DEBUG } from '../src/logger';

logger.level = DEBUG;

describe('Validator Tests', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');

  test('Validate GitHub Actions workflow has correct syntax', async () => {
    const target = path.join(fixturesDir, 'correct-workflow.yaml');
    const result = await validate(target, 'workflow');
    expect(result).toBe(undefined);
  });

  test('Validate GitHub Actions workflow has incorrect syntax', async () => {
    const target = path.join(fixturesDir, 'incorrect-workflow.yaml');
    const result = await validate(target, 'workflow');
    expect(typeof result).toBe('object');
  });

  test('Validate GitHub Actions metadata has correct syntax', async () => {
    const target = path.join(fixturesDir, 'correct-action.yaml');
    const result = await validate(target, 'action');
    expect(result).toBe(undefined);
  });

  test('Validate GitHub Actions metadata has incorrect syntax', async () => {
    const target = path.join(fixturesDir, 'incorrect-action.yaml');
    const result = await validate(target, 'action');
    expect(typeof result).toBe('object');
  });
});
