import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

export async function mealsRoutes(app: FastifyInstance){
  app.post('/', async (request, reply) => {
    const userId = request.headers.user_id

    const createMealBodySchema = z.object({
      title: z.string(),
      description:  z.string(),
      date:  z.string(),
      time:  z.string(),
      isInDiet: z.number(),
    })

    const {title,description,date,time,isInDiet} = createMealBodySchema.parse(request.body)

    const id = randomUUID()

    const meal = {
      id,
      title,
      description,
      date,
      time,
      isInDiet,
    }

    await knex('meals').insert(meal)

    return reply.status(201).send({meal})
  })

  app.get('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const {id} = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals').where({'id': id}).first()

    return {meal}
  })

  app.put('/:id', async (request, reply) => {
    const editMealBodySchema = z.object({
      title: z.string(),
      description:  z.string(),
      date:  z.string(),
      time:  z.string(),
      isInDiet: z.number(),
    })

    const {title,description,date,time,isInDiet} = editMealBodySchema.parse(request.body)

    const updatedMeal = {
      title,
      description,
      date,
      time,
      isInDiet
    }

    await knex('meals').update(updatedMeal)

    return reply.status(201).send({updatedMeal})
  })

  app.delete('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const {id} = getMealParamsSchema.parse(request.params)

    await knex('meals').where({'id': id}).delete()

    return reply.status(202).send()
  })

  app.get('/user/:id', async (request, reply) => {

    const createUserIdSchema = z.object({
      id: z.string(),
    })

    const { id } = createUserIdSchema.parse(request.params)

    const userId = id

    const meals = await knex('meals').where('userId', userId)

    return {meals}
  })

  app.get('/user/:id/metrics', async (request, reply) => {

    const createUserIdSchema = z.object({
      id: z.string(),
    })

    const { id } = createUserIdSchema.parse(request.params)
    
    const userId = id

    const meals = await knex('meals').where('userId', userId)

    function findLongestSequence(meals: any) {
      let i,
          temp,
          sequence: number = 0,
          length = meals.length,
          longestSequence = 0;
  
      for(i = 0; i < length; i++) {
          if(temp != '' && temp == meals[i].isInDiet) {
              sequence++;
          } else {
              sequence = 1;
          }
  
          temp = meals[i].isInDiet;
  
          if(sequence > longestSequence) {
              longestSequence = sequence;
          }
      }
  
      return longestSequence;
    }

    const totalRegisteredMeals = meals.length
    const totalMealsInsideDiet =  meals.filter(meal => meal.isInDiet === 1).length;
    const totalMealsOutsideDiet = totalRegisteredMeals - totalMealsInsideDiet
    const bestSequenceOfMeals = findLongestSequence(meals);

    return {totalRegisteredMeals, totalMealsInsideDiet, totalMealsOutsideDiet, bestSequenceOfMeals}
  })

  app.put('/:userId/meal/:mealId', async (request, reply) => {
    const createUserIdSchema = z.object({
      userId: z.string(),
      mealId: z.string(),
    })

    const { userId, mealId } = createUserIdSchema.parse(request.params)

    const meal = await knex('meals')
      .where('id', mealId)
      .andWhere('userId', userId)

    
    if (!userId || userId !== meal[0].userId) {
      throw new Error('Only logged users can edit their meals')
    }

    if (request.body !== undefined) {
      const editMealBodySchema = z.object({
        title: z.string(),
        description:  z.string(),
        date:  z.string(),
        time:  z.string(),
        isInDiet: z.number(),
      })
          
      const {title,description,date,time,isInDiet} = editMealBodySchema.parse(request.body)
      
      const updatedMeal = {
        title,
        description,
        date,
        time,
        isInDiet
      }
      
      await knex('meals')
      .where('id', mealId)
      .andWhere('userId', userId)
      .update(updatedMeal)
      
      const verifyMealUpdate = await knex('meals')
      .where('id', mealId)
      .andWhere('userId', userId)
  
      return reply.status(201).send(verifyMealUpdate)
    } else {
      const meal = await knex('meals')
      .where('id', mealId)
      .andWhere('userId', userId)
  
      return reply.status(201).send(meal)
    }
    

  })
}