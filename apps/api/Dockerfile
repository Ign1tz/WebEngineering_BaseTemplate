FROM node:22-alpine
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
ENV HUSKY=0
RUN npm ci --workspace apps/api --include-workspace-root
COPY apps/api apps/api
EXPOSE 3000
CMD ["npm", "run", "dev", "--workspace", "apps/api"]
