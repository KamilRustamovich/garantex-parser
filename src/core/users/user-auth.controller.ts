import { 
    Body, 
    Controller, 
    Post, 
    UsePipes, 
    ValidationPipe
} from "@nestjs/common";
import { 
    ChangePasswordDTO, 
    RefreshTokenDTO, 
    ResendEmailDTO, 
    SignInDTO, 
    SignUpDTO, 
    VerifyEmailDTO 
} from "./dtos";
import { AuthorizedUserResponse } from "./interfaces/authorized-user-response.interface";
import { UsersAuthService } from "./users-auth.service";
import { ConfirmRestoredPasswordDTO } from './dtos/restore-password.dto';


@Controller('user')
export class UserAuthController {
    constructor(private readonly _usersAuthService: UsersAuthService,) {}

    @Post('signIn')
    async signIn(
        @Body() input: SignInDTO,
    ): Promise<AuthorizedUserResponse> {
        return await this._usersAuthService.signIn(input)
    }

    @Post('signUp')
    async signUp(
        @Body() input: SignUpDTO
    ): Promise<boolean> {
        return await this._usersAuthService.signUp(input)
    }

    @Post('refreshToken')
    async refreshToken(
        @Body() input: RefreshTokenDTO,
    ): Promise<AuthorizedUserResponse> {
        return await this._usersAuthService.refreshToken(input)
    }

    @Post('verifyEmail')
    async verifyEmail(
        @Body() input: VerifyEmailDTO,
    ): Promise<AuthorizedUserResponse> {
        return await this._usersAuthService.verifyEmail(input)
    }

    @Post('resendEmail')
    async resendEmail(
        @Body() input: ResendEmailDTO,
    ): Promise<boolean> {
        return await this._usersAuthService.resendEmail(input)
    }

    @Post('restorePassword')
    async restorePassword(
        @Body() input: ResendEmailDTO,
    ): Promise<string> {
        return await this._usersAuthService.restorePassword(input)
    }

    @Post('confirmRestoredPassword')
    async confirmRestoredPassword(
        @Body() input: ConfirmRestoredPasswordDTO,
    ): Promise<boolean> {
        return await this._usersAuthService.confirmRestoredPassword(input)
    }

    @Post('changePassword')
    async changePassword(
        @Body() input: ChangePasswordDTO,
    ): Promise<boolean> {
        return await this._usersAuthService.changePassword(input)
    }
}

