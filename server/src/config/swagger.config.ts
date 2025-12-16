import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { PaginationResponse } from '@/adapter/inbound/dto/common/pagination.dto';
import { GLOBAL_PREFIX } from '@/constants';

export function setSwagger(app: NestExpressApplication) {
  const API_DOCS_URL = {
    OPENAPI_JSON: `${GLOBAL_PREFIX}/openapi.json`,
    OPENAPI_YAML: `${GLOBAL_PREFIX}/openapi.yaml`,
    SWAGGER: `${GLOBAL_PREFIX}/swagger`,
  };

  const config = new DocumentBuilder()
    .setTitle('BE Main Module API')
    .setDescription('Backend Main Module API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [],
    extraModels: [PaginationResponse],
  });

  const customOptions = {
    jsonDocumentUrl: API_DOCS_URL.OPENAPI_JSON,
    yamlDocumentUrl: API_DOCS_URL.OPENAPI_YAML,
    swaggerOptions: {
      layout: 'BaseLayout',
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  };

  SwaggerModule.setup(API_DOCS_URL.SWAGGER, app, document, customOptions);
}
