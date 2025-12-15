import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.appService.register(body);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.appService.login(body);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return this.appService.getProfile(req.user);
  }
}
