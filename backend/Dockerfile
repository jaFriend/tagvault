FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5050
RUN npx prisma generate
CMD ["npm", "start"]
