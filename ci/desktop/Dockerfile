FROM node:8.11.2-stretch

VOLUME /dist

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y git python \
    gcc-multilib g++-multilib \
    build-essential libssl-dev rpm \
    libsecret-1-dev software-properties-common apt-transport-https


# install wine (needed for windows build)
RUN dpkg --add-architecture i386 && \
    wget -nc https://dl.winehq.org/wine-builds/Release.key && \
    apt-key add Release.key && \
    apt-add-repository https://dl.winehq.org/wine-builds/debian/ && \
    apt-get update && \
    apt-get install --install-recommends -y winehq-stable

# Install shared dependencies
COPY package.json yarn.lock /app/
COPY src/shared/package.json src/shared/yarn.lock /app/src/shared/

RUN yarn
RUN cd src/shared && yarn

# Install desktop dependencies
COPY src/desktop/package.json src/desktop/yarn.lock /app/src/desktop/

RUN cd src/desktop && yarn
