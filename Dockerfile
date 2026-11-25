FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY dist ./dist
COPY server ./server
RUN npm run build
ENV PORT=3000
EXPOSE 3000
USER node
CMD ["npm", "start"]
