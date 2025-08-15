import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import { sequelize } from './config/sequelize';
import { authRouter } from './routes/auth.routes';
import { projectsRouter } from './routes/projects.routes';
import { githubRouter } from './routes/github.routes';

export const app = express();
app.use(express.json());


app.use('/auth', authRouter);
app.use('/', projectsRouter);
app.use('/', githubRouter);


app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err?.status || err?.statusCode || 500;

  console.error('[ERROR]', {
    method: req.method,
    url: req.originalUrl,
    message: err?.message,
    stack: err?.stack,
    params: req.params,
    query: req.query,
    body: req.body,
  });

  const body: any = { message: err?.message || 'Internal server error' };
  if (process.env.NODE_ENV === 'development') {
    body.stack = err?.stack;
  }
  res.status(status).json(body);
});


process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
});


export { sequelize };
