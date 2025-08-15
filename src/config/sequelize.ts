import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Repo } from '../models/Repo';

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'db',
  port: +(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'projects_db',
  models: [User, Project, Task, Repo],
  logging: false,
});
