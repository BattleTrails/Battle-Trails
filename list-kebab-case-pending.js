const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve("src");
const IGNORED_DIRS = ["hooks", "assets"];

const toKebabCase = (str) =>
    str
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .toLowerCase();

const renameNames = new Set();

const walk = (dir) => {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
        if (IGNORED_DIRS.includes(entry)) continue;

        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        const kebab = toKebabCase(entry);

        if (entry !== kebab) {
            renameNames.add(entry + " → " + kebab);
        }

        if (stat.isDirectory()) {
            walk(fullPath);
        }
    }
};

const main = () => {
    walk(projectRoot);

    if (renameNames.size === 0) {
        console.log("✅ Todo ya está en kebab-case.");
        return;
    }

    console.log("📝 Archivos o carpetas a renombrar manualmente (usa Shift+F6 en WebStorm):\n");

    [...renameNames].sort().forEach((name) => {
        console.log("🔁", name);
    });

    console.log("\n✅ Renómbralos uno a uno para que WebStorm actualice los imports.");
};

main();
