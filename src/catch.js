import { Logger } from "./logger.js";

process.on("SIGINT", () => {
    Logger.warn("Caught interrupt signal - shutting down");
    process.exit();
});

process.on("SIGTERM", () => {
    Logger.warn("Caught termination signal - shutting down");
    process.exit();
});

// process.on("SIGKILL", () => {
//     Logger.warn("Caught kill signal - shutting down");
//     process.exit();
// });
