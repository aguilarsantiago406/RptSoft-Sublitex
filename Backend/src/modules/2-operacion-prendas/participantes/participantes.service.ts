import { Injectable, NotFoundException, GoneException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { GuardarFichaEnlaceDto } from './dto/guardar-ficha-enlace.dto';
import * as crypto from 'crypto';

@Injectable()
export class ParticipantesService {
  constructor(private readonly prisma: PrismaService) {}

  async crearEnGrupo(grupoId: string, dto: CreateParticipanteDto) {
    const grupo = await this.prisma.grupo?.findUnique?.({ where: { id: grupoId } });
    if (grupo?.pedidoId) {
      const bloqueLista = await this.prisma.bloquePedido?.findFirst?.({
        where: { pedidoId: grupo.pedidoId, tipo: 'LISTA', estado: 'CERRADO' },
      });
      if (bloqueLista) {
        throw new BadRequestException('La lista de prendas de este pedido ha sido CERRADA para producción.');
      }
    }

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
            color: true,
            talla: true,
            tipoProducto: true,
            personalizaciones: {
              include: {
                ubicacion: true,
              },
            },
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
        grupo: true,
        prendas: {
          include: {
            color: true,
            talla: true,
            tipoProducto: true,
            personalizaciones: {
              include: {
                ubicacion: true,
              },
            },
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
            color: true,
            talla: true,
            tipoProducto: true,
            personalizaciones: {
              include: {
                ubicacion: true,
              },
            },
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

    // R-D03: Si ya está confirmado, la ficha se encuentra bloqueada
    if (p.estado === 'CONFIRMADO') {
      throw new BadRequestException('El participante ya ha confirmado sus datos y la ficha está bloqueada.');
    }

    // R-H03: Si el bloque LISTA está cerrado, no se admiten modificaciones
    if (p.grupo?.pedidoId) {
      const bloqueLista = await this.prisma.bloquePedido?.findFirst?.({
        where: { pedidoId: p.grupo.pedidoId, tipo: 'LISTA', estado: 'CERRADO' },
      });
      if (bloqueLista) {
        throw new BadRequestException('La lista de prendas de este pedido ha sido CERRADA para producción.');
      }
    }

    // 🔒 Seguridad BOLA: Validar que cada prenda pertenezca estrictamente a este participante
    for (const item of dto.prendas) {
      const prendaValida = p.prendas.find((pr) => pr.id === item.prendaId);
      if (!prendaValida) {
        throw new BadRequestException(`La prenda con ID ${item.prendaId} no pertenece a este participante.`);
      }
    }

    // Ejecutar todas las mutaciones en una transacción atómica única
    const executeInTransaction = async (fn: (tx: any) => Promise<any>) => {
      if (typeof this.prisma.$transaction === 'function') {
        return this.prisma.$transaction(fn);
      }
      return fn(this.prisma);
    };

    return executeInTransaction(async (tx) => {
      for (const item of dto.prendas) {
        // R-K05: Validar que el color pertenezca al pedido si fue seleccionado
        if (item.colorId && p.grupo?.pedidoId) {
          const colorValido = await tx.colorPedido?.findFirst?.({
            where: { id: item.colorId, pedidoId: p.grupo.pedidoId },
          });
          if (!colorValido) {
            throw new BadRequestException('El color indicado no pertenece a la paleta autorizada de este pedido.');
          }
        }

        await tx.prenda.update({
          where: { id: item.prendaId },
          data: {
            tallaId: item.tallaId,
            numero: item.numero,
            genero: item.genero as any,
            nombreEnPrenda: item.nombreEnPrenda,
            colorId: item.colorId,
          },
        });

        if (item.personalizaciones?.length) {
          for (const pers of item.personalizaciones) {
            await tx.personalizacion.upsert({
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

      return tx.participante.update({
        where: { id: p.id },
        data: {
          estado: 'REGISTRADO',
          registradoEn: new Date(),
        },
      });
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

  async eliminar(id: string) {
    const p = await this.prisma.participante.findUnique({
      where: { id },
      include: { grupo: true },
    });
    if (!p) throw new NotFoundException('Participante no encontrado.');

    // R-H03: Validar que el bloque LISTA esté abierto
    if (p.grupo?.pedidoId) {
      const bloqueLista = await this.prisma.bloquePedido?.findFirst?.({
        where: { pedidoId: p.grupo.pedidoId, tipo: 'LISTA', estado: 'CERRADO' },
      });
      if (bloqueLista) {
        throw new BadRequestException('El bloque LISTA está CERRADO. No se pueden eliminar participantes.');
      }
    }

    await this.prisma.participante.delete({ where: { id } });
    return { mensaje: 'Participante eliminado correctamente' };
  }

  async obtenerEnlacesWhatsApp(grupoId: string, soloPendientes?: boolean) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: grupoId },
      include: {
        pedido: {
          select: {
            id: true,
            codigo: true,
          },
        },
      },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID ${grupoId} no encontrado.`);
    }

    const where: any = { grupoId };
    if (soloPendientes) {
      where.estado = 'PENDIENTE';
    }

    const participantes = await this.prisma.participante.findMany({
      where,
      orderBy: { nombrePersona: 'asc' },
    });

    const baseUrl = (process.env.FRONTEND_URL || process.env.APP_URL || 'https://app.sublitex.com').replace(/\/+$/, '');
    const ahora = new Date();

    const items = participantes.map((p) => {
      const url = `${baseUrl}/ficha/${p.enlaceToken}`;
      const expirado = p.enlaceExpiraEn ? new Date(p.enlaceExpiraEn) < ahora : false;
      return {
        id: p.id,
        nombrePersona: p.nombrePersona,
        estado: p.estado,
        enlaceToken: p.enlaceToken,
        url,
        expirado,
        enlaceRevocado: p.enlaceRevocado,
        valido: !p.enlaceRevocado && !expirado,
      };
    });

    let mensajeGrupal = '';
    const pedidoCodigo = grupo.pedido?.codigo || 'PEDIDO';
    const grupoNombre = grupo.nombre;

    if (items.length === 0) {
      mensajeGrupal = soloPendientes
        ? `✅ ¡Excelente! No hay participantes pendientes de registro en el grupo "${grupoNombre}" (${pedidoCodigo}).`
        : `No hay participantes registrados en el grupo "${grupoNombre}".`;
    } else {
      const encabezado = soloPendientes
        ? `📢 *Recordatorio: Registro de Tallas y Nombres — ${pedidoCodigo} (${grupoNombre})*\nPor favor, los siguientes integrantes ingresen a su enlace personal para completar su ficha:`
        : `📢 *Registro de Tallas y Nombres — ${pedidoCodigo} (${grupoNombre})*\nPor favor, cada participante ingrese a su enlace personal para llenar su ficha:`;

      const lineas = items.map((p) => `👉 *${p.nombrePersona}*: ${p.url}`).join('\n');
      const pie = `\n\n⚠️ _Los enlaces son personales e intransferibles._`;

      mensajeGrupal = `${encabezado}\n\n${lineas}${pie}`;
    }

    return {
      pedidoId: grupo.pedidoId,
      pedidoCodigo,
      grupoId: grupo.id,
      grupoNombre,
      total: items.length,
      soloPendientes: !!soloPendientes,
      mensajeGrupal,
      participantes: items,
    };
  }
}

