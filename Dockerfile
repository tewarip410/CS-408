FROM node:8

# Create app directory
WORKDIR /usr/src

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# For quick development
RUN npm install -g nodemon

# Bundle app source
COPY ./server .

EXPOSE 8081
CMD [ "npm", "run", "dev" ]