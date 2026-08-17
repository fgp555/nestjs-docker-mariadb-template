# Docker + MariaDB + Watch mode

## Estructura agregada

```
├── Dockerfile                  # multi-stage: development / build / production
├── docker-compose.yml          # desarrollo, con `develop.watch`
├── docker-compose.prod.yml     # producción (imagen liviana, sin watch)
├── .env.example / .env
├── public/
│   └── index.html              # servido en http://localhost:3000 vía express.static
├── requests/                   # archivos .http (extensión "REST Client" de VSCode)
│   ├── app.http
│   ├── tasks.http
│   └── http-client.env.json
└── src/
    ├── database/database.module.ts   # conexión TypeORM -> MariaDB
    ├── health/                       # GET /health (Terminus: DB ping + memoria)
    └── tasks/                        # módulo CRUD de ejemplo (entity/controller/service/dto)
```

## 1. Variables de entorno

Ya existe `.env` (copiado de `.env.example`) con valores por defecto. Ajusta si quieres.

## 2. Desarrollo con recarga en caliente (Compose Watch)

```powershell
docker compose up --watch
```

Esto:

- Construye la imagen `development` (etapa `development` del `Dockerfile`).
- Levanta `api` (NestJS, puerto **3000**), `mariadb` (puerto **3306**) y `adminer` (puerto **8080**, cliente web para ver la BD).
- Ejecuta `npm run start:dev` (Nest en modo `--watch`) dentro del contenedor.
- Sincroniza `./src`, `./public` y `./test` hacia el contenedor al vuelo (`action: sync`) — Nest recompila solo, sin reiniciar el contenedor.
- Si cambias `package.json`, `tsconfig*.json`, `nest-cli.json` o el `Dockerfile`, Compose **reconstruye** la imagen automáticamente (`action: rebuild`).

Alternativa (logs de app separados de los eventos de watch):

```powershell
docker compose up -d
docker compose watch
```

Abre **http://localhost:3000** → verás `public/index.html`, que consume la API de tareas.
Abre **http://localhost:8080** (Adminer) para ver la base de datos: sistema `MySQL`, servidor `mariadb`, usuario/clave/BD según tu `.env`.

## 3. Probar la API

Con la extensión **REST Client** de VSCode, abre `requests/app.http` o `requests/tasks.http` y haz clic en "Send Request" sobre cada bloque. Incluye CRUD completo contra MariaDB (`GET/POST/PATCH/DELETE /tasks`).

## 4. Producción

```powershell
docker compose -f docker-compose.prod.yml up -d --build
```

Usa la etapa `production` del `Dockerfile` (imagen final sin devDependencies, corre como usuario no root) y no monta watch.

## Notas

- La conexión a MariaDB usa `@nestjs/typeorm` + `typeorm` + `mysql2`, configurada en `src/database/database.module.ts` a partir de variables de entorno (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`).
- `synchronize: true` (controlado por `DB_SYNCHRONIZE`) crea/actualiza las tablas automáticamente — útil en desarrollo. En producción, cámbialo a `false` y usa migraciones de TypeORM.
- `src/tasks` es un CRUD de ejemplo (`Task` entity) para verificar que todo el flujo Nest ↔ MariaDB funciona; bórralo o renómbralo cuando agregues tus propias entidades.
- **`GET /health`** (vía `@nestjs/terminus`): responde `200` con `{"status":"ok", ...}` si la app y la conexión a MariaDB están sanas, y `503` si algo falla (útil para `healthcheck` de Docker/orquestadores, o para un load balancer). También valida el uso de heap de memoria.
- **Logging HTTP**: `morgan` está activo en `main.ts` — formato `dev` (conciso, coloreado) en desarrollo y `combined` (estilo Apache, ideal para parsear logs) cuando `NODE_ENV=production`.

---

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
