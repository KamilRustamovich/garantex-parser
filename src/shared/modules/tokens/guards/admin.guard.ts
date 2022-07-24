import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class AdminGuard extends AuthGuard('admin') {
    getRequest(context: ExecutionContext): Request {
        return context.switchToHttp().getRequest()
    }
}
