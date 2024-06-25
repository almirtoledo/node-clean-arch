import { FastifyInstance } from "fastify";
import { ExempleController } from "../controllers/exemple.controller";

export const exempleRoutes = async (app: FastifyInstance) => {
  app.get("/", ExempleController.execute);
};
