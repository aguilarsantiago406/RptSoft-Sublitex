import { PrismaClient } from '@prisma/client';
import { PRODUCTOS, ATRIBUTOS, UBICACIONES, COLORES, PEDIDO_PROMO_2002 } from './promo2002.data';

const prisma = new PrismaClient();

async function seedSistema(): Promise<string> {
  const usuario = await prisma.usuario.upsert({
    where: { email: 'sistema@sublitex.com' },
    update: {},
    create: {
      email: 'sistema@sublitex.com',
      nombre: 'Sistema',
      rol: 'ADMINISTRADOR' as any,
      password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ecJ58kZyvYh64g12u',
    },
  });
  return usuario.id;
}

async function seedCatalogos() {
  const productos: Record<string, string> = {};
  for (const producto of PRODUCTOS) {
    const creado = await prisma.tipoProducto.upsert({
      where: { codigo: producto.codigo },
      update: {
        nombre: producto.nombre,
        orden: producto.orden,
        camisetas: producto.camisetas,
        shorts: producto.shorts,
        medias: producto.medias,
      },
      create: {
        codigo: producto.codigo,
        nombre: producto.nombre,
        orden: producto.orden,
        camisetas: producto.camisetas,
        shorts: producto.shorts,
        medias: producto.medias,
      },
    });
    productos[producto.codigo] = creado.id;
    for (const talla of producto.tallas) {
      await prisma.tallaCatalogo.upsert({
        where: { tipoProductoId_codigo: { tipoProductoId: creado.id, codigo: talla } },
        update: { etiqueta: talla, activo: true },
        create: { tipoProductoId: creado.id, codigo: talla, etiqueta: talla },
      });
    }
  }

  for (const atributo of ATRIBUTOS) {
    const creado = await prisma.atributo.upsert({
      where: { codigo: atributo.codigo },
      update: {
        nombre: atributo.nombre,
        obligatorio: atributo.obligatorio,
        criticoProduccion: atributo.criticoProduccion,
        orden: atributo.orden,
      },
      create: {
        codigo: atributo.codigo,
        nombre: atributo.nombre,
        obligatorio: atributo.obligatorio,
        criticoProduccion: atributo.criticoProduccion,
        orden: atributo.orden,
      },
    });
    for (const valor of atributo.valores) {
      await prisma.valorAtributo.upsert({
        where: { atributoId_codigo: { atributoId: creado.id, codigo: valor.codigo } },
        update: { etiqueta: valor.etiqueta, orden: valor.orden },
        create: { atributoId: creado.id, codigo: valor.codigo, etiqueta: valor.etiqueta, orden: valor.orden },
      });
    }
  }

  for (const ubicacion of UBICACIONES) {
    await prisma.ubicacionPersonalizacion.upsert({
      where: { codigo: ubicacion.codigo },
      update: { etiqueta: ubicacion.etiqueta, orden: ubicacion.orden },
      create: { codigo: ubicacion.codigo, etiqueta: ubicacion.etiqueta, orden: ubicacion.orden },
    });
  }

  return productos;
}

async function seedPromo2002(systemId: string) {
  const codigo = PEDIDO_PROMO_2002.codigo;
  const existente = await prisma.pedido.findUnique({ where: { codigo } });
  if (!existente) {
    const cliente = await prisma.cliente.findFirst({
      where: { nombre: PEDIDO_PROMO_2002.cliente.nombre },
    });
    const clienteId =
      cliente?.id ??
      (await prisma.cliente.create({
        data: {
          tipo: 'PROMOCION' as any,
          nombre: PEDIDO_PROMO_2002.cliente.nombre,
          telefono: PEDIDO_PROMO_2002.cliente.telefono,
          ciudad: PEDIDO_PROMO_2002.cliente.ciudad,
        },
      })).id;
    await prisma.pedido.create({
      data: {
        codigo,
        clienteId,
        fechaCompromiso: PEDIDO_PROMO_2002.fechaCompromiso,
        observaciones: PEDIDO_PROMO_2002.observaciones,
        estado: 'BORRADOR' as any,
        creadoPorId: systemId,
        coordinadorId: systemId,
        colores: {
          create: COLORES.map((color) => ({
            nombre: color.nombre,
            codigoHex: color.codigoHex,
            referenciaFisica: color.referenciaFisica,
          })),
        },
        grupos: {
          create: PEDIDO_PROMO_2002.grupos.map((grupo) => ({
            nombre: grupo.nombre,
            tipoProducto: { connect: { codigo: grupo.tipoProducto } },
            cantidadContratada: grupo.cantidadContratada,
            politicaNumeracion: grupo.politica as any,
          })),
        },
      },
      include: { grupos: true, colores: true },
    });
  }
}

async function seedPrendasPromo2002() {
  const pedido = await prisma.pedido.findUnique({
    where: { codigo: PEDIDO_PROMO_2002.codigo },
    include: { grupos: true, colores: true },
  });
  if (!pedido) throw new Error('Pedido PROMO 2002 no sembrado');

  const colores: Record<string, string> = {};
  for (const color of pedido.colores) colores[color.nombre] = color.id;

  const tallasPorProducto: Record<string, Record<string, string>> = {};
  const productos = await prisma.tipoProducto.findMany({ where: { activo: true } });
  for (const producto of productos) {
    const tallas = await prisma.tallaCatalogo.findMany({ where: { tipoProductoId: producto.id } });
    tallasPorProducto[producto.codigo] = {};
    for (const talla of tallas) tallasPorProducto[producto.codigo][talla.codigo] = talla.id;
  }

  for (const grupoSeed of PEDIDO_PROMO_2002.grupos) {
    const grupo = pedido.grupos.find((g) => g.nombre === grupoSeed.nombre);
    if (!grupo) throw new Error('Grupo no sembrado: ' + grupoSeed.nombre);

    for (let i = 0; i < grupoSeed.prendas.length; i++) {
      const prendaSeed = grupoSeed.prendas[i];
      const enlaceToken = `promo2002-${grupo.nombre.replace(/\s+/g, '-').toLowerCase()}-${i + 1}`;
      let participante = await prisma.participante.findUnique({ where: { enlaceToken } });

      if (!participante) {
        participante = await prisma.participante.create({
          data: {
            grupoId: grupo.id,
            nombrePersona: prendaSeed.nombrePersona,
            estado: 'PENDIENTE' as any,
            enlaceToken,
          },
        });
      }

      const yaTienePrendas = await prisma.prenda.count({ where: { participanteId: participante.id } });
      if (yaTienePrendas > 0) continue;

      await prisma.prenda.create({
        data: {
          participante: { connect: { id: participante.id } },
          grupo: { connect: { id: grupo.id } },
          tipoProducto: { connect: { codigo: grupoSeed.tipoProducto } },
          talla: tallasPorProducto[grupoSeed.tipoProducto]?.[prendaSeed.talla]
            ? { connect: { id: tallasPorProducto[grupoSeed.tipoProducto][prendaSeed.talla] } }
            : undefined,
          nombreEnPrenda: prendaSeed.nombreEnPrenda,
          numero: prendaSeed.numero,
          genero: prendaSeed.genero as any,
          tipoPrenda: prendaSeed.tipoPrenda as any,
          color: colores[prendaSeed.color] ? { connect: { id: colores[prendaSeed.color] } } : undefined,
          politicaNumeracion: grupoSeed.politica as any,
        },
      });
    }
  }
}

async function main() {
  const systemId = await seedSistema();
  await seedCatalogos();
  await seedPromo2002(systemId);
  await seedPrendasPromo2002();

  const resumen = await prisma.pedido.findUnique({
    where: { codigo: PEDIDO_PROMO_2002.codigo },
    include: { grupos: { select: { id: true, prendas: { select: { id: true } } } } },
  });

  const totalGrupos = resumen?.grupos?.length ?? 0;
  const totalPrendas = await prisma.prenda.count({
    where: { grupo: { pedido: { codigo: PEDIDO_PROMO_2002.codigo } } },
  });

  console.log('Seed SIPES listo');
  console.log('Pedido PROMO 2002: ' + PEDIDO_PROMO_2002.codigo);
  console.log('Grupos: ' + totalGrupos);
  console.log('Prendas (filas): ' + totalPrendas);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });