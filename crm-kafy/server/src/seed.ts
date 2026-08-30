import { createSeedData } from "../../src/data/mock-data.js";
import { CrmRepository } from "./crm-repository.js";
import { closeDatabase, migrate, pool } from "./db.js";

async function seed(): Promise<void> {
  await migrate();
  const repository = new CrmRepository(pool);
  await repository.replaceAll(createSeedData(), "seed");
  console.log("Database seeded");
}

seed()
  .catch((error) => {
    console.error("Database seed failed", error);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
