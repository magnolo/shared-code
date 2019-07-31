import { updateEnv, setEnv } from './config/environment';

import { PERMISSIONS } from './config/permissions';

import injectPermissions from './middleware/inject-permissions';
import secureByPermission from './middleware/secure-by-permission';

// Webpack somehow requires proper objects ..
const environment = {
  URL: 'http://localhost',
  PORT: 2385,
  NODE_ENV: 'production',
  SSL: 'nossl',
  ACCESS_CONTROL_URL: "LOLCAKE"
};
setEnv(environment);

const updateEnvironment = env => {
  console.log('[updateEnvironment] - In shared-code');
  updateEnv(environment, env);
};

import uuid from 'uuid/v4';
import fetch from 'cross-fetch';

import * as utilities from './utilities';
import * as layout from './content/layout';
import * as style from './content/style';

const magicExport = () => {
  const id = uuid();
  console.log('[SharedCode]', '>>>', id);
};

const middleware = { injectPermissions, secureByPermission };

export {
  magicExport,
  environment,
  updateEnvironment,
  utilities,
  layout,
  style,
  middleware,
  PERMISSIONS
};
