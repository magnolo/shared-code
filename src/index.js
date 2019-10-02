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

const updateEnvironment = (config) => {
  const { fetch, env } = config;
  console.log('[updateEnvironment] - In shared-code');
  updateEnv(environment, env);
  setFetch(fetch);
};

import uuid from 'uuid/v4';
// import fetch from 'node-fetch';

import * as utilities from './utilities';
import * as layout from './content/layout';
import * as style from './content/style';

const magicExport = () => {
  const id = uuid();
  console.log('[SharedCode]', '>>>', id);
  // fetch('https://google.com');
};

const middleware = { injectPermissions, secureByPermission };

export { magicExport, environment, updateEnvironment, utilities, layout, style, middleware, PERMISSIONS, ANON_USER };
