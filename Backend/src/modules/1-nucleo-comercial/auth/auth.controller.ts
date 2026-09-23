import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolUsuario } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

function requireAdmin(user: { rol: RolUsuario }) {
  if (user.rol !== RolUsuario.ADMINISTRADOR) {
    throw new ForbiddenException('Solo los administradores pueden realizar esta accion');
  }
}

@ApiTags('Auth / Usuarios')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesion - devuelve JWT' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales invalidas' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario (solo ADMINISTRADOR)' })
  @ApiResponse({ status: 201, description: 'Usuario creado' })
  @ApiResponse({ status: 403, description: 'Solo administradores pueden registrar usuarios' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  register(@Body() dto: RegisterDto, @Request() req: { user: { rol: RolUsuario } }) {
    requireAdmin(req.user);
    return this.authService.register(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener usuario autenticado actual' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  me(@Request() req: { user: { id: string } }) {
    return this.authService.validateUser(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios (solo ADMINISTRADOR)' })
  @ApiQuery({ name: 'rol', required: false, enum: RolUsuario })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  findAll(@Query('rol') rol: string | undefined, @Request() req: { user: { rol: RolUsuario } }) {
    requireAdmin(req.user);
    return this.authService.findAll(rol);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.authService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario (solo ADMINISTRADOR)' })
  @ApiResponse({ status: 403, description: 'Solo administradores' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto, @Request() req: { user: { rol: RolUsuario } }) {
    requireAdmin(req.user);
    return this.authService.update(id, dto);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Cambiar contrasena (propio usuario o ADMINISTRADOR)' })
  @ApiResponse({ status: 403, description: 'Solo puedes cambiar tu propia contrasena' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'Contrasena actual incorrecta' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @Request() req: { user: { id: string; rol: RolUsuario } },
  ) {
    return this.authService.changePassword(id, dto.currentPassword, dto.newPassword, req.user.id, req.user.rol);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario (solo ADMINISTRADOR)' })
  @ApiResponse({ status: 403, description: 'Solo administradores' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Request() req: { user: { rol: RolUsuario } }) {
    requireAdmin(req.user);
    return this.authService.remove(id);
  }
}
