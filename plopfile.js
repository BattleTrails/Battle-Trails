import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (plop) {
    const componentsDir = path.resolve(__dirname, "src", "components");
    const folders = fs.readdirSync(componentsDir).filter((file) => {
        const fullPath = path.join(componentsDir, file);
        return fs.statSync(fullPath).isDirectory();
    });

    plop.setGenerator("Component", {
        description: "Crear nuevo componente",
        prompts: [
            {
                type: "list",
                name: "folder",
                message: "¿En qué carpeta quieres crear el componente?",
                choices: folders,
            },
            {
                type: "input",
                name: "name",
                message: "¿Cómo se llama el componente?",
            },
        ],
        actions: [
            {
                type: "add",
                path: "src/components/{{folder}}/{{kebabCase name}}/{{kebabCase name}}.tsx",
                templateFile: "templates/Component.tsx.hbs",
            },
            {
                type: "add",
                path: "src/components/{{folder}}/{{kebabCase name}}/{{kebabCase name}}.module.css",
                templateFile: "templates/styles.module.css.hbs",
            },
            {
                type: "add",
                path: "src/components/{{folder}}/{{kebabCase name}}/index.ts",
                templateFile: "templates/index.ts.hbs",
            },
        ],
    });

    plop.setGenerator("Page", {
        description: "Crear nueva página",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "¿Cómo se llama la página?",
            },
        ],
        actions: [
            {
                type: "add",
                path: "src/pages/{{kebabCase name}}-page.tsx",
                templateFile: "templates/Page.tsx.hbs",
            },
        ],
    });
}
