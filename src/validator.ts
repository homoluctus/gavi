import Ajv from 'ajv';
import { ErrorObject } from 'ajv/dist/types';
import fetch from 'node-fetch';
import { SchemaType, ValidatorOption } from './interfaces';
import { loadYaml } from './loader';
import { logger } from './logger';

export async function validate(
  filename: string,
  schemaType: SchemaType,
  option: ValidatorOption = { allErrors: true, strict: false }
): Promise<ErrorObject[] | void> {
  const target = loadYaml(filename);
  const schema = await loadSchema(schemaType);
  const ajv = new Ajv({ ...option });
  const valid = ajv.validate(schema, target);

  if (valid) {
    logger.info('Passed validation 🎉');
  } else if (ajv.errors) {
    logger.debug(`Validation Errors: ${JSON.stringify(ajv.errors)}`);
    logger.error('Validation Failed 😥');
    return ajv.errors;
  } else {
    logger.error('Validation Failed 😥');
    throw new Error('Validation unkwnon error occurred');
  }
}

async function loadSchema(schemaType: SchemaType): Promise<object> {
  const uri = getSchemaUri(schemaType);

  logger.debug(`Getting JSON schema from ${uri}`);

  const res = await fetch(uri);

  if (!res.ok) {
    throw new Error(`Schema loading error: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

function getSchemaUri(schemaType: SchemaType): string {
  switch (schemaType) {
    case 'action':
      return 'https://json.schemastore.org/github-action.json';
    case 'workflow':
      return 'https://json.schemastore.org/github-workflow.json';
  }
}
