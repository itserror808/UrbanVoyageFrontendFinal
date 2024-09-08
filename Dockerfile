# Use a more recent Node.js version
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Use nginx for serving the built application
FROM nginx:alpine

# Copy the built app to nginx's serve directory
COPY --from=build /app/dist/urban-voyage-frontend /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]