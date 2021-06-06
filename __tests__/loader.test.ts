import { load } from 'js-yaml';
import * as path from 'path';
import { loadYaml } from '../src/loader';
import { fixtureDir } from './helper';

describe('loadYaml() Tests', () => {
  test('Load existing yaml file', () => {
    const filename = path.join(fixtureDir, 'correct-action.yaml');
    const result = loadYaml(filename);
    const expected = {
      name: 'Tweet Message Action',
      author: 'lazy-actions',
      description: 'Tweet message to twitter',
      inputs: {
        message: {
          description: 'Plain message to tweet',
          required: false
        }
      },
      runs: {
        using: 'node12',
        main: 'dist/index.js'
      },
      branding: {
        icon: 'hash',
        color: 'blue'
      }
    };
    expect(result).toMatchObject(expected);
  });

  test('Load non-existing yaml file', () => {
    const filename = 'non-existing.yaml';
    expect(() => loadYaml(filename)).toThrow(`Could not find ${filename}`);
  });

  test('Load empty yaml file', () => {
    const filename = path.join(fixtureDir, 'empty.yaml');
    expect(() => loadYaml(filename)).toThrow(
      `Failed to load ${filename}: The loaded result is empty`
    );
  });
});
