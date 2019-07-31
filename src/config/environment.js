let environment = {};

const updateEnv = (env, processEnv) => {
  //console.log('>>> [updateEnv]', env)
  // only update keys, not the original env reference
  for (const key of Object.keys(processEnv)) {
    env[key] = processEnv[key];
  }
  //console.log('<<< [updateEnv]', env)
};

const setEnv = env => {
  environment = env;
}

export { environment, updateEnv, setEnv };
