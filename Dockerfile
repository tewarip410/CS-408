FROM node:8

# Create app directory
WORKDIR /code

RUN npm install -g nodemon
COPY package.json /code/package.json
RUN npm install && npm ls
RUN mv /code/node_modules /node_modules

RUN npm install

# Bundle app source
COPY . /code

EXPOSE 8081

CMD ["npm", "start"]
