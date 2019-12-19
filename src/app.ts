import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as path from 'path';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-koa';
import { createConnections, useContainer } from 'typeorm';
import { Container } from 'typedi';
import 'reflect-metadata';

const PORT = 8000;
const server: Koa = new Koa();
const router: Router = new Router();

router.get(
  '/healthy',
  (ctx: Router.RouterContext) => (ctx.body = 'Visuallylab is awesome!'),
);

server.use(router.routes());

useContainer(Container);

(async () => {
  await createConnections([
    {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'docker',
      database: 'test',
      entities: [
        path.resolve(__dirname, 'entities/*.ts'),
        path.resolve(__dirname, 'entities/*.js'),
      ],
      synchronize: true,
    },
  ]);

  console.log('🚀 DB orm is connected!');

  const schema = await buildSchema({
    resolvers: [
      path.resolve(__dirname, 'resolvers/**/resolver.ts'),
      path.resolve(__dirname, 'resolvers/**/resolver.js'), // production will bundle .js
    ],
    container: Container, // register 3rd party IOC container
  });

  const apollo = new ApolloServer({ schema });

  apollo.applyMiddleware({ app: server });

  server.listen(PORT, () => {
    console.log(`🚀 HTTP Server ready at port ${PORT}`);
  });
})();
