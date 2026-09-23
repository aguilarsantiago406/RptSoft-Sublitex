-- =============================================================================
-- SIPES — SIstema de PEdidos Sublitex
-- Restricciones que Prisma no puede expresar
--
-- Ejecutar DESPUÉS de `prisma migrate dev`, como migración manual:
--   prisma migrate dev --create-only --name constraints
-- y pegar este contenido en el archivo .sql generado.
--
-- Este archivo implementa 14 reglas mediante 8 TRIGGERS, 1 indice unico parcial,
-- 10 restricciones CHECK y 2 revocaciones de permiso.
-- CORREGIDO 2026-09-15: la cabecera decia "cinco reglas" y se habia quedado en
-- la version inicial. Lo reporto Frontend 3 en la revision del sprint 1.
--
-- INVENTARIO DE TRIGGERS -- esta es la lista contra la que se verifica la base:
--   1. trg_sync_politica_numeracion        (Grupo)
--   2. trg_heredar_politica_numeracion     (Prenda)
--   3. trg_rechazar_excepcion_redundante   (ExcepcionPrenda)
--   4. trg_lista_cerrada_prenda            (Prenda)
--   5. trg_lista_cerrada_participante      (Participante)
--   6. trg_lista_cerrada_excepcion         (ExcepcionPrenda)
--   7. trg_lista_cerrada_personalizacion   (Personalizacion)
--   8. trg_exigir_codigo_de_color          (Diseno)
--
-- Para verificar la fundacion, correr:
--   SELECT tgname FROM pg_trigger WHERE NOT tgisinternal ORDER BY tgname;
--   -- deben aparecer exactamente esos 8.
--
-- Ninguna de estas reglas se puede dejar en el servicio: en Arte Ideas las
-- validaciones vivian en la vista, y por eso un superusuario leia los clientes
-- de otro tenant.
-- =============================================================================


-- =============================================================================
-- 1 · R-A09 — La fecha compromiso es posterior a la fecha del pedido
-- =============================================================================

ALTER TABLE "Pedido"
  ADD CONSTRAINT pedido_fecha_compromiso_posterior
  CHECK ("fechaCompromiso" IS NULL OR "fechaCompromiso" > "fechaPedido");


-- =============================================================================
-- 2 · R-G01, R-G03, R-G06 — Unicidad CONDICIONAL del número
--
-- El número sólo es único cuando el grupo tiene política UNICA. En el pedido
-- real PROMO 2002 hay cuatro personas con el número 7 y cuatro con el 8: es
-- una promoción, no un equipo. Bloquear siempre sería incorrecto.
--
-- Un índice parcial no puede mirar otra tabla, por eso Prenda lleva una copia
-- denormalizada de la política. El trigger de abajo la mantiene sincronizada.
--
-- EFECTO SECUNDARIO DESEADO: al cambiar un grupo de LIBRE a UNICA, el UPDATE
-- del trigger falla si hay números repetidos. R-G06 se hace cumplir sola.
-- =============================================================================

-- ACTUALIZADO 2026-09-07: el numero paso a ser TEXTO para admitir "S/N"
-- (sin numero), que es un valor real en pedidos historicos. "S/N" queda fuera
-- del indice porque varias prendas pueden legitimamente no llevar numero.
CREATE UNIQUE INDEX prenda_numero_unico_por_grupo
  ON "Prenda" ("grupoId", "numero")
  WHERE "politicaNumeracion" = 'UNICA'
    AND "numero" IS NOT NULL
    AND btrim("numero") <> ''
    AND upper(btrim("numero")) <> 'S/N';


-- Propaga la política del grupo a sus prendas ------------------------------

CREATE OR REPLACE FUNCTION sync_politica_numeracion()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW."politicaNumeracion" IS DISTINCT FROM OLD."politicaNumeracion") THEN
    UPDATE "Prenda"
       SET "politicaNumeracion" = NEW."politicaNumeracion"
     WHERE "grupoId" = NEW."id";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_politica_numeracion
  AFTER UPDATE ON "Grupo"
  FOR EACH ROW EXECUTE FUNCTION sync_politica_numeracion();


-- Una prenda nueva hereda la política de su grupo ---------------------------

CREATE OR REPLACE FUNCTION heredar_politica_numeracion()
RETURNS TRIGGER AS $$
BEGIN
  SELECT g."politicaNumeracion" INTO NEW."politicaNumeracion"
    FROM "Grupo" g WHERE g."id" = NEW."grupoId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_heredar_politica_numeracion
  BEFORE INSERT ON "Prenda"
  FOR EACH ROW EXECUTE FUNCTION heredar_politica_numeracion();


-- =============================================================================
-- 3 · R-C05 — Una excepción idéntica al valor general es inválida
--
-- Es una comparación entre dos tablas: ninguna restricción declarativa la
-- puede expresar. Si se deja en el servicio, alguien la va a saltar por un
-- endpoint de importación masiva.
-- =============================================================================

CREATE OR REPLACE FUNCTION rechazar_excepcion_redundante()
RETURNS TRIGGER AS $$
DECLARE
  v_grupo_id TEXT;
  v_valor_general TEXT;
BEGIN
  SELECT p."grupoId" INTO v_grupo_id
    FROM "Prenda" p WHERE p."id" = NEW."prendaId";

  SELECT vc."valorAtributoId" INTO v_valor_general
    FROM "ValorConfiguracion" vc
   WHERE vc."grupoId" = v_grupo_id
     AND vc."atributoId" = NEW."atributoId";

  IF v_valor_general IS NOT NULL AND v_valor_general = NEW."valorAtributoId" THEN
    RAISE EXCEPTION
      'R-C05: la excepcion coincide con la configuracion general del grupo (atributo %). Si querias cambiar a todos, cambia la configuracion general.',
      NEW."atributoId";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rechazar_excepcion_redundante
  BEFORE INSERT OR UPDATE ON "ExcepcionPrenda"
  FOR EACH ROW EXECUTE FUNCTION rechazar_excepcion_redundante();


-- =============================================================================
-- 4 · R-H12 — Un bloque cerrado es de solo lectura para TODOS los roles
--
-- "Sin excepción, incluido el administrador." Esa frase sólo es verdad si la
-- garantiza la base de datos. Cualquier otra capa tiene un camino alrededor:
-- un script de mantenimiento, una consola de administración, un seed mal hecho.
--
-- Nota: R-B09 permite marcar excepciones redundantes y R-H13 permite reabrir.
-- La reapertura debe cambiar el estado del bloque a ABIERTO ANTES de escribir;
-- ese es exactamente el flujo que la regla exige (rol autorizado + motivo).
-- =============================================================================

CREATE OR REPLACE FUNCTION pedido_de_prenda(p_prenda_id TEXT)
RETURNS TEXT AS $$
  SELECT g."pedidoId"
    FROM "Prenda" p
    JOIN "Grupo" g ON g."id" = p."grupoId"
   WHERE p."id" = p_prenda_id;
$$ LANGUAGE sql STABLE;


CREATE OR REPLACE FUNCTION bloque_lista_cerrado(p_pedido_id TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM "BloquePedido" b
     WHERE b."pedidoId" = p_pedido_id
       AND b."tipo" = 'LISTA'
       AND b."estado" = 'CERRADO'
  );
$$ LANGUAGE sql STABLE;


CREATE OR REPLACE FUNCTION impedir_escritura_lista_cerrada()
RETURNS TRIGGER AS $$
DECLARE
  v_pedido_id TEXT;
BEGIN
  -- Resuelve el pedido según la tabla que disparó el trigger
  IF TG_TABLE_NAME = 'Prenda' THEN
    SELECT g."pedidoId" INTO v_pedido_id
      FROM "Grupo" g WHERE g."id" = COALESCE(NEW."grupoId", OLD."grupoId");

  ELSIF TG_TABLE_NAME = 'Participante' THEN
    SELECT g."pedidoId" INTO v_pedido_id
      FROM "Grupo" g WHERE g."id" = COALESCE(NEW."grupoId", OLD."grupoId");

  ELSIF TG_TABLE_NAME IN ('ExcepcionPrenda', 'Personalizacion') THEN
    v_pedido_id := pedido_de_prenda(COALESCE(NEW."prendaId", OLD."prendaId"));
  END IF;

  IF v_pedido_id IS NOT NULL AND bloque_lista_cerrado(v_pedido_id) THEN
    RAISE EXCEPTION
      'R-H12: el bloque Lista del pedido % esta cerrado. Para modificarlo hay que reabrirlo con motivo escrito (R-H13), lo que genera una nueva version.',
      v_pedido_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_lista_cerrada_prenda
  BEFORE INSERT OR UPDATE OR DELETE ON "Prenda"
  FOR EACH ROW EXECUTE FUNCTION impedir_escritura_lista_cerrada();

CREATE TRIGGER trg_lista_cerrada_participante
  BEFORE INSERT OR UPDATE OR DELETE ON "Participante"
  FOR EACH ROW EXECUTE FUNCTION impedir_escritura_lista_cerrada();

CREATE TRIGGER trg_lista_cerrada_excepcion
  BEFORE INSERT OR UPDATE OR DELETE ON "ExcepcionPrenda"
  FOR EACH ROW EXECUTE FUNCTION impedir_escritura_lista_cerrada();

CREATE TRIGGER trg_lista_cerrada_personalizacion
  BEFORE INSERT OR UPDATE OR DELETE ON "Personalizacion"
  FOR EACH ROW EXECUTE FUNCTION impedir_escritura_lista_cerrada();


-- =============================================================================
-- 5 · R-I02, R-H14 — Historial y versiones son append-only
--
-- "No existe edicion ni borrado de entradas para ningun rol, ni por API."
-- Se implementa quitando el permiso, no confiando en que nadie escriba el
-- UPDATE. El rol de la aplicacion puede insertar y leer; nada mas.
--
-- Ajustar 'sipes_app' al rol real que usa la aplicacion.
-- =============================================================================

REVOKE UPDATE, DELETE ON "RegistroCambio" FROM PUBLIC;
REVOKE UPDATE, DELETE ON "VersionBloque"  FROM PUBLIC;

-- GRANT SELECT, INSERT ON "RegistroCambio" TO sipes_app;
-- GRANT SELECT, INSERT ON "VersionBloque"  TO sipes_app;

-- Excepcion controlada: R-H14 exige acusar recibo de una reapertura, y eso es
-- un UPDATE sobre VersionBloque. Se resuelve con una funcion SECURITY DEFINER
-- en vez de abrir el UPDATE completo.

CREATE OR REPLACE FUNCTION acusar_recibo_version(
  p_version_id TEXT,
  p_area TEXT           -- 'DISENO' | 'PRODUCCION'
) RETURNS VOID AS $$
BEGIN
  IF p_area = 'DISENO' THEN
    UPDATE "VersionBloque" SET "acusadoDisenoEn" = now()
     WHERE "id" = p_version_id AND "acusadoDisenoEn" IS NULL;
  ELSIF p_area = 'PRODUCCION' THEN
    UPDATE "VersionBloque" SET "acusadoProduccionEn" = now()
     WHERE "id" = p_version_id AND "acusadoProduccionEn" IS NULL;
  ELSE
    RAISE EXCEPTION 'Area invalida: %', p_area;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- LO QUE NO SE PUEDE HACER CUMPLIR EN LA BASE DE DATOS
--
-- Estas reglas necesitan tests, no restricciones. Van en el mismo orden que en
-- el catalogo, y cada una deberia tener su describe() con el identificador:
--
--   R-B07  cambiar la configuracion general no pisa excepciones
--   R-B08  avisar a cuantas prendas afecta antes de aplicar
--   R-C03  el valor efectivo se resuelve al leer, nunca se copia
--   R-C07  resumen de excepciones por atributo
--   R-E07  todos los resumenes se calculan sobre prendas
--   R-E08  ningun conteo se escribe a mano
--   R-H05  la confirmacion la genera el sistema
--   R-H06  la confirmacion imprime los criticos aunque tomen el valor default
--   R-H07  todos los totales se calculan
--   R-H08  el importe cuadra o no se emite la confirmacion
--   R-H10  el cierre declara altas y bajas contra la version anterior
--   R-I06  las alertas se calculan, nunca se almacenan
--   R-J08  los permisos se aplican en la consulta, no en el controlador
--
-- R-J08 merece una nota: en Nest se resuelve con un repositorio que recibe el
-- rol y arma el WHERE. Si un controlador puede llamar a prisma directamente,
-- la matriz de roles es decorativa. Esa fue exactamente la falla de Arte Ideas.
-- =============================================================================


-- =============================================================================
-- =============================================================================
-- BLOQUE K — RESTRICCIONES AÑADIDAS EL 2026-09-07
--
-- Salieron del análisis de nueve pedidos reales y de la matriz comercial.
-- Cada una corresponde a un error que ya ocurrió, no a una hipótesis.
-- =============================================================================
-- =============================================================================


-- =============================================================================
-- 6 · R-K05 — Un color no puede quedarse en una palabra
--
-- Tres de nueve pedidos reales fallaron por esto: "azul oscuro" salió morado,
-- "amarillo brasil" salió amarillo oro, "verde" salió muy oscuro. El único que
-- no falló especificó los códigos #f7f4f2 y #cc9933.
--
-- El color puede registrarse sin código mientras se conversa con el cliente,
-- pero el diseño no se aprueba hasta que todos los colores tengan el suyo.
-- =============================================================================

CREATE OR REPLACE FUNCTION exigir_codigo_de_color()
RETURNS TRIGGER AS $$
DECLARE
  v_sin_codigo INT;
BEGIN
  IF NEW."estado" = 'APROBADO' AND (TG_OP = 'INSERT' OR OLD."estado" IS DISTINCT FROM 'APROBADO') THEN
    SELECT COUNT(*) INTO v_sin_codigo
      FROM "ColorPedido" c
     WHERE c."pedidoId" = NEW."pedidoId"
       AND (c."codigoHex" IS NULL OR btrim(c."codigoHex") = '');

    IF v_sin_codigo > 0 THEN
      RAISE EXCEPTION
        'R-K05: no se puede aprobar el diseno con % color(es) sin codigo. Un color acordado solo con una palabra es el error mas frecuente de los pedidos historicos.',
        v_sin_codigo;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_exigir_codigo_de_color
  BEFORE INSERT OR UPDATE ON "Diseno"
  FOR EACH ROW EXECUTE FUNCTION exigir_codigo_de_color();


-- Formato del codigo: seis digitos hexadecimales con almohadilla.
ALTER TABLE "ColorPedido"
  ADD CONSTRAINT color_hex_valido
  CHECK ("codigoHex" IS NULL OR "codigoHex" ~* '^#[0-9A-F]{6}$');


-- =============================================================================
-- 7 · R-K07 — El adelanto recibido nunca excede el total
-- =============================================================================

ALTER TABLE "Confirmacion"
  ADD CONSTRAINT confirmacion_adelanto_valido
  CHECK ("adelantoRecibido" >= 0 AND "adelantoRecibido" <= "totalSinIgv");

ALTER TABLE "Confirmacion"
  ADD CONSTRAINT confirmacion_saldo_cuadra
  CHECK ("saldo" = "totalSinIgv" - "adelantoRecibido");

ALTER TABLE "Confirmacion"
  ADD CONSTRAINT confirmacion_totales_no_negativos
  CHECK ("totalSinIgv" >= 0 AND "recargoTallas" >= 0 AND "recargoTelas" >= 0
     AND "recargoCuellos" >= 0 AND "recargoAcabados" >= 0 AND "adicionales" >= 0);


-- =============================================================================
-- 8 · R-K10 — Una sola tarifa vigente por concepto
--
-- En un pedido real se cobro el recargo de talla XL a S/5 cuando la tarifa
-- oficial es S/3. Con el precio saliendo siempre de una tarifa vigente unica,
-- esa diferencia deja de ser posible.
-- =============================================================================

CREATE UNIQUE INDEX tarifa_una_vigente_por_concepto
  ON "Tarifa" ("tipo", "concepto")
  WHERE "vigenteHasta" IS NULL AND "activo" = true;

ALTER TABLE "Tarifa"
  ADD CONSTRAINT tarifa_valor_no_negativo CHECK ("valor" >= 0);


-- =============================================================================
-- 9 · R-K11, R-K12 — Geometria del nesting
--
-- El ancho de impresion es 1.80 m. Una parte no puede ocupar mas que eso.
-- La diferencia entre el ancho ocupado y los 180 cm es el desperdicio lateral,
-- y sirve para medir la calidad del nesting.
-- =============================================================================

ALTER TABLE "NestingParte"
  ADD CONSTRAINT nesting_ancho_valido CHECK ("anchoCm" > 0 AND "anchoCm" <= 180);

ALTER TABLE "NestingParte"
  ADD CONSTRAINT nesting_largo_valido CHECK ("largoCm" > 0);


-- =============================================================================
-- 10 · R-K13 — Series de archivos TIF coherentes
-- =============================================================================

ALTER TABLE "ArchivoTif"
  ADD CONSTRAINT tif_serie_valida
  CHECK ("ordenEnSerie" >= 1 AND "totalSerie" >= 1 AND "ordenEnSerie" <= "totalSerie");

ALTER TABLE "ArchivoTif"
  ADD CONSTRAINT tif_largo_valido CHECK ("largoM" > 0);


-- =============================================================================
-- 11 · R-K02 — Una prenda de obsequio o muestra no lleva importe
--
-- Se fabrica y cuenta para produccion, pero no entra en el cobro. En un pedido
-- real habia una camiseta de obsequio y una de muestra que si habia que
-- fabricar y no habia que cobrar.
-- Esta regla se aplica al calcular la confirmacion; aqui se deja documentada
-- porque el importe no vive en la prenda sino en el calculo.
-- =============================================================================


-- =============================================================================
-- LO QUE SIGUE SIN PODER GARANTIZAR LA BASE DE DATOS — bloque K
--
--   R-K03  los resumenes de produccion se calculan multiplicando por los
--          componentes del producto, nunca contando "unidades"
--   R-K04  "S/N" es un valor valido de numero, distinto de "pendiente"
--   R-K06  la confirmacion la emite el sistema y sus totales se calculan
--   R-K08  no se despacha a provincia sin los siete datos de rotulado
--   R-K09  el pedido minimo es de 12 unidades de venta
--   R-K14  el costo de impresion es metros lineales por la tarifa vigente
--   R-K15  el consumo de tela de un pedido es la suma de SUS partes del
--          nesting, no el total del nesting
--
-- R-K15 merece enfasis: en un nesting real se imprimieron 1497 cm de un pedido
-- y 116 cm de otro en la misma tela. Si el sistema carga el total del nesting
-- a un solo pedido, el costo de ese pedido queda inflado y el del otro en cero.
-- =============================================================================
