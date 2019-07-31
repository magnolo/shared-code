FROM node:10-slim

# Provide APP_PATH
ENV APP_PATH /usr/src/app

# Grant Node more Memory
ARG node_options
ENV NODE_OPTIONS=$node_options
# RUN cat /proc/meminfo
# RUN echo ${NODE_OPTIONS}

# Copy Node package definition
WORKDIR ${APP_PATH}
COPY package.json ${APP_PATH}
COPY yarn.lock ${APP_PATH}

# Install Node packages
RUN yarn --pure-lockfile

# Copy Codebase
COPY . /usr/src/app

# Build files for production
RUN yarn run build
