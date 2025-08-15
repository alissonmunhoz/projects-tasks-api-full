import { app, sequelize } from './app.ts';

const PORT = process.env.PORT || 3000;

(async () => {
  await sequelize.sync(); 
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
})();
