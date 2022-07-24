import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config'
import { Logardian } from 'logardian';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const logger = new Logardian();

const DEFAULT_APP_HORT = 'localhost'
const DEFAULT_APP_PORT = 3000

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { logger });

	const configService = app.get(ConfigService)

	app.useGlobalPipes(new ValidationPipe({}))

	const port = configService.get('PORT') || DEFAULT_APP_PORT
    const hostname = configService.get('HOST') || DEFAULT_APP_HORT

	const logardianLabels = configService.get('LOGARDIAN_LABELS') || '*'
    const logardianTrace = configService.get('LOGARDIAN_TRACE') === 'true'
    const logardianJson = configService.get('LOGARDIAN_JSON') === 'true'

	logger.configure({
		labels: logardianLabels.split(','),
		trace: logardianTrace,
		json: logardianJson,
	})

	await app.listen(port, hostname, () =>
        logger.log(`Server running at http://${hostname}:${port}/`),
    )
}
bootstrap();
