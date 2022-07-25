import { ParserService } from './parser.service';
import { Module } from '@nestjs/common';
import { ParserController } from './parser.controller';

@Module({
	imports: [],
	controllers: [ParserController],
	providers: [ParserService],
})
export class ParserModule {}


