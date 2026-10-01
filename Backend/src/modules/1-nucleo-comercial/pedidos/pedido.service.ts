import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { AddColorDto } from './dto/add-color.dto';
import { EstadoPedido } from './estado-pedido.enum';
import { transicionValida } from './estado-pedido.transitions';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class PedidoService {
  constructor(private readonly prisma: PrismaService) {}

  private async generarCodigo(): Promise<string> {
    const agg = await this.prisma.pedido.aggregate({
      _max: { codigo: true },
    });
    const last = agg._max.codigo;
    const match = last ? /^SUB-(\d{4,})$/.exec(last) : null;
    const maximo = match ? parseInt(match[1], 10) : 0;
    return 'SUB-' + String(maximo + 1).padStart(4, '0');
  }

  private async getSystemUserId(): Promise<string> {
    const user = await this.prisma.usuario.findFirst({
      where: { email: 'sistema@sublitex.com' },
    });
    if (!user) {
      throw new Error('Usuario sistema no existe. Ejecuta el seed antes de iniciar el servidor.');
    }
    return user.id;
  }

  private calcularTiempoDias(fechaPedido?: Date | string | null, fechaCompromiso?: Date | string | null): number | null {
    if (!fechaPedido || !fechaCompromiso) return null;
    const inicio = new Date(fechaPedido).getTime();
    const fin = new Date(fechaCompromiso).getTime();
    return Math.max(0, Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)));
  }

  private normalizarFechaCompromiso(fecha: string): Date {
    const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
    if (SOLO_FECHA.test(fecha.trim())) {
      return new Date(`${fecha.trim()}T23:59:59.999-05:00`);
    }
    return new Date(fecha);
  }

  async create(dto: CreatePedidoDto, userId?: string) {
    const ahora = new Date();
    const fechaCompromiso = this.normalizarFechaCompromiso(dto.fechaCompromiso);
    if (fechaCompromiso <= ahora) {
      throw new BadRequestException(
        'La fecha de compromiso debe ser posterior a la fecha del pedido (R-A09)',
      );
    }
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: dto.clienteId },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado: ' + dto.clienteId);

    const responsableId = userId ?? (await this.getSystemUserId());
    let creado;
    let intentos = 0;
    while (!creado && intentos < 3) {
      try {
        const codigo = await this.generarCodigo();
        creado = await this.prisma.pedido.create({
          data: {
            codigo,
            clienteId: dto.clienteId,
            vendedoraId: dto.vendedoraId || dto.vendedorId,
            fechaCompromiso,
            observaciones: dto.observaciones,
            estado: EstadoPedido.BORRADOR,
            creadoPorId: responsableId,
            coordinadorId: responsableId,
          },
          include: { cliente: true, vendedora: true },
        });
      } catch (error: any) {
        if (error?.code === 'P2002' && error?.meta?.target?.includes('codigo')) {
          intentos++;
          if (intentos >= 3) {
            throw new ConflictException('No se pudo generar un codigo unico para el pedido');
          }
        } else {
          throw error;
        }
      }
    }

    return {
      ...creado,
      tiempoDias: this.calcularTiempoDias(creado.fechaPedido ?? ahora, creado.fechaCompromiso),
    };
  }


  async findAll(estado?: string, clienteId?: string) {
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        ...(estado ? { estado: estado as EstadoPedido } : {}),
        ...(clienteId ? { clienteId } : {}),
      },
      include: {
        cliente: true,
        vendedora: true,
      },
      orderBy: { fechaPedido: 'desc' },
    });
    if (pedidos.length === 0) return [];

    const prendasPorPedido = await this.prisma.prenda.groupBy({
      by: ['grupoId'],
      _count: { _all: true },
      where: { grupo: { pedidoId: { in: pedidos.map((pedido) => pedido.id) } } },
    });
    const grupos = await this.prisma.grupo.findMany({
      where: { pedidoId: { in: pedidos.map((pedido) => pedido.id) } },
      select: { id: true, pedidoId: true },
    });
    const pedidoPorGrupo = new Map(grupos.map((grupo) => [grupo.id, grupo.pedidoId]));
    const prendasPorPedidoId = new Map<string, number>();
    for (const grupo of prendasPorPedido) {
      const pedidoId = pedidoPorGrupo.get(grupo.grupoId);
      if (pedidoId) {
        prendasPorPedidoId.set(
          pedidoId,
          (prendasPorPedidoId.get(pedidoId) ?? 0) + grupo._count._all,
        );
      }
    }

    return pedidos.map((pedido) => ({
      ...pedido,
      tiempoDias: this.calcularTiempoDias(pedido.fechaPedido, pedido.fechaCompromiso),
      totalPrendas: prendasPorPedidoId.get(pedido.id) ?? 0,
    }));
  }

  async findOne(id: string) {
    const where = id.startsWith('SUB-') ? { codigo: id } : { id };
    let pedido = await this.prisma.pedido.findUnique({
      where,
      include: {
        cliente: true,
        vendedora: true,
        grupos: {
          include: {
            tipoProducto: true,
            configuracion: {
              include: { atributo: true, valor: true },
              orderBy: { atributo: { orden: 'asc' } },
            },
          },
        },
        colores: true,
      },
    });
    if (!pedido && !id.startsWith('SUB-')) {
      pedido = await this.prisma.pedido.findUnique({
        where: { codigo: id },
        include: {
          cliente: true,
          vendedora: true,
          grupos: {
            include: {
              tipoProducto: true,
              configuracion: {
                include: { atributo: true, valor: true },
                orderBy: { atributo: { orden: 'asc' } },
              },
            },
          },
          colores: true,
        },
      });
    }
    if (!pedido) throw new NotFoundException('Pedido no encontrado: ' + id);
    return {
      ...pedido,
      tiempoDias: this.calcularTiempoDias(pedido.fechaPedido, pedido.fechaCompromiso),
      grupos: (pedido.grupos ?? []).map((grupo) => ({
        id: grupo.id,
        nombre: grupo.nombre,
        tipoProducto: grupo.tipoProducto ? {
          id: grupo.tipoProducto.id,
          codigo: grupo.tipoProducto.codigo,
          nombre: grupo.tipoProducto.nombre,
          componentes: {
            camisetas: grupo.tipoProducto.camisetas,
            shorts: grupo.tipoProducto.shorts,
            medias: grupo.tipoProducto.medias,
          },
        } : undefined,
        cantidadContratada: grupo.cantidadContratada,
        politicaNumeracion: grupo.politicaNumeracion,
        observaciones: grupo.observaciones,
        configuracion: (grupo.configuracion ?? []).map((configuracion) => ({
          atributo: configuracion.atributo.codigo,
          valor: configuracion.valor.codigo,
        })),
      })),
    };
  }

  async resumenProduccion(id: string) {
    const where = id.startsWith('SUB-') ? { codigo: id } : { id };
    const selectConfig = {
      id: true,
      codigo: true,
      grupos: {
        include: {
          tipoProducto: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              camisetas: true,
              shorts: true,
              medias: true,
            },
          },
          prendas: {
            select: {
              id: true,
              tipoProducto: {
                select: {
                  codigo: true,
                  camisetas: true,
                  shorts: true,
                  medias: true,
                },
              },
            },
          },
        },
        orderBy: { nombre: 'asc' as const },
      },
    };
    let pedido = await this.prisma.pedido.findUnique({
      where,
      select: selectConfig,
    });
    if (!pedido && !id.startsWith('SUB-')) {
      pedido = await this.prisma.pedido.findUnique({
        where: { codigo: id },
        select: selectConfig,
      });
    }
    if (!pedido) throw new NotFoundException('Pedido no encontrado: ' + id);

    const grupos = pedido.grupos.map((grupo) => {
      const piezasContratadas = {
        camisetas: grupo.cantidadContratada * grupo.tipoProducto.camisetas,
        shorts: grupo.cantidadContratada * grupo.tipoProducto.shorts,
        medias: grupo.cantidadContratada * grupo.tipoProducto.medias,
      };
      const piezasRegistradas = grupo.prendas.reduce(
        (totales, prenda) => ({
          camisetas: totales.camisetas + prenda.tipoProducto.camisetas,
          shorts: totales.shorts + prenda.tipoProducto.shorts,
          medias: totales.medias + prenda.tipoProducto.medias,
        }),
        { camisetas: 0, shorts: 0, medias: 0 },
      );
      const diferencia = {
        camisetas: piezasRegistradas.camisetas - piezasContratadas.camisetas,
        shorts: piezasRegistradas.shorts - piezasContratadas.shorts,
        medias: piezasRegistradas.medias - piezasContratadas.medias,
      };

      return {
        grupoId: grupo.id,
        nombre: grupo.nombre,
        tipoProducto: {
          id: grupo.tipoProducto.id,
          codigo: grupo.tipoProducto.codigo,
          nombre: grupo.tipoProducto.nombre,
          componentes: {
            camisetas: grupo.tipoProducto.camisetas,
            shorts: grupo.tipoProducto.shorts,
            medias: grupo.tipoProducto.medias,
          },
        },
        cantidadContratada: grupo.cantidadContratada,
        prendasRegistradas: grupo.prendas.length,
        prendasFaltantes: Math.max(grupo.cantidadContratada - grupo.prendas.length, 0),
        prendasSobrantes: Math.max(grupo.prendas.length - grupo.cantidadContratada, 0),
        estado: grupo.prendas.length < grupo.cantidadContratada
          ? 'FALTANTES'
          : grupo.prendas.length > grupo.cantidadContratada
            ? 'EXCEDENTE'
            : 'COMPLETO',
        piezasContratadas,
        piezasRegistradas,
        diferencia,
      };
    });

    return {
      pedidoId: pedido.id,
      codigo: pedido.codigo,
      totalPrendas: grupos.reduce((total, grupo) => total + grupo.prendasRegistradas, 0),
      grupos,
      totales: grupos.reduce(
        (totales, grupo) => ({
          cantidadContratada: totales.cantidadContratada + grupo.cantidadContratada,
          prendasRegistradas: totales.prendasRegistradas + grupo.prendasRegistradas,
          prendasFaltantes: totales.prendasFaltantes + grupo.prendasFaltantes,
          prendasSobrantes: totales.prendasSobrantes + grupo.prendasSobrantes,
          piezasContratadas: {
            camisetas: totales.piezasContratadas.camisetas + grupo.piezasContratadas.camisetas,
            shorts: totales.piezasContratadas.shorts + grupo.piezasContratadas.shorts,
            medias: totales.piezasContratadas.medias + grupo.piezasContratadas.medias,
          },
          piezasRegistradas: {
            camisetas: totales.piezasRegistradas.camisetas + grupo.piezasRegistradas.camisetas,
            shorts: totales.piezasRegistradas.shorts + grupo.piezasRegistradas.shorts,
            medias: totales.piezasRegistradas.medias + grupo.piezasRegistradas.medias,
          },
        }),
        {
          cantidadContratada: 0,
          prendasRegistradas: 0,
          prendasFaltantes: 0,
          prendasSobrantes: 0,
          piezasContratadas: { camisetas: 0, shorts: 0, medias: 0 },
          piezasRegistradas: { camisetas: 0, shorts: 0, medias: 0 },
        },
      ),
    };
  }

  // ─── Grupos de roles por capa de negocio ────────────────────────────────
  private static readonly ROLES_COMERCIAL = [
    RolUsuario.ADMINISTRADOR,
    RolUsuario.VENDEDOR,
    RolUsuario.VENDEDORA,
    RolUsuario.COORDINADOR_OPERATIVO,
  ];
  private static readonly ROLES_COORDINACION = [
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COORDINADOR_OPERATIVO,
    RolUsuario.COORDINADOR_CLIENTE,
  ];
  private static readonly ROLES_PRODUCCION = [
    RolUsuario.ADMINISTRADOR,
    RolUsuario.PRODUCCION,
  ];

  /**
   * Determina si el rol tiene permiso para ejecutar la transición al estado destino.
   * Reglas de negocio Sublitex (R-A06):
   *   - BORRADOR → EN_CONFIGURACION : COMERCIAL
   *   - EN_CONFIGURACION → EN_RECOLECCION : COMERCIAL
   *   - EN_RECOLECCION → EN_REVISION : COORDINACION
   *   - EN_REVISION → EN_PRODUCCION : PRODUCCION
   *   - EN_PRODUCCION → ENTREGADO/CERRADO : PRODUCCION
   *   - ENTREGADO → CERRADO : PRODUCCION
   *   - * → CANCELADO : COMERCIAL (cualquiera comercial puede cancelar)
   */
  private verificarPermisoTransicion(destino: EstadoPedido, rol: RolUsuario): void {
    const { ROLES_COMERCIAL, ROLES_COORDINACION, ROLES_PRODUCCION } = PedidoService;

    const permisos: Record<EstadoPedido, RolUsuario[]> = {
      [EstadoPedido.EN_CONFIGURACION]: ROLES_COMERCIAL,
      [EstadoPedido.EN_RECOLECCION]: ROLES_COMERCIAL,
      [EstadoPedido.EN_REVISION]: ROLES_COORDINACION,
      [EstadoPedido.EN_PRODUCCION]: ROLES_PRODUCCION,
      [EstadoPedido.ENTREGADO]: ROLES_PRODUCCION,
      [EstadoPedido.CERRADO]: ROLES_PRODUCCION,
      [EstadoPedido.CANCELADO]: ROLES_COMERCIAL,
      [EstadoPedido.BORRADOR]: ROLES_PRODUCCION, // no hay transición hacia BORRADOR
    };

    const rolesPermitidos = permisos[destino] ?? ROLES_PRODUCCION;
    if (!rolesPermitidos.includes(rol)) {
      throw new ForbiddenException(
        `Tu rol (${rol}) no puede mover el pedido a estado ${destino}`,
      );
    }
  }

  async updateEstado(
    id: string,
    dto: UpdateEstadoDto,
    rolUsuario: RolUsuario = RolUsuario.ADMINISTRADOR,
  ) {
    const pedido = await this.findOne(id);
    const actual = pedido.estado as EstadoPedido;
    const destino = dto.estado;

    if (!transicionValida(actual, destino)) {
      throw new BadRequestException(
        `Transición inválida de ${actual} a ${destino} (R-A06)`,
      );
    }

    // Validar que el rol del usuario pueda ejecutar esta transición
    this.verificarPermisoTransicion(destino, rolUsuario);

    if (actual === EstadoPedido.BORRADOR && destino !== EstadoPedido.CANCELADO) {
      if (!pedido.fechaCompromiso) {
        throw new BadRequestException(
          'La fecha de compromiso es obligatoria para salir de BORRADOR (R-A09)',
        );
      }
      if (new Date(pedido.fechaCompromiso) <= new Date(pedido.fechaPedido)) {
        throw new BadRequestException(
          'La fecha de compromiso debe ser posterior a la fecha del pedido (R-A09)',
        );
      }
    }

    return this.prisma.pedido.update({
      where: { id },
      data: {
        estado: destino,
        ...(destino === EstadoPedido.CANCELADO ? { canceladoEn: new Date() } : {}),
      },
    });
  }

  async addColor(pedidoId: string, dto: AddColorDto) {
    await this.findOne(pedidoId);
    try {
      return await this.prisma.colorPedido.create({
        data: {
          nombre: dto.nombre,
          codigoHex: dto.codigoHex,
          referenciaFisica: dto.referenciaFisica,
          cmykC: dto.cmykC,
          cmykM: dto.cmykM,
          cmykY: dto.cmykY,
          cmykK: dto.cmykK,
          pedido: { connect: { id: pedidoId } },
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException(
          'Ya existe un color con ese nombre en el pedido (R-K05)',
        );
      }
      throw error;
    }
  }

  async addColors(pedidoId: string, dtos: AddColorDto[]) {
    await this.findOne(pedidoId);
    try {
      return await this.prisma.$transaction(
        dtos.map((dto) =>
          this.prisma.colorPedido.create({
            data: {
              nombre: dto.nombre,
              codigoHex: dto.codigoHex,
              referenciaFisica: dto.referenciaFisica,
              cmykC: dto.cmykC,
              cmykM: dto.cmykM,
              cmykY: dto.cmykY,
              cmykK: dto.cmykK,
              pedido: { connect: { id: pedidoId } },
            },
          }),
        ),
      );
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException(
          'Ya existe un color con ese nombre en el pedido (R-K05)',
        );
      }
      throw error;
    }
  }

  async updateColor(pedidoId: string, colorId: string, dto: Partial<AddColorDto>) {
    await this.findOne(pedidoId);
    const color = await this.prisma.colorPedido.findFirst({
      where: { id: colorId, pedidoId },
    });
    if (!color) {
      throw new NotFoundException('Color no encontrado: ' + colorId);
    }

    try {
      return await this.prisma.colorPedido.update({
        where: { id: colorId },
        data: {
          ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
          ...(dto.codigoHex !== undefined ? { codigoHex: dto.codigoHex } : {}),
          ...(dto.referenciaFisica !== undefined ? { referenciaFisica: dto.referenciaFisica } : {}),
          ...(dto.cmykC !== undefined ? { cmykC: dto.cmykC } : {}),
          ...(dto.cmykM !== undefined ? { cmykM: dto.cmykM } : {}),
          ...(dto.cmykY !== undefined ? { cmykY: dto.cmykY } : {}),
          ...(dto.cmykK !== undefined ? { cmykK: dto.cmykK } : {}),
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new BadRequestException('Ya existe un color con ese nombre en el pedido (R-K05)');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdatePedidoDto) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id } });
    if (!pedido) throw new NotFoundException('Pedido no encontrado: ' + id);

    if (dto.fechaCompromiso) {
      const nuevaFecha = this.normalizarFechaCompromiso(dto.fechaCompromiso);
      if (nuevaFecha <= new Date(pedido.fechaPedido)) {
        throw new BadRequestException(
          'La fecha de compromiso debe ser posterior a la fecha del pedido (R-A09)',
        );
      }
    }

    const vendedoraId = dto.vendedoraId !== undefined ? dto.vendedoraId : dto.vendedorId;

    return this.prisma.pedido.update({
      where: { id },
      data: {
        ...(dto.fechaCompromiso ? { fechaCompromiso: new Date(dto.fechaCompromiso) } : {}),
        ...(vendedoraId !== undefined ? { vendedoraId } : {}),
        ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones } : {}),
      },
      include: { cliente: true, vendedora: true },
    });
  }

  async getColores(pedidoId: string) {
    await this.findOne(pedidoId);
    return this.prisma.colorPedido.findMany({ where: { pedidoId } });
  }

  async deleteColor(pedidoId: string, colorId: string) {
    await this.findOne(pedidoId);
    try {
      const color = await this.prisma.colorPedido.findFirst({
        where: { id: colorId, pedidoId },
        select: { id: true },
      });
      if (!color) {
        throw new NotFoundException('Color no encontrado: ' + colorId);
      }
      return await this.prisma.colorPedido.delete({
        where: { id: colorId },
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Color no encontrado: ' + colorId);
      }
      if (error?.code === 'P2003') {
        throw new ConflictException('No se puede eliminar el color porque esta asignado a prendas');
      }
      throw error;
    }
  }

  async exportDiseno(pedidoId: string) {
    const pedido = await this.findOne(pedidoId);
    const prendas = await this.prisma.prenda.findMany({
      where: { grupo: { pedidoId: pedido.id } },
      include: {
        talla: true,
        tallaShort: true,
        tipoProducto: true,
        color: true,
        excepciones: {
          include: { atributo: true, valor: true },
        },
        grupo: {
          include: {
            tipoProducto: true,
            configuracion: {
              include: { atributo: true, valor: true },
            },
          },
        },
        participante: true,
      },
    });

    const getTallaWeight = (tallaCodigo?: string | null): number => {
      if (!tallaCodigo) return 999;
      const clean = tallaCodigo.trim().toUpperCase();
      const num = parseInt(clean, 10);
      if (!isNaN(num) && /^\d+$/.test(clean)) {
        return num;
      }
      const weightMap: Record<string, number> = {
        '2': 2, '4': 4, '6': 6, '8': 8, '10': 10, '12': 12, '14': 14, '16': 16,
        'XXS': 20, '2XS': 20, 'XS': 25, 'S': 30, 'M': 40, 'L': 50,
        'XL': 60, 'XXL': 70, '2XL': 70, 'XXXL': 80, '3XL': 80, 'XXXXL': 90, '4XL': 90,
        'UNICA': 100, 'ESTANDAR': 100,
      };
      return weightMap[clean] ?? 200;
    };

    prendas.sort((a, b) => {
      const wA = getTallaWeight(a.talla?.codigo);
      const wB = getTallaWeight(b.talla?.codigo);
      if (wA !== wB) return wA - wB;
      const numA = parseInt(a.numero || '9999', 10);
      const numB = parseInt(b.numero || '9999', 10);
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
      return (a.nombreEnPrenda || '').localeCompare(b.nombreEnPrenda || '');
    });

    const escapeCsv = (val: any) => {
      const str = String(val ?? '').trim();
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = prendas.map((p) => {
      const tallaBase = p.talla?.codigo || p.talla?.etiqueta || '';
      const tallaShort = p.tallaShort?.codigo && p.tallaShort.codigo !== tallaBase
        ? ` (Short ${p.tallaShort.codigo})`
        : '';
      const tallaCompleta = `${tallaBase}${tallaShort}`.trim();

      const excepcionCorte = p.excepciones.find((e) => e.atributo.codigo === 'CORTE');
      const grupoCorte = p.grupo.configuracion.find((c) => c.atributo.codigo === 'CORTE');
      const corte =
        excepcionCorte?.valor.etiqueta ||
        excepcionCorte?.valor.codigo ||
        grupoCorte?.valor.etiqueta ||
        grupoCorte?.valor.codigo ||
        (p.genero !== 'SIN_ESPECIFICAR' ? p.genero : 'ESTÁNDAR');

      const excepcionColor = p.excepciones.find((e) => e.atributo.codigo === 'COLOR');
      const grupoColor = p.grupo.configuracion.find((c) => c.atributo.codigo === 'COLOR');
      const color =
        p.color?.nombre ||
        excepcionColor?.valor.etiqueta ||
        grupoColor?.valor.etiqueta ||
        p.color?.codigoHex ||
        '-';

      const tipoPrenda = p.tipoPrenda || 'VENTA';
      const nombre = p.nombreEnPrenda || '';
      const numero = p.numero || 'S/N';

      return [
        escapeCsv(tallaCompleta),
        escapeCsv(nombre),
        escapeCsv(numero),
        escapeCsv(tipoPrenda),
        escapeCsv(corte),
        escapeCsv(color),
      ].join(',');
    });

    const lines = [
      'Talla,Nombre en prenda,Número,Tipo prenda,Corte,Color',
      ...rows,
    ];

    const csvContent = '\uFEFF' + lines.join('\r\n');
    return {
      codigo: pedido.codigo,
      filename: `EXPORT_COREL_${pedido.codigo}.csv`,
      csvContent,
      totalFilas: rows.length,
    };
  }

  async crearBitacora(pedidoId: string, dto: { descripcionCambio: string; solicitadoPor: string; prendaId?: string }) {
    const pedido = await this.findOne(pedidoId);
    return this.prisma.bitacoraModificacion.create({
      data: {
        pedidoId: pedido.id,
        prendaId: dto.prendaId || null,
        descripcionCambio: dto.descripcionCambio,
        solicitadoPor: dto.solicitadoPor,
      },
      include: {
        prenda: { select: { id: true, nombreEnPrenda: true, numero: true } },
        avisadoPor: { select: { id: true, nombre: true } },
      },
    });
  }

  async getBitacoras(pedidoId: string) {
    const pedido = await this.findOne(pedidoId);
    return this.prisma.bitacoraModificacion.findMany({
      where: { pedidoId: pedido.id },
      include: {
        prenda: { select: { id: true, nombreEnPrenda: true, numero: true } },
        avisadoPor: { select: { id: true, nombre: true } },
      },
      orderBy: { fechaSolicitud: 'desc' },
    });
  }

  async avisarTallerBitacora(pedidoId: string, bitacoraId: string, avisado: boolean, userId?: string) {
    const pedido = await this.findOne(pedidoId);
    const bitacora = await this.prisma.bitacoraModificacion.findFirst({
      where: { id: bitacoraId, pedidoId: pedido.id },
    });
    if (!bitacora) throw new NotFoundException('Registro de bitácora no encontrado');
    return this.prisma.bitacoraModificacion.update({
      where: { id: bitacoraId },
      data: {
        avisadoATaller: avisado,
        avisadoEn: avisado ? new Date() : null,
        avisadoPorId: avisado ? (userId ?? null) : null,
      },
      include: {
        prenda: { select: { id: true, nombreEnPrenda: true, numero: true } },
        avisadoPor: { select: { id: true, nombre: true } },
      },
    });
  }

  async eliminarBitacora(pedidoId: string, bitacoraId: string) {
    const pedido = await this.findOne(pedidoId);
    const bitacora = await this.prisma.bitacoraModificacion.findFirst({
      where: { id: bitacoraId, pedidoId: pedido.id },
    });
    if (!bitacora) throw new NotFoundException('Registro de bitácora no encontrado');
    return this.prisma.bitacoraModificacion.delete({
      where: { id: bitacoraId },
    });
  }
}