-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('BORRADOR', 'EN_CONFIGURACION', 'EN_RECOLECCION', 'EN_REVISION', 'CERRADO', 'EN_PRODUCCION', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoBloque" AS ENUM ('DISENO', 'LISTA', 'COMERCIAL');

-- CreateEnum
CREATE TYPE "EstadoBloque" AS ENUM ('ABIERTO', 'EN_REVISION', 'CERRADO');

-- CreateEnum
CREATE TYPE "PoliticaNumeracion" AS ENUM ('LIBRE', 'UNICA');

-- CreateEnum
CREATE TYPE "EstadoParticipante" AS ENUM ('PENDIENTE', 'REGISTRADO', 'CONFIRMADO');

-- CreateEnum
CREATE TYPE "EstadoDiseno" AS ENUM ('BORRADOR', 'PROPUESTO', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMINISTRADOR', 'COORDINADOR_OPERATIVO', 'VENDEDORA', 'COORDINADOR_CLIENTE', 'DISENO', 'PRODUCCION');

-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('HOMBRE', 'MUJER', 'NINO', 'NINA', 'SIN_ESPECIFICAR');

-- CreateEnum
CREATE TYPE "TipoPrenda" AS ENUM ('VENTA', 'OBSEQUIO', 'MUESTRA');

-- CreateEnum
CREATE TYPE "TipoTarifa" AS ENUM ('PRODUCTO', 'RECARGO_TALLA', 'RECARGO_TELA', 'RECARGO_CUELLO', 'RECARGO_ACABADO', 'ADICIONAL', 'COSTO_INTERNO');

-- CreateEnum
CREATE TYPE "TipoComprobante" AS ENUM ('NINGUNO', 'BOLETA', 'FACTURA');

-- CreateEnum
CREATE TYPE "OrigenCambio" AS ENUM ('USUARIO', 'PARTICIPANTE', 'SISTEMA', 'GHL');

-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('COLEGIO', 'PROMOCION', 'CLUB', 'EMPRESA', 'PARTICULAR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "tipo" "TipoCliente" NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "ciudad" TEXT,
    "ghlContactId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "vendedoraId" TEXT,
    "ghlOpportunityId" TEXT,
    "ghlContactId" TEXT,
    "ghlSincronizadoEn" TIMESTAMP(3),
    "estado" "EstadoPedido" NOT NULL DEFAULT 'BORRADOR',
    "fechaPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCompromiso" TIMESTAMP(3),
    "observaciones" TEXT,
    "creadoPorId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coordinadorId" TEXT NOT NULL,
    "canceladoEn" TIMESTAMP(3),

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloquePedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "tipo" "TipoBloque" NOT NULL,
    "estado" "EstadoBloque" NOT NULL DEFAULT 'ABIERTO',
    "cerradoEn" TIMESTAMP(3),
    "cerradoPorId" TEXT,

    CONSTRAINT "BloquePedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersionBloque" (
    "id" TEXT NOT NULL,
    "bloqueId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "contenido" JSONB NOT NULL,
    "motivoReapertura" TEXT,
    "diff" JSONB,
    "acusadoDisenoEn" TIMESTAMP(3),
    "acusadoProduccionEn" TIMESTAMP(3),
    "creadoPorId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VersionBloque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoProducto" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "camisetas" INTEGER NOT NULL DEFAULT 0,
    "shorts" INTEGER NOT NULL DEFAULT 0,
    "medias" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TipoProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TallaCatalogo" (
    "id" TEXT NOT NULL,
    "tipoProductoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TallaCatalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atributo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "obligatorio" BOOLEAN NOT NULL DEFAULT false,
    "criticoProduccion" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Atributo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValorAtributo" (
    "id" TEXT NOT NULL,
    "atributoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ValorAtributo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UbicacionPersonalizacion" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UbicacionPersonalizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoProductoId" TEXT NOT NULL,
    "cantidadContratada" INTEGER NOT NULL,
    "politicaNumeracion" "PoliticaNumeracion" NOT NULL DEFAULT 'LIBRE',
    "observaciones" TEXT,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValorConfiguracion" (
    "id" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "atributoId" TEXT NOT NULL,
    "valorAtributoId" TEXT NOT NULL,

    CONSTRAINT "ValorConfiguracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participante" (
    "id" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "nombrePersona" TEXT NOT NULL,
    "estado" "EstadoParticipante" NOT NULL DEFAULT 'PENDIENTE',
    "enlaceToken" TEXT NOT NULL,
    "enlaceExpiraEn" TIMESTAMP(3),
    "enlaceRevocado" BOOLEAN NOT NULL DEFAULT false,
    "registradoEn" TIMESTAMP(3),
    "confirmadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prenda" (
    "id" TEXT NOT NULL,
    "participanteId" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "tipoProductoId" TEXT NOT NULL,
    "tallaId" TEXT,
    "nombreEnPrenda" TEXT,
    "numero" TEXT,
    "genero" "Genero" NOT NULL DEFAULT 'SIN_ESPECIFICAR',
    "tipoPrenda" "TipoPrenda" NOT NULL DEFAULT 'VENTA',
    "colorId" TEXT,
    "esArquero" BOOLEAN NOT NULL DEFAULT false,
    "politicaNumeracion" "PoliticaNumeracion" NOT NULL DEFAULT 'LIBRE',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExcepcionPrenda" (
    "id" TEXT NOT NULL,
    "prendaId" TEXT NOT NULL,
    "atributoId" TEXT NOT NULL,
    "valorAtributoId" TEXT NOT NULL,
    "motivo" TEXT,
    "creadoPorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExcepcionPrenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personalizacion" (
    "id" TEXT NOT NULL,
    "prendaId" TEXT NOT NULL,
    "ubicacionId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Personalizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diseno" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "estado" "EstadoDiseno" NOT NULL DEFAULT 'BORRADOR',
    "archivoUrl" TEXT,
    "imagenUrl" TEXT,
    "aprobadoEn" TIMESTAMP(3),
    "aprobadoPorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Diseno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroCambio" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT,
    "valorNuevo" TEXT,
    "origen" "OrigenCambio" NOT NULL,
    "autorUsuarioId" TEXT,
    "autorParticipanteId" TEXT,
    "autorRol" "RolUsuario",
    "prendasAfectadas" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroCambio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoGhl" (
    "id" TEXT NOT NULL,
    "eventoExternoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "opportunityId" TEXT,
    "contactId" TEXT,
    "payload" JSONB NOT NULL,
    "procesadoEn" TIMESTAMP(3),
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "ultimoError" TEXT,
    "recibidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoGhl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColorPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigoHex" TEXT,
    "referenciaFisica" TEXT,

    CONSTRAINT "ColorPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarifa" (
    "id" TEXT NOT NULL,
    "tipo" "TipoTarifa" NOT NULL,
    "concepto" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "vigenteDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigenteHasta" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "nota" TEXT,

    CONSTRAINT "Tarifa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Confirmacion" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "totalSinIgv" DECIMAL(10,2) NOT NULL,
    "recargoTallas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "recargoTelas" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "recargoCuellos" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "recargoAcabados" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "adicionales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "adelantoSugerido" DECIMAL(10,2) NOT NULL,
    "adelantoRecibido" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "saldo" DECIMAL(10,2) NOT NULL,
    "comprobante" "TipoComprobante" NOT NULL DEFAULT 'NINGUNO',
    "igvCalculado" DECIMAL(10,2),
    "pdfUrl" TEXT,
    "emitidaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emitidaPorId" TEXT NOT NULL,

    CONSTRAINT "Confirmacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatosEnvio" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "nombreCompleto" TEXT,
    "dni" TEXT,
    "celular" TEXT,
    "ciudad" TEXT,
    "agencia" TEXT,
    "referencia" TEXT,
    "correo" TEXT,

    CONSTRAINT "DatosEnvio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nesting" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "telaId" TEXT NOT NULL,
    "anchoImpresionM" DECIMAL(4,2) NOT NULL DEFAULT 1.80,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoPorId" TEXT NOT NULL,

    CONSTRAINT "Nesting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NestingParte" (
    "id" TEXT NOT NULL,
    "nestingId" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "numeroParte" INTEGER NOT NULL,
    "anchoCm" INTEGER NOT NULL,
    "largoCm" INTEGER NOT NULL,
    "esRib" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NestingParte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivoTif" (
    "id" TEXT NOT NULL,
    "nestingId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "largoM" DECIMAL(6,2) NOT NULL,
    "ordenEnSerie" INTEGER NOT NULL,
    "totalSerie" INTEGER NOT NULL,
    "entregadoEn" TIMESTAMP(3),

    CONSTRAINT "ArchivoTif_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_rol_idx" ON "Usuario"("rol");

-- CreateIndex
CREATE INDEX "Cliente_tipo_idx" ON "Cliente"("tipo");

-- CreateIndex
CREATE INDEX "Cliente_nombre_idx" ON "Cliente"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_codigo_key" ON "Pedido"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_ghlOpportunityId_key" ON "Pedido"("ghlOpportunityId");

-- CreateIndex
CREATE INDEX "Pedido_estado_idx" ON "Pedido"("estado");

-- CreateIndex
CREATE INDEX "Pedido_ghlContactId_idx" ON "Pedido"("ghlContactId");

-- CreateIndex
CREATE INDEX "BloquePedido_estado_idx" ON "BloquePedido"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "BloquePedido_pedidoId_tipo_key" ON "BloquePedido"("pedidoId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "VersionBloque_bloqueId_numero_key" ON "VersionBloque"("bloqueId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "TipoProducto_codigo_key" ON "TipoProducto"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "TallaCatalogo_tipoProductoId_codigo_key" ON "TallaCatalogo"("tipoProductoId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "TallaCatalogo_tipoProductoId_id_key" ON "TallaCatalogo"("tipoProductoId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Atributo_codigo_key" ON "Atributo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ValorAtributo_atributoId_codigo_key" ON "ValorAtributo"("atributoId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ValorAtributo_atributoId_id_key" ON "ValorAtributo"("atributoId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "UbicacionPersonalizacion_codigo_key" ON "UbicacionPersonalizacion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Grupo_pedidoId_nombre_key" ON "Grupo"("pedidoId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ValorConfiguracion_grupoId_atributoId_key" ON "ValorConfiguracion"("grupoId", "atributoId");

-- CreateIndex
CREATE UNIQUE INDEX "Participante_enlaceToken_key" ON "Participante"("enlaceToken");

-- CreateIndex
CREATE INDEX "Participante_grupoId_estado_idx" ON "Participante"("grupoId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Participante_grupoId_id_key" ON "Participante"("grupoId", "id");

-- CreateIndex
CREATE INDEX "Prenda_grupoId_idx" ON "Prenda"("grupoId");

-- CreateIndex
CREATE INDEX "Prenda_participanteId_idx" ON "Prenda"("participanteId");

-- CreateIndex
CREATE INDEX "ExcepcionPrenda_atributoId_idx" ON "ExcepcionPrenda"("atributoId");

-- CreateIndex
CREATE UNIQUE INDEX "ExcepcionPrenda_prendaId_atributoId_key" ON "ExcepcionPrenda"("prendaId", "atributoId");

-- CreateIndex
CREATE UNIQUE INDEX "Personalizacion_prendaId_ubicacionId_key" ON "Personalizacion"("prendaId", "ubicacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Diseno_pedidoId_version_key" ON "Diseno"("pedidoId", "version");

-- CreateIndex
CREATE INDEX "RegistroCambio_pedidoId_creadoEn_idx" ON "RegistroCambio"("pedidoId", "creadoEn");

-- CreateIndex
CREATE INDEX "RegistroCambio_entidad_entidadId_idx" ON "RegistroCambio"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "RegistroCambio_autorUsuarioId_idx" ON "RegistroCambio"("autorUsuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "EventoGhl_eventoExternoId_key" ON "EventoGhl"("eventoExternoId");

-- CreateIndex
CREATE INDEX "EventoGhl_procesadoEn_idx" ON "EventoGhl"("procesadoEn");

-- CreateIndex
CREATE INDEX "EventoGhl_opportunityId_idx" ON "EventoGhl"("opportunityId");

-- CreateIndex
CREATE UNIQUE INDEX "ColorPedido_pedidoId_nombre_key" ON "ColorPedido"("pedidoId", "nombre");

-- CreateIndex
CREATE INDEX "Tarifa_tipo_activo_idx" ON "Tarifa"("tipo", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "Tarifa_tipo_concepto_vigenteDesde_key" ON "Tarifa"("tipo", "concepto", "vigenteDesde");

-- CreateIndex
CREATE UNIQUE INDEX "Confirmacion_pedidoId_version_key" ON "Confirmacion"("pedidoId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "DatosEnvio_pedidoId_key" ON "DatosEnvio"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "Nesting_codigo_key" ON "Nesting"("codigo");

-- CreateIndex
CREATE INDEX "NestingParte_pedidoId_idx" ON "NestingParte"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "NestingParte_nestingId_numeroParte_key" ON "NestingParte"("nestingId", "numeroParte");

-- CreateIndex
CREATE UNIQUE INDEX "ArchivoTif_nombre_key" ON "ArchivoTif"("nombre");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_vendedoraId_fkey" FOREIGN KEY ("vendedoraId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_coordinadorId_fkey" FOREIGN KEY ("coordinadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloquePedido" ADD CONSTRAINT "BloquePedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloquePedido" ADD CONSTRAINT "BloquePedido_cerradoPorId_fkey" FOREIGN KEY ("cerradoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionBloque" ADD CONSTRAINT "VersionBloque_bloqueId_fkey" FOREIGN KEY ("bloqueId") REFERENCES "BloquePedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VersionBloque" ADD CONSTRAINT "VersionBloque_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TallaCatalogo" ADD CONSTRAINT "TallaCatalogo_tipoProductoId_fkey" FOREIGN KEY ("tipoProductoId") REFERENCES "TipoProducto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValorAtributo" ADD CONSTRAINT "ValorAtributo_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "Atributo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grupo" ADD CONSTRAINT "Grupo_tipoProductoId_fkey" FOREIGN KEY ("tipoProductoId") REFERENCES "TipoProducto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValorConfiguracion" ADD CONSTRAINT "ValorConfiguracion_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValorConfiguracion" ADD CONSTRAINT "ValorConfiguracion_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "Atributo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValorConfiguracion" ADD CONSTRAINT "ValorConfiguracion_atributoId_valorAtributoId_fkey" FOREIGN KEY ("atributoId", "valorAtributoId") REFERENCES "ValorAtributo"("atributoId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participante" ADD CONSTRAINT "Participante_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prenda" ADD CONSTRAINT "Prenda_grupoId_participanteId_fkey" FOREIGN KEY ("grupoId", "participanteId") REFERENCES "Participante"("grupoId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prenda" ADD CONSTRAINT "Prenda_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prenda" ADD CONSTRAINT "Prenda_tipoProductoId_fkey" FOREIGN KEY ("tipoProductoId") REFERENCES "TipoProducto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prenda" ADD CONSTRAINT "Prenda_tipoProductoId_tallaId_fkey" FOREIGN KEY ("tipoProductoId", "tallaId") REFERENCES "TallaCatalogo"("tipoProductoId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prenda" ADD CONSTRAINT "Prenda_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "ColorPedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcepcionPrenda" ADD CONSTRAINT "ExcepcionPrenda_prendaId_fkey" FOREIGN KEY ("prendaId") REFERENCES "Prenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcepcionPrenda" ADD CONSTRAINT "ExcepcionPrenda_atributoId_fkey" FOREIGN KEY ("atributoId") REFERENCES "Atributo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcepcionPrenda" ADD CONSTRAINT "ExcepcionPrenda_atributoId_valorAtributoId_fkey" FOREIGN KEY ("atributoId", "valorAtributoId") REFERENCES "ValorAtributo"("atributoId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcepcionPrenda" ADD CONSTRAINT "ExcepcionPrenda_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personalizacion" ADD CONSTRAINT "Personalizacion_prendaId_fkey" FOREIGN KEY ("prendaId") REFERENCES "Prenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Personalizacion" ADD CONSTRAINT "Personalizacion_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "UbicacionPersonalizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diseno" ADD CONSTRAINT "Diseno_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diseno" ADD CONSTRAINT "Diseno_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCambio" ADD CONSTRAINT "RegistroCambio_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCambio" ADD CONSTRAINT "RegistroCambio_autorUsuarioId_fkey" FOREIGN KEY ("autorUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColorPedido" ADD CONSTRAINT "ColorPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Confirmacion" ADD CONSTRAINT "Confirmacion_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Confirmacion" ADD CONSTRAINT "Confirmacion_emitidaPorId_fkey" FOREIGN KEY ("emitidaPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosEnvio" ADD CONSTRAINT "DatosEnvio_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nesting" ADD CONSTRAINT "Nesting_telaId_fkey" FOREIGN KEY ("telaId") REFERENCES "ValorAtributo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nesting" ADD CONSTRAINT "Nesting_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NestingParte" ADD CONSTRAINT "NestingParte_nestingId_fkey" FOREIGN KEY ("nestingId") REFERENCES "Nesting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NestingParte" ADD CONSTRAINT "NestingParte_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivoTif" ADD CONSTRAINT "ArchivoTif_nestingId_fkey" FOREIGN KEY ("nestingId") REFERENCES "Nesting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
