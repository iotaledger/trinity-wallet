FROM node:8.11.2-stretch

# Install shared dependencies
COPY package.json yarn.lock /app/
COPY src/shared/package.json src/shared/yarn.lock /app/src/shared/

RUN yarn
RUN cd src/shared && yarn

# Install mobile dependencies
COPY src/mobile/package.json src/mobile/yarn.lock src/mobile/babelHelpersCopy /app/src/mobile/

RUN cd src/mobile && yarn

# Install react-native-cli
RUN yarn global add react-native-cli
