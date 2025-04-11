export default function (plop) {
    plop.setGenerator("component", {
        description: "Create a component",
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
}