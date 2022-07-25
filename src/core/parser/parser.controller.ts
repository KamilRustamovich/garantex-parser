import { ParserService } from './parser.service';
import { Controller, Get } from "@nestjs/common";

@Controller('parser')
export class ParserController {
    constructor(private readonly parserService: ParserService) {}

    @Get()
    async parse() {
        return await this.parserService.parse()
    }
}