# Use node image to build the Vite app
FROM node:20 AS build
ARG VITE_APRV_AI_API_URL
# Use the ARG in your Dockerfile as needed, for example:
ENV VITE_APRV_AI_API_URL=$VITE_APRV_AI_API_URL

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Use an nginx image to serve the Vite app
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
