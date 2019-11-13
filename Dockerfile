FROM spacegregor/node-dockerize:12

# Copy Node packages
COPY package.json ${APP_PATH}
COPY yarn.lock ${APP_PATH}

# Install Node packages
RUN yarn --pure-lockfile --ignore-engines

# Copy Codebase
COPY . ${APP_PATH}

# Build files for production
RUN yarn build
