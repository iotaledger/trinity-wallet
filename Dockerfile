FROM node:8.11.2-stretch

VOLUME /dist

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


COPY . /trinity
WORKDIR /trinity

RUN yarn full-setup

# setup shared
WORKDIR /trinity/src/shared
RUN yarn

WORKDIR /trinity

ENTRYPOINT ["/bin/bash", "-c"]
