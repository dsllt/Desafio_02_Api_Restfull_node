import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

export async function userRoutes(app: FastifyInstance){
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      username: z.string(),
      name: z.string(),
      age: z.number(),
      weight: z.number(),
    })

    const { name, age, weight, username } = createUserBodySchema.parse(
      request.body,
    )

    const user = {
      id: randomUUID(),
      username,
      name,
      age,
      weight
    }
    
    await knex('users').insert(user)

    return reply.status(201).send({user})
  })

  app.get('/', async (request, reply) => {
    const users = await knex('users')
    return {users}
  })

  app.get('/:id', async (request, reply) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const {id} = getUserParamsSchema.parse(request.params)
    const user = await knex('users').where({'id': id}).first()

    return {user}
  })
}