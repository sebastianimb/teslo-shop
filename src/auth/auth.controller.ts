import { GetUser, RawHeaders, Auth, RoleProtected } from './decorators/index';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto/index';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser('id') id: string) {
    return this.authService.checkAuthStatus(id);
  }

  /* @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(@Req() request: Express.Request) {
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user: request.user,
    };
  } */
  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    //@Headers() headers: IncomingHttpHeaders
  ) {
    return {
      user,
      userEmail,
      rawHeaders,
    };
  }

  /*   @SetMetadata('roles', ['admin', 'super-user']) */
  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRoute2(@GetUser() user: User) {
    return {
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  testingPrivateRoute3(@GetUser() user: User) {
    return {
      user,
    };
  }
}
