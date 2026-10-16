import { Body, Controller, HttpCode, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import type { Request } from "express";

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Post('login')
    @HttpCode(200)
    login(@Body() dto: LoginDto, @Req() req: Request) {
        return this.auth.login(dto, req.ip);
    }
}