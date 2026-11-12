FROM node:22-alpine
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
ENV HUSKY=0
RUN npm ci --workspace apps/web --include-workspace-root
COPY apps/web apps/web
EXPOSE 5173
CMD ["npm", "run", "dev", "--workspace", "apps/web", "--", "--host", "0.0.0.0", "--strictPort"]
