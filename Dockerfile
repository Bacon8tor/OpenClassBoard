FROM node:22-alpine

# Update Alpine packages to fix BusyBox vulnerabilities
RUN apk update && apk upgrade --no-cache

# Update npm to latest version to fix security vulnerabilities
RUN npm install -g npm@latest

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm","run","dev", "--", "--host", "0.0.0.0"]