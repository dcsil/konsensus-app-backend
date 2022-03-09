FROM node:16-alpine
# ENV NODE_ENV=production

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
ENV DOCKER=true
RUN npm install --production --silent && mv node_modules ../

COPY . /usr/src/app

EXPOSE 4000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
