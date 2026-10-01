import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreatePrendaDto } from './dto/create-prenda.dto';
import { UpdateFichaMinimaDto } from './dto/update-ficha-minima.dto';
import { CargaMasivaFilaDto } from './dto/carga-masiva.dto';

@Injectable()
export class PrendasService {
  constructor(private readonly prisma: PrismaService) { }

  private async validarListaAbiertaPorPedidoId(pedidoId?: string) {
    if (!pedidoId) return;
    const bloqueLista = await this.prisma.bloquePedido?.findFirst?.({
      where: { pedidoId, tipo: 'LISTA', estado: 'CERRADO' },
    });
    if (bloqueLista) {
      throw new BadRequestException('El bloque LISTA de este pedido está CERRADO. No se permiten modificaciones en las prendas.');
    }
  }

  private async obtenerPrecioBase(tipoPrenda: string): Promise<number> {
    if (tipoPrenda !== 'VENTA') return 0.0;
    try {
      const tarifa = await this.prisma.tarifa?.findFirst?.({
        where: { tipo: 'PRODUCTO', activo: true },
        orderBy: { vigenteDesde: 'desc' },
      });
      return tarifa ? Number(tarifa.valor) : 55.0;
    } catch {
      return 55.0;
    }
  }

  async crear(dto: CreatePrendaDto, autor?: { id?: string; rol?: any }) {
    let pedidoId: string | undefined = undefined;
    if (dto.grupoId) {
      const grupo = await this.prisma.grupo?.findUnique?.({ where: { id: dto.grupoId } });
      await this.validarListaAbiertaPorPedidoId(grupo?.pedidoId);
      if (grupo?.pedidoId) pedidoId = grupo.pedidoId;

      if (dto.colorId && grupo?.pedidoId) {
        const colorValido = await this.prisma.colorPedido?.findFirst?.({
          where: { id: dto.colorId, pedidoId: grupo.pedidoId },
        });
        if (!colorValido) {
          throw new BadRequestException('El color indicado no pertenece a la paleta autorizada de este pedido.');
        }
      }
    }

    const prenda = await this.prisma.prenda.create({
      data: {
        participanteId: dto.participanteId,
        grupoId: dto.grupoId,
        tipoProductoId: dto.tipoProductoId,
        tallaId: dto.tallaId,
        tallaShortId: dto.tallaShortId ?? null,
        numero: dto.numero,
        genero: (dto.genero as any) || 'SIN_ESPECIFICAR',
        tipoPrenda: (dto.tipoPrenda as any) || 'VENTA',
        colorId: dto.colorId,
        nombreEnPrenda: dto.nombreEnPrenda,
        esArquero: dto.esArquero ?? false,
      },
    });

    if (pedidoId) {
      await this.prisma.registroCambio?.create?.({
        data: {
          pedidoId,
          entidad: 'Prenda',
          entidadId: prenda.id,
          campo: 'creacion',
          valorAnterior: null,
          valorNuevo: prenda.tipoPrenda || 'VENTA',
          origen: 'USUARIO',
          autorUsuarioId: autor?.id ?? null,
          autorRol: autor?.rol ?? null,
        },
      });
    }

    const precioCalculado = await this.obtenerPrecioBase(prenda.tipoPrenda);
    return { ...prenda, precioCalculado };
  }

  async actualizarFichaMinima(id: string, dto: UpdateFichaMinimaDto, autor?: { id?: string; rol?: any }) {
    const prendaExiste = await this.prisma.prenda.findUnique({
      where: { id },
      include: { grupo: true, participante: true },
    });
    if (!prendaExiste) throw new NotFoundException('Prenda no encontrada.');

    // R-H03: Candado de lista cerrada
    await this.validarListaAbiertaPorPedidoId(prendaExiste.grupo?.pedidoId);

    // R-K05: Validación de color dentro de la paleta oficial
    if (dto.colorId && prendaExiste.grupo?.pedidoId) {
      const colorValido = await this.prisma.colorPedido?.findFirst?.({
        where: { id: dto.colorId, pedidoId: prendaExiste.grupo.pedidoId },
      });
      if (!colorValido) {
        throw new BadRequestException('El color indicado no pertenece a la paleta autorizada de este pedido.');
      }
    }

    if (prendaExiste.grupo?.pedidoId) {
      const camposAuditables: Array<keyof UpdateFichaMinimaDto> = ['tallaId', 'tallaShortId', 'numero', 'genero', 'nombreEnPrenda', 'colorId', 'tipoPrenda', 'esArquero'];
      for (const campo of camposAuditables) {
        const valorNuevo = dto[campo];
        const valorAnterior = (prendaExiste as any)[campo];
        if (valorNuevo !== undefined && valorNuevo !== valorAnterior) {
          await this.prisma.registroCambio?.create?.({
            data: {
              pedidoId: prendaExiste.grupo.pedidoId,
              entidad: 'Prenda',
              entidadId: prendaExiste.id,
              campo: String(campo),
              valorAnterior: valorAnterior !== null && valorAnterior !== undefined ? String(valorAnterior) : null,
              valorNuevo: valorNuevo !== null && valorNuevo !== undefined ? String(valorNuevo) : null,
              origen: 'USUARIO',
              autorUsuarioId: autor?.id ?? null,
              autorRol: autor?.rol ?? null,
            },
          });
        }
      }
    }

    const prenda = await this.prisma.prenda.update({
      where: { id },
      data: {
        tallaId: dto.tallaId,
        tallaShortId: dto.tallaShortId !== undefined ? (dto.tallaShortId || null) : undefined,
        numero: dto.numero,
        genero: dto.genero as any,
        nombreEnPrenda: dto.nombreEnPrenda,
        colorId: dto.colorId,
        ...(dto.tipoPrenda !== undefined ? { tipoPrenda: dto.tipoPrenda as any } : {}),
        ...(dto.esArquero !== undefined ? { esArquero: dto.esArquero } : {}),
      },
    });

    const precioCalculado = await this.obtenerPrecioBase(prenda.tipoPrenda);
    return { ...prenda, precioCalculado };
  }

  async eliminar(id: string, autor?: { id?: string; rol?: any }) {
    const prendaExiste = await this.prisma.prenda.findUnique({
      where: { id },
      include: { grupo: true },
    });
    if (!prendaExiste) throw new NotFoundException('Prenda no encontrada.');

    await this.validarListaAbiertaPorPedidoId(prendaExiste.grupo?.pedidoId);

    if (prendaExiste.grupo?.pedidoId) {
      await this.prisma.registroCambio?.create?.({
        data: {
          pedidoId: prendaExiste.grupo.pedidoId,
          entidad: 'Prenda',
          entidadId: prendaExiste.id,
          campo: 'eliminacion',
          valorAnterior: prendaExiste.tipoPrenda || 'VENTA',
          valorNuevo: null,
          origen: 'USUARIO',
          autorUsuarioId: autor?.id ?? null,
          autorRol: autor?.rol ?? null,
        },
      });
    }

    await this.prisma.prenda.delete({ where: { id } });
    return {};
  }

  /**
   * R-K03: Multiplicacion por piezas fisicas reales (camisetas, shorts, medias).
   * La prenda es la unidad contable que se multiplica por los componentes de TipoProducto.
   */
  async obtenerResumenProduccion(pedidoId: string) {
    const prendas = await this.prisma.prenda.findMany({
      where: {
        grupo: { pedidoId },
      },
      include: {
        tipoProducto: true,
      },
    });

    const precioBaseVenta = await this.obtenerPrecioBase('VENTA');
    let totalCamisetas = 0;
    let totalShorts = 0;
    let totalMedias = 0;
    let venta = 0;
    let obsequio = 0;
    let muestra = 0;
    let importeTotalEstimado = 0;

    for (const p of prendas) {
      // R-K03: Multiplicar componentes
      totalCamisetas += p.tipoProducto?.camisetas ?? 0;
      totalShorts += p.tipoProducto?.shorts ?? 0;
      totalMedias += p.tipoProducto?.medias ?? 0;

      // R-K02: Importes segun tipo
      if (p.tipoPrenda === 'VENTA') {
        venta++;
        importeTotalEstimado += precioBaseVenta;
      } else if (p.tipoPrenda === 'OBSEQUIO') {
        obsequio++;
      } else if (p.tipoPrenda === 'MUESTRA') {
        muestra++;
      }
    }

    return {
      pedidoId,
      totalPrendas: prendas.length,
      desgloseTiposPrenda: {
        venta,
        obsequio,
        muestra,
      },
      piezasFisicas: {
        totalCamisetas,
        totalShorts,
        totalMedias,
      },
      importeTotalEstimado,
    };
  }

  /**
   * R-H09 / R-I06..R-I09: Diagnóstico preventivo previo al cierre de lista.
   * Calcula en tiempo real las inconsistencias bloqueantes e informativas sin alterar el estado.
   */
  async obtenerDiagnosticoCierreLista(pedidoId: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        grupos: {
          include: {
            tipoProducto: true,
            participantes: {
              include: {
                prendas: {
                  include: {
                    talla: true,
                    color: true,
                    tipoProducto: true,
                    excepciones: true,
                  },
                },
              },
            },
            prendas: {
              include: {
                talla: true,
                color: true,
                tipoProducto: true,
                excepciones: true,
                participante: true,
              },
            },
          },
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${pedidoId} no encontrado.`);
    }

    const alertasBloqueantes: Array<{
      tipo: 'BLOQUEANTE';
      codigo: string;
      mensaje: string;
      grupoId?: string;
      grupoNombre?: string;
      participanteId?: string;
      participanteNombre?: string;
      prendaId?: string;
    }> = [];

    const alertasInformativas: Array<{
      tipo: 'INFORMATIVA';
      codigo: string;
      mensaje: string;
      grupoId?: string;
      grupoNombre?: string;
      participanteId?: string;
      participanteNombre?: string;
      prendaId?: string;
    }> = [];

    let cantidadContratadaTotal = 0;
    let totalPrendas = 0;
    let prendasCompletas = 0;
    let prendasIncompletas = 0;
    let totalParticipantes = 0;
    let participantesCompletos = 0;
    let participantesIncompletos = 0;
    let participantesPendientes = 0;

    for (const grupo of pedido.grupos) {
      cantidadContratadaTotal += grupo.cantidadContratada;
      totalPrendas += grupo.prendas.length;

      // 1. R-B02 / R-H03 / R-I07: Discrepancia contra cantidad contratada (INFORMATIVA)
      if (grupo.prendas.length !== grupo.cantidadContratada) {
        alertasInformativas.push({
          tipo: 'INFORMATIVA',
          codigo: 'DISCREPANCIA_CANTIDAD',
          mensaje: `El grupo "${grupo.nombre}" tiene ${grupo.prendas.length} prendas registradas contra ${grupo.cantidadContratada} contratadas.`,
          grupoId: grupo.id,
          grupoNombre: grupo.nombre,
        });
      }

      // 2. R-G03 / R-G06 / R-I07: Control de repetición de dorsales según política
      const conteoNumeros = new Map<string, number>();
      for (const p of grupo.prendas) {
        if (p.numero && p.numero.trim() !== '' && p.numero.trim().toUpperCase() !== 'S/N') {
          const num = p.numero.trim();
          conteoNumeros.set(num, (conteoNumeros.get(num) || 0) + 1);
        }
      }

      for (const [num, repeticiones] of conteoNumeros.entries()) {
        if (repeticiones > 1) {
          if (grupo.politicaNumeracion === 'UNICA') {
            alertasBloqueantes.push({
              tipo: 'BLOQUEANTE',
              codigo: 'NUMERO_DUPLICADO',
              mensaje: `El número "${num}" está duplicado (${repeticiones} veces) en el grupo "${grupo.nombre}" con política ÚNICA.`,
              grupoId: grupo.id,
              grupoNombre: grupo.nombre,
            });
          } else {
            alertasInformativas.push({
              tipo: 'INFORMATIVA',
              codigo: 'NUMERO_REPETIDO_LIBRE',
              mensaje: `El número "${num}" se repite ${repeticiones} veces en el grupo "${grupo.nombre}" (permitido bajo política LIBRE).`,
              grupoId: grupo.id,
              grupoNombre: grupo.nombre,
            });
          }
        }
      }

      // 3. Revisión de Participantes del grupo
      for (const part of grupo.participantes) {
        totalParticipantes++;

        if (part.estado === 'PENDIENTE') {
          participantesPendientes++;
          alertasInformativas.push({
            tipo: 'INFORMATIVA',
            codigo: 'PARTICIPANTE_PENDIENTE',
            mensaje: `El participante "${part.nombrePersona}" aún no ha registrado sus datos en el portal móvil.`,
            grupoId: grupo.id,
            grupoNombre: grupo.nombre,
            participanteId: part.id,
            participanteNombre: part.nombrePersona,
          });
        }

        // R-D01: Participante sin prendas está incompleto (BLOQUEANTE)
        if (part.prendas.length === 0) {
          participantesIncompletos++;
          alertasBloqueantes.push({
            tipo: 'BLOQUEANTE',
            codigo: 'PARTICIPANTE_SIN_PRENDAS',
            mensaje: `El participante "${part.nombrePersona}" no tiene ninguna prenda asignada.`,
            grupoId: grupo.id,
            grupoNombre: grupo.nombre,
            participanteId: part.id,
            participanteNombre: part.nombrePersona,
          });
          continue;
        }

        let tieneIncompleta = false;

        // 4. R-E03: Ficha mínima de prenda completa (talla y color)
        for (const pr of part.prendas) {
          const faltaTalla = !pr.tallaId;
          const faltaColor = !pr.colorId;

          if (faltaTalla || faltaColor) {
            prendasIncompletas++;
            tieneIncompleta = true;

            const motivos: string[] = [];
            if (faltaTalla) motivos.push('falta talla');
            if (faltaColor) motivos.push('falta color');

            alertasBloqueantes.push({
              tipo: 'BLOQUEANTE',
              codigo: faltaTalla ? 'PRENDA_SIN_TALLA' : 'PRENDA_SIN_COLOR',
              mensaje: `La prenda de "${part.nombrePersona}" está incompleta (${motivos.join(', ')}).`,
              grupoId: grupo.id,
              grupoNombre: grupo.nombre,
              participanteId: part.id,
              participanteNombre: part.nombrePersona,
              prendaId: pr.id,
            });
          } else {
            prendasCompletas++;
          }

          // R-C09: Más de 3 excepciones en una prenda (INFORMATIVA)
          if (pr.excepciones && pr.excepciones.length > 3) {
            alertasInformativas.push({
              tipo: 'INFORMATIVA',
              codigo: 'EXCESO_EXCEPCIONES',
              mensaje: `La prenda de "${part.nombrePersona}" acumula ${pr.excepciones.length} excepciones. Se sugiere mover a un grupo propio.`,
              grupoId: grupo.id,
              grupoNombre: grupo.nombre,
              participanteId: part.id,
              participanteNombre: part.nombrePersona,
              prendaId: pr.id,
            });
          }
        }

        if (tieneIncompleta) {
          participantesIncompletos++;
        } else {
          participantesCompletos++;
        }
      }
    }

    const aptoParaCierre = alertasBloqueantes.length === 0;

    return {
      pedidoId: pedido.id,
      pedidoCodigo: pedido.codigo,
      aptoParaCierre,
      resumen: {
        totalGrupos: pedido.grupos.length,
        cantidadContratadaTotal,
        totalPrendas,
        prendasCompletas,
        prendasIncompletas,
        totalParticipantes,
        participantesCompletos,
        participantesIncompletos,
        participantesPendientes,
        totalAlertasBloqueantes: alertasBloqueantes.length,
        totalAlertasInformativas: alertasInformativas.length,
      },
      alertasBloqueantes,
      alertasInformativas,
    };
  }

  async cargaMasiva(grupoId: string, filas: CargaMasivaFilaDto[], autor?: { id?: string; rol?: any }) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id: grupoId },
      include: { tipoProducto: true },
    });
    if (!grupo) throw new NotFoundException(`Grupo ${grupoId} no encontrado.`);

    await this.validarListaAbiertaPorPedidoId(grupo.pedidoId);

    const tallasDisponibles = await this.prisma.tallaCatalogo.findMany({
      where: { tipoProductoId: grupo.tipoProductoId, activo: true },
    });

    const resolverTalla = (codigo?: string) => {
      if (!codigo) return null;
      const norm = codigo.trim().toUpperCase();
      return tallasDisponibles.find((t) => t.codigo.toUpperCase() === norm)?.id ?? null;
    };

    const creados: string[] = [];
    const errores: { fila: number; error: string }[] = [];

    for (let i = 0; i < filas.length; i++) {
      const f = filas[i];
      const nombreTrimmed = f.nombre?.trim();
      if (!nombreTrimmed) {
        errores.push({ fila: i + 1, error: 'El nombre es obligatorio.' });
        continue;
      }

      try {
        const token = `tok_${require('crypto').randomBytes(8).toString('hex')}`;
        const expira = new Date();
        expira.setDate(expira.getDate() + 7);

        const participante = await this.prisma.participante.create({
          data: {
            grupoId,
            nombrePersona: nombreTrimmed,
            enlaceToken: token,
            enlaceExpiraEn: expira,
          },
        });

        const tallaId = resolverTalla(f.talla) ?? undefined;
        const tallaShortId = f.tallaShort ? (resolverTalla(f.tallaShort) ?? undefined) : undefined;

        await this.prisma.prenda.create({
          data: {
            participanteId: participante.id,
            grupoId,
            tipoProductoId: grupo.tipoProductoId,
            tallaId: tallaId ?? null,
            tallaShortId: tallaShortId ?? null,
            numero: f.numero?.trim() || null,
            nombreEnPrenda: (f.apodo?.trim() || nombreTrimmed).toUpperCase(),
            genero: (f.genero?.toUpperCase() as any) || 'SIN_ESPECIFICAR',
            tipoPrenda: (f.tipoPrenda?.toUpperCase() as any) || 'VENTA',
            esArquero: Boolean(f.esArquero),
          },
        });

        creados.push(nombreTrimmed);
      } catch (err: any) {
        errores.push({ fila: i + 1, error: err?.message || 'Error desconocido.' });
      }
    }

    if (grupo.pedidoId) {
      await this.prisma.registroCambio?.create?.({
        data: {
          pedidoId: grupo.pedidoId,
          entidad: 'Prenda',
          entidadId: grupoId,
          campo: 'carga_masiva',
          valorAnterior: null,
          valorNuevo: `${creados.length} prendas creadas`,
          origen: 'USUARIO',
          autorUsuarioId: autor?.id ?? null,
          autorRol: autor?.rol ?? null,
        },
      });
    }

    return { creados: creados.length, errores };
  }
}


