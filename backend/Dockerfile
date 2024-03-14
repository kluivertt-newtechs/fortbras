FROM node:alpine

RUN npm install -g npm

ENV HOME=/home/backend
WORKDIR $HOME

COPY ["package.json", "package-lock.json", "tsconfig.json", "./"]
RUN npm install

COPY . $HOME