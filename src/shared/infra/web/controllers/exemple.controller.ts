import { FastifyReply, FastifyRequest } from "fastify";

export class ExempleController {
  static async execute(
    req: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    reply.status(200).send({ message: "Hello world!" });
  }
}
