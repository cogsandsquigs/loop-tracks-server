FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
RUN npm i --omit dev

# Bundle app source
COPY . .

RUN npm run build

ARG PORT=8080

EXPOSE 8080

CMD [ "node", "build/main.js" ]