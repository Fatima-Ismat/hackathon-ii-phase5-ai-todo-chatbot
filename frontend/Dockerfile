# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app

# copy package.json
COPY package.json ./

# copy lockfile if present (wildcard => no error if missing)
COPY package-lock.json* ./

# install deps
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi


# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

# bake public envs (Next.js build-time)
ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_BACKEND_BASE_URL

ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
ENV NEXT_PUBLIC_BACKEND_BASE_URL=${NEXT_PUBLIC_BACKEND_BASE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN echo "NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}"
RUN echo "NEXT_PUBLIC_BACKEND_BASE_URL=${NEXT_PUBLIC_BACKEND_BASE_URL}"

RUN npm run build


# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000

CMD ["npm", "run", "start", "--", "-p", "3000"]
