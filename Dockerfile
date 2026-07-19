FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Ogni worker di page-data usa un DB isolato: il volume SQLite esiste solo a runtime.
RUN DATABASE_PATH=:memory: npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/db/migrations ./db/migrations
COPY --from=build /app/scripts ./scripts
# Gli script di seed girano fuori dal bundle Next: servono questi moduli espliciti.
COPY --from=build /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=build /app/node_modules/bcryptjs ./node_modules/bcryptjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
# Il db vive in /app/data: montare un volume persistente qui.
CMD ["node", "server.js"]
