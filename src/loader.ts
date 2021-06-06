import * as fs from 'fs';
import yaml from 'js-yaml';
import { YamlLoadFormat } from './interfaces';
import { logger } from './logger';

export function loadYaml(filename: string): YamlLoadFormat {
  if (!isFile(filename)) {
    throw new Error(`${filename} is not a file`);
  }

  logger.debug(`Loading ${filename}`);

  try {
    const content = fs.readFileSync(filename, { encoding: 'utf-8' });
    const result = yaml.load(content);
    logger.debug(`The content of ${filename}: ${JSON.stringify(result)}`);

    if (!result) {
      throw new Error(`Failed to load ${filename}: The loaded result is empty`);
    }
    return result;
  } catch (err) {
    if (err instanceof yaml.YAMLException) {
      throw new Error(`Failed to load ${filename}: ${err.message}`);
    }
    throw err;
  }
}

function isFile(filename: string): boolean {
  try {
    return fs.statSync(filename).isFile();
  } catch (err) {
    throw new Error(`Could not find ${filename}`);
  }
}
