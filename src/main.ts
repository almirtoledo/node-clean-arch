import { fastifyServer } from "@/shared/config/fastify-server";
import "dotenv/config";

const main = async () => await fastifyServer();

main();
