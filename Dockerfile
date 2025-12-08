FROM node:lts-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY backend/package.json backend/tsconfig.json backend/tsup.config.ts ./backend/
COPY shared/package.json shared/tsconfig.json ./shared/

RUN pnpm install --frozen-lockfile

COPY backend/src ./backend/src
COPY shared/src ./shared/src

RUN pnpm -F versus-type-backend build

FROM node:lts-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/backend/package.json ./backend/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 8443
EXPOSE 6969

CMD ["node", "./backend/dist/index.js"]
