# Build Stage 1: Node.js Backend & Frontend
FROM node:18-slim AS node_base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build Stage 2: Python AI Engine
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Environment Setup
ENV PORT=3000
EXPOSE 3000
EXPOSE 8000

# Start Commands
CMD ["node", "server.js"]
