import { Injectable, UnauthorizedException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.activo || !user.password) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const payload = { sub: user.id, email: user.email, rol: user.rol };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('El email ya esta registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.usuario.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        nombre: dto.nombre,
        rol: dto.rol,
        activo: dto.activo ?? true,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        creadoEn: true,
      },
    });
  }

  async findAll(rol?: string) {
    return this.prisma.usuario.findMany({
      where: rol ? { rol: rol as RolUsuario } : undefined,
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        creadoEn: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        creadoEn: true,
        actualizadoEn: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado: ' + id);
    }

    return user;
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    await this.findOne(id);

    return this.prisma.usuario.update({
      where: { id },
      data: {
        ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
        ...(dto.rol !== undefined ? { rol: dto.rol } : {}),
        ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        creadoEn: true,
        actualizadoEn: true,
      },
    });
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
    callerId: string,
    callerRol: RolUsuario,
  ) {
    if (id !== callerId && callerRol !== RolUsuario.ADMINISTRADOR) {
      throw new ForbiddenException('Solo puedes cambiar tu propia contrasena');
    }

    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado: ' + id);
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Contrasena actual incorrecta');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.usuario.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Contrasena actualizada correctamente' };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.usuario.delete({ where: { id } });
    return { message: 'Usuario eliminado correctamente' };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nombre: true, rol: true, activo: true },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no valido');
    }

    return user;
  }

  async getSystemUserId(): Promise<string> {
    const user = await this.prisma.usuario.findFirst({
      where: { email: 'sistema@sublitex.com' },
    });
    if (!user) {
      throw new Error('Usuario sistema no existe. Ejecuta el seed antes de iniciar el servidor.');
    }
    return user.id;
  }
}
