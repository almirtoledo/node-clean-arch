import fastify from "fastify";
import { exempleRoutes } from "../infra/web/routes/exemple.routes";

export const fastifyServer = async () => {
  const app = fastify();

  app.register(exempleRoutes, { prefix: "/exemple" });

  app.listen({
    host: "0.0.0.0",
    port: 3009,
  });
};
