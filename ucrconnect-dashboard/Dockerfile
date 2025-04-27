# Base build image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy ONLY package files and install dependencies and exclude for now the whole codebase, to get advantage of the caching layers of npm
COPY package*.json ./
RUN npm install

# Now copy the rest of the codebase and build the app(we include the .env file in this first stage, which ensures the 'npm run build' command runs succesfully AND 'consume' those credentials)
COPY . .
# RUN npm run dev

# Lightweight production image
# FROM node:18-alpine AS runner

# # Set NODE_ENV to production to make next js run efficiently
# ENV NODE_ENV=production

# # Set working directory
# WORKDIR /app

# # Copy only the necessary files from the builder stage
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json

# # Expose the port Next.js will run on
EXPOSE 3001 

# CMD ["npm", "start"]
CMD ["npm", "run", "dev"]
