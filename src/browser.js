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
  console.log('[updateEnvironment] - In shared-code ');
  updateEnv(environment, env);
  setFetch(fetch);
};

import uuid from 'uuid/v4';

import * as constants from './config/constants';
import * as utilities from './utilities';
import * as layout from './content/layout';
import * as style from './content/style';
import { validateContent, getTooltipContent } from './content/validator';
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

//data utilties
import { countDecimals, convertStringToValueIfPossible, getDecimalPlaces } from './data/utilities';
//datachecks
import { testFieldsAsValueField } from './data/fieldchecks';

const magicExport = () => {
  const id = uuid();
  console.log('[SharedCode Browser]', '>>>', id);
  // fetch('https://google.com');
};

const middleware = { injectPermissions, secureByPermission };
const contentUtilities = {
  validate: validateContent,
  getTooltipContent: getTooltipContent
};
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

const dataUtilities = {
  countDecimals: countDecimals,
  convertStringToValueIfPossible: convertStringToValueIfPossible,
  getDecimalPlaces: getDecimalPlaces,
  testFieldsAsValueField: testFieldsAsValueField
};

export {
  dataUtilities,
  templateUtilities,
  contentUtilities,
  magicExport,
  environment,
  updateEnvironment,
  constants,
  utilities,
  layout,
  style,
  middleware,
  PERMISSIONS,
  ANON_USER
};
