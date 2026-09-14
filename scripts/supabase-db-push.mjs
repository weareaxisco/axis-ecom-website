import { spawnSync } from "node:child_process";

const projectRef = "ttqrsgvapqydtdduosjh";
const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error(
    "SUPABASE_DB_PASSWORD is not set. Open a new terminal after running setx, then retry.",
  );
  process.exit(1);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(
  command,
  [
    "supabase",
    "db",
    "push",
    "--project-ref",
    projectRef,
    "--password",
    password,
  ],
  { stdio: "inherit", shell: process.platform === "win32" },
);

if (result.error) {
  console.error(`Unable to start Supabase CLI: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
