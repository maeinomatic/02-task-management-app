import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'OpenAPI spec for the Task Management app'
    }
  },
  // Scan these files for JSDoc comments with swagger definitions
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
