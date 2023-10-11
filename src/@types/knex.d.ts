import {Knex} from "knex";

declare module 'knex/types/tables'{
  export interface Tables {
    users: {
      id: string;
      username: string;
      name: string;
      age: number;
      weight: number;
      created_at: string;
    },
    meals: {
      userId: string;
      id: string;
      title: string;
      description: string;
      date: string;
      time: string;
      isInDiet: number;
      created_at: string;
    },
    'user-meals': {
      id: string;
      userId: string;
      mealId: string;
    }
  }
}


