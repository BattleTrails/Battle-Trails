export default function (plop) {
    // Generador de componentes
    plop.setGenerator("component", {
        description: "Create new component",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "What is this component's name?",
            },
        ],
        actions: [
            {
                type: "add",
                path: "src/components/{{pascalCase name}}/{{pascalCase name}}.tsx",
                templateFile: "templates/Component.tsx.hbs",
            },
            {
                type: "add",
                path: "src/components/{{pascalCase name}}/{{pascalCase name}}.module.css",
                templateFile: "templates/styles.module.css.hbs",
            },
            {
                type: "add",
                path: "src/components/{{pascalCase name}}/index.ts",
                templateFile: "templates/index.ts.hbs",
            },
        ],
    });

    // Generador de páginas
    plop.setGenerator("page", {
        description: "Create new page",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "What is this page's name?",
            },
        ],
        actions: [
            {
                type: "add",
                path: "src/pages/{{pascalCase name}}Page.tsx",
                templateFile: "templates/Page.tsx.hbs",
            },
        ],
    });
}
