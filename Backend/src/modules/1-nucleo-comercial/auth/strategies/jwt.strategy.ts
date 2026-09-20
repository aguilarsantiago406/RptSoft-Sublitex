import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; email: string; rol: string }) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, nombre: true, rol: true, activo: true },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    return user;
  }
}
