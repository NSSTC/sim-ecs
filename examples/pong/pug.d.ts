declare module '*.pug' {
    type TPugTemplateData = { [key: string]: any };
    const template: (data?: TPugTemplateData) => string;
    export = template;
}
