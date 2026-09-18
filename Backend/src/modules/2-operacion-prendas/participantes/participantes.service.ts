import { Injectable, NotFoundException, GoneException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { GuardarFichaEnlaceDto } from './dto/guardar-ficha-enlace.dto';
import * as crypto from 'crypto';

@Injectable()
export class ParticipantesService {
  constructor(private readonly prisma: PrismaService) {}

  async crearEnGrupo(grupoId: string, dto: CreateParticipanteDto) {
    const token = `tok_${crypto.randomBytes(8).toString('hex')}`;
    const expira = new Date();
    expira.setDate(expira.getDate() + 7);

    return this.prisma.participante.create({
      data: {
        grupoId,
        nombrePersona: dto.nombrePersona,
        enlaceToken: token,
        enlaceExpiraEn: expira,
      },
    });
  }

  async listarPorGrupo(grupoId: string) {
    return this.prisma.participante.findMany({
      where: { grupoId },
      include: {
        prendas: {
          include: {
            personalizaciones: true,
            excepciones: true,
          },
        },
      },
    });
  }

  async obtenerPorId(id: string) {
    const p = await this.prisma.participante.findUnique({
      where: { id },
      include: {
        prendas: {
          include: {
            personalizaciones: true,
            excepciones: true,
          },
        },
      },
    });
    if (!p) throw new NotFoundException('Participante no encontrado.');
    return p;
  }

  async obtenerPorEnlaceToken(token: string) {
    const p = await this.prisma.participante.findUnique({
      where: { enlaceToken: token },
      include: {
        grupo: true,
        prendas: {
          include: {
            personalizaciones: true,
            excepciones: true,
          },
        },
      },
    });

    if (!p) throw new NotFoundException('Enlace no encontrado.');
    if (p.enlaceRevocado) throw new GoneException('Este enlace ha sido revocado.');
    if (p.enlaceExpiraEn && new Date() > p.enlaceExpiraEn) {
      throw new GoneException('Este enlace ha expirado.');
    }

    return p;
  }

  async guardarFichaEnlace(token: string, dto: GuardarFichaEnlaceDto) {
    const p = await this.obtenerPorEnlaceToken(token);

    // Actualizar prendas y registrar fecha
    for (const item of dto.prendas) {
      await this.prisma.prenda.update({
        where: { id: item.prendaId },
        data: {
          tallaId: item.tallaId,
          numero: item.numero,
          genero: item.genero as any,
          nombreEnPrenda: item.nombreEnPrenda,
        },
      });

      if (item.personalizaciones?.length) {
        for (const pers of item.personalizaciones) {
          await this.prisma.personalizacion.upsert({
            where: {
              prendaId_ubicacionId: {
                prendaId: item.prendaId,
                ubicacionId: pers.ubicacionId,
              },
            },
            create: {
              prendaId: item.prendaId,
              ubicacionId: pers.ubicacionId,
              contenido: pers.contenido,
            },
            update: {
              contenido: pers.contenido,
            },
          });
        }
      }
    }

    return this.prisma.participante.update({
      where: { id: p.id },
      data: {
        estado: 'REGISTRADO',
        registradoEn: new Date(),
      },
    });
  }

  async confirmarPorEnlace(token: string) {
    const p = await this.obtenerPorEnlaceToken(token);
    return this.prisma.participante.update({
      where: { id: p.id },
      data: {
        estado: 'CONFIRMADO',
        confirmadoEn: new Date(),
      },
    });
  }

  async confirmarManual(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.participante.update({
      where: { id },
      data: {
        estado: 'CONFIRMADO',
        confirmadoEn: new Date(),
      },
    });
  }

  async revocarEnlace(id: string) {
    await this.obtenerPorId(id);
    return this.prisma.participante.update({
      where: { id },
      data: { enlaceRevocado: true },
    });
  }

  async regenerarEnlace(id: string) {
    await this.obtenerPorId(id);
    const token = `tok_${crypto.randomBytes(8).toString('hex')}`;
    const expira = new Date();
    expira.setDate(expira.getDate() + 7);

    return this.prisma.participante.update({
      where: { id },
      data: {
        enlaceToken: token,
        enlaceExpiraEn: expira,
        enlaceRevocado: false,
      },
    });
  }
}
