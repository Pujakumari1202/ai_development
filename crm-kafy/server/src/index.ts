import { createApp } from "./app.js";
import { config } from "./config.js";
import { CrmRepository } from "./crm-repository.js";
import { migrate, pool } from "./db.js";

async function start(): Promise<void> {
  await migrate();
  const repository = new CrmRepository(pool);
  const app = createApp(repository);
  app.listen(config.PORT, () => {
    console.log(`CRM API listening on http://localhost:${config.PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start CRM API", error);
  process.exitCode = 1;
});
