// Copy the published dataset into public/data so it is downloadable from the site.
import { cpSync, mkdirSync } from "node:fs";
mkdirSync("public/data", { recursive: true });
cpSync("../data/public", "public/data", { recursive: true });
console.log("copied ../data/public -> public/data");
