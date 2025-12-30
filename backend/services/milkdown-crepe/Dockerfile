# Minimal Dockerfile for milkdown-crepe service
FROM node:20-bullseye-slim
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production
COPY . .
RUN npm run build || true
EXPOSE 8001
ENV NODE_ENV=production
CMD ["node","dist/index.js"]
