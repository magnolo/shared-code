import { updateEnv, setEnv, setFetch } from './config/environment';

import { PERMISSIONS, ANON_USER } from './config/permissions';

import injectPermissions from './middleware/inject-permissions';
import secureByPermission from './middleware/secure-by-permission';

// Webpack somehow requires proper objects ..
const environment = {
  URL: 'http://localhost',
  PORT: 2385,
  NODE_ENV: 'production',
  SSL: 'nossl',
  ACCESS_CONTROL_URL: 'LOLCAKE'
};
setEnv(environment);

const updateEnvironment = config => {
  const { fetch, env } = config;
  console.log('[updateEnvironment] - In shared-code');
  updateEnv(environment, env);
  setFetch(fetch);
};

import uuid from 'uuid/v4';
// import fetch from 'node-fetch';

import * as constants from './config/constants';
import * as utilities from './utilities';
import { getColorScale } from './color/colorScale';
import * as layout from './content/layout';
import * as style from './content/style';
import { validateContent } from './content/validator';
import { validateTemplate } from './templates/validator';
import {
  mergeTemplates,
  getAmountofSelectedTemplateValues,
  reduceTemplateValuesToSelected,
  applyTemplateToContent,
  applySectionSelectionForChildren,
  generateNewTemplateAndConfigurationFromContent,
  generateTemplateConfiguration
} from './templates/templates';
import * as dataUtilities from './data/pipeline';

import { ContentSchema } from './schema/content';
import { DataSchema } from './schema/data';
import { UserSchema } from './schema/user';

const magicExport = () => {
  const id = uuid();
  console.log('[SharedCode Node]', '>>>', id);
  // fetch('https://google.com');
};

const schemas = [
  // prettier-ignore
  { name: 'Content', schema: ContentSchema },
  { name: 'Data', schema: DataSchema },
  { name: 'User', schema: UserSchema }
];

const middleware = { injectPermissions, secureByPermission };
const schema = { ContentSchema, DataSchema, UserSchema };
const contentUtilities = { validate: validateContent };
const colorScale = { getColorScale };
const templateUtilities = {
  validateTemplate: validateTemplate,
  mergeTemplates: mergeTemplates,
  getAmountofSelectedTemplateValues: getAmountofSelectedTemplateValues,
  reduceTemplateValuesToSelected: reduceTemplateValuesToSelected,
  applyTemplateToContent: applyTemplateToContent,
  applySectionSelectionForChildren: applySectionSelectionForChildren,
  generateNewTemplateAndConfigurationFromContent: generateNewTemplateAndConfigurationFromContent,
  generateTemplateConfiguration: generateTemplateConfiguration
};

export {
  templateUtilities,
  contentUtilities,
  dataUtilities,
  colorScale,
  schemas,
  magicExport,
  environment,
  updateEnvironment,
  constants,
  utilities,
  layout,
  style,
  middleware,
  schema,
  PERMISSIONS,
  ANON_USER
};
