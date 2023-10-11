import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { app } from "../app";
import { execSync } from "child_process";
import request from 'supertest'
import { randomUUID } from "crypto";

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })
  
  afterAll(async () => {
    await app.close()
  })
  
  beforeEach( () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  test('the user can register a meal with a name, description, date, time and if it is in the diet', async () => {
    const user = await request(app.server)
    .post('/users')
    .send({
      "username": "brt",
      "name": "Roberto",
      "age": 30,
      "weight": 75.4
    })

    const userId = user.body.user.id

    await request(app.server)
      .post('/meals')
      .set('user_id', userId)
      .send({
        "title": "Sanduíche",
        "description": "Sanduíche de pão integral com atum e salada de alface e tomate",
        "date": "08/10/2023",
        "time": "16:00",
        "isInDiet": 1
      })
      .expect(201)
  })
  test('the user can edit a meal with a name, description, date, time and if it is in the diet', async () => {
    const user = await request(app.server)
      .post('/users')
      .send({
        "username": "blt",
        "name": "Roberto",
        "age": 30,
        "weight": 75.4
      })

    const userId = user.body.user.id

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('user_id', userId)
      .send({
        "title": "Sanduíche",
        "description": "Sanduíche de pão integral com atum e salada de alface e tomate",
        "date": "08/10/2023",
        "time": "16:00",
        "isInDiet": 1
      })
      
    
    const mealId = createMealResponse.body.meal.id

    const updateMealResponse = await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        "title": "Sanduíche",
        "description": "Sanduíche de pão integral com atum e salada de alface e tomate",
        "date": "08/10/2023",
        "time": "18:00",
        "isInDiet": 0
      })
      .expect(201)

    expect(createMealResponse.body.meal).not.toMatchObject(updateMealResponse.body.updatedMeal)
  })

  test('the user can delete a meal', async () => {
    const user = await request(app.server)
    .post('/users')
    .send({
      "username": "bl0",
      "name": "Roberto",
      "age": 30,
      "weight": 75.4
    })

    const userId = user.body.user.id

    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('user_id', userId)
      .send({
        "title": "Sanduíche",
        "description": "Sanduíche de pão integral com atum e salada de alface e tomate",
        "date": "08/10/2023",
        "time": "16:00",
        "isInDiet": 1
      })
    
    const mealId = createMealResponse.body.meal.id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .expect(202)
  })

  test('the user can visualize one selected meal', async () => {
    const user = await request(app.server)
    .post('/users')
    .send({
      "username": "blr",
      "name": "Roberto",
      "age": 30,
      "weight": 75.4
    })

    const userId = user.body.user.id
    const createMealResponse = await request(app.server)
      .post('/meals')
      .set('user_id', userId)
      .send({
        "title": "Sanduíche",
        "description": "Sanduíche de pão integral com atum e salada de alface e tomate",
        "date": "08/10/2023",
        "time": "16:00",
        "isInDiet": 1
      })
    
    const mealId = createMealResponse.body.meal.id
    const getMealResponse = await request(app.server)
    .get(`/meals/${mealId}`)
    .expect(200)

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        title: "Sanduíche",
        description: "Sanduíche de pão integral com atum e salada de alface e tomate",
        date: "08/10/2023",
        time: "16:00",
        isInDiet: 1
      })
    )
  })

  test('the user can list all their meals', async () => {
    const user = await request(app.server)
    .post('/users')
    .send({
      "username": "blq",
      "name": "Roberto",
      "age": 30,
      "weight": 75.4
    })

    const userId = user.body.user.id

    await request(app.server)
      .post('/meals')
      .set('user_id', userId)
      .send({
        "title": "Sanduíche",
        "description": "Sanduíche de pão integral com atum e salada de alface e tomate",
        "date": "08/10/2023",
        "time": "16:00",
        "isInDiet": 1
      })
      .expect(201)
    
    await request(app.server)
      .post('/meals')
      .set('user_id', userId)
      .send({
        "title": "Sanduíche 2",
        "description": "Sanduíche de pão integral com atum e salada de alface e tomate",
        "date": "08/10/2023",
        "time": "16:00",
        "isInDiet": 1
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('user_id', userId)
      .send({
        "title": "Sanduíche 3",
        "description": "Sanduíche de pão integral com atum e salada de alface e tomate",
        "date": "08/10/2023",
        "time": "16:00",
        "isInDiet": 1
      })
      .expect(201)

    const otherUserId = randomUUID()

    await request(app.server)
      .post('/meals')
      .set('user_id', otherUserId)
      .send({
        "title": "Sanduíche 4",
        "description": "Sanduíche de pão integral com atum e salada de alface e tomate",
        "date": "08/10/2023",
        "time": "16:00",
        "isInDiet": 1
      })
      .expect(201)

    await request(app.server)
      .get(`/meals/user/${userId}`)
      .expect(200)

  })

  test('the user can only edit their meals', async () => {
    const user = await request(app.server)
    .post('/users')
    .send({
      "username": "blq",
      "name": "Roberto",
      "age": 30,
      "weight": 75.4
    })

    const userId = user.body.user.id

    const userMeal = await request(app.server)
      .post('/meals')
      .set('user_id', userId)
      .send({
        "title": "Sanduíche 3",
        "description": "Sanduíche de pão integral com atum e salada de alface e tomate",
        "date": "08/10/2023",
        "time": "16:00",
        "isInDiet": 1
      })
      .expect(201)

    const otherUserId = randomUUID()

    const otherUserMeal = await request(app.server)
      .post('/meals')
      .set('user_id', otherUserId)
      .send({
        "title": "Sanduíche 4",
        "description": "Sanduíche de pão integral com atum e salada de alface e tomate",
        "date": "08/10/2023",
        "time": "16:00",
        "isInDiet": 1
      })
      .expect(201)
      
    const mealId = userMeal.body.meal.id
    const otherMealId = otherUserMeal.body.meal.id

    await request(app.server)
      .put(`/meals/${userId}/meal/${mealId}`)
      .send({
        "title": "Sanduíche 33",
        "description": "Sanduíche de pão e tomate",
        "date": "08/10/2023",
        "time": "18:00",
        "isInDiet": 1
      })
      .expect(201)
      
    await request(app.server)
      .put(`/meals/${userId}/meal/${otherMealId}`)
      .send({
        "title": "Sanduíche 33",
        "description": "Sanduíche de pão e tomate",
        "date": "08/10/2023",
        "time": "18:00",
        "isInDiet": 1
      })
      .expect(500)

  })
})