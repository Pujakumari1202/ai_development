import { closeDatabase, migrate } from "./db.js";

migrate()
  .then(() => {
    console.log("Database migrations applied");
  })
  .catch((error) => {
    console.error("Database migration failed", error);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
