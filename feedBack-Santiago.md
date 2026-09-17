## Resumen general

Se construyó la base inicial del backend para el sistema SIPES de Sublitex. El proyecto utiliza NestJS con TypeScript y PostgreSQL mediante Prisma. La base incluye el modelo central de pedidos, clientes, usuarios, grupos, participantes, prendas, configuraciones, diseño, auditoría, confirmaciones comerciales, datos de envío y control de nesting para producción.

También se dejó disponible una API inicial para que el frontend pueda consultar un pedido de prueba y el detalle de sus prendas. La API cuenta con documentación Swagger y reglas globales de validación.

El trabajo realizado quedó organizado en dos commits principales y ambos fueron publicados en la rama main.

## Estructura actual del proyecto

El proyecto se encuentra dentro de la carpeta RptSoft-Sublitex.

### Archivos de configuración

package.json contiene los comandos de instalación, compilación, ejecución, pruebas, lint y formato. También declara las dependencias de NestJS, Prisma, Swagger, class-validator, class-transformer, Jest y TypeScript.

package-lock.json fija las versiones exactas de las dependencias instaladas.

nest-cli.json configura NestJS y define src como la carpeta principal del código.

tsconfig.json define TypeScript con destino ES2023, decoradores experimentales, metadatos para NestJS, generación de mapas de origen, declaraciones y salida en dist.

tsconfig.build.json hereda la configuración principal y excluye pruebas, dependencias y archivos de salida de la compilación productiva.

eslint.config.mjs contiene las reglas de análisis estático del código.

.prettierrc contiene la configuración de formato.

.gitignore excluye archivos generados, dependencias y datos locales que no deben publicarse.

### Código de la aplicación

src/main.ts es el punto de entrada. Crea la aplicación NestJS, habilita CORS, configura la validación global, construye la documentación Swagger, registra la documentación en api/docs y levanta el servidor en el puerto definido por PORT o en el puerto 3000.

src/app.module.ts registra el controlador principal y el servicio inicial.

src/app.controller.ts expone las rutas de consulta mock relacionadas con pedidos.

src/app.service.ts conserva el servicio inicial generado por NestJS.

src/app.controller.spec.ts contiene la prueba unitaria inicial del controlador.

test/app.e2e-spec.ts contiene la prueba de extremo a extremo inicial.

test/jest-e2e.json define la configuración de las pruebas de extremo a extremo.

### Persistencia y base de datos

prisma/schema.prisma contiene el modelo relacional completo y sus relaciones.

prisma/migrations/20260910175601_init_sipes_core/migration.sql contiene la migración inicial generada para PostgreSQL.

prisma/01_constraints.sql contiene reglas adicionales que Prisma no puede representar directamente y que deben ejecutarse después de la migración inicial.

prisma/migrations/migration_lock.toml fija el proveedor PostgreSQL para las migraciones.

### Automatización

.github/workflows/ci.yml contiene el flujo de integración continua para validar el proyecto en GitHub.

## Modelo de datos creado

El esquema Prisma contiene 26 modelos y 13 enumeraciones.

### Enumeraciones

EstadoPedido representa el ciclo de vida general del pedido desde borrador hasta entrega o cancelación.

TipoBloque identifica los bloques independientes de diseño, lista y comercial.

EstadoBloque representa si un bloque está abierto, en revisión o cerrado.

PoliticaNumeracion define si los dorsales pueden repetirse o deben ser únicos dentro de un grupo.

EstadoParticipante representa el avance de registro de cada participante.

EstadoDiseno representa el ciclo del diseño desde borrador hasta aprobación o rechazo.

RolUsuario define los roles del sistema: administrador, coordinador operativo, vendedora, coordinador de cliente, diseño y producción.

Genero permite separar el género de la persona de otros atributos de la prenda.

TipoPrenda distingue prendas de venta, obsequios y muestras.

TipoTarifa clasifica productos, recargos, adicionales y costos internos.

TipoComprobante define si una confirmación no tiene comprobante, tiene boleta o tiene factura.

OrigenCambio identifica si una modificación provino de un usuario, participante, sistema o GoHighLevel.

TipoCliente clasifica clientes como colegio, promoción, club, empresa o particular.

### Usuarios y clientes

Usuario almacena identidad, correo, nombre, rol, estado activo y fechas de creación y actualización. Se relaciona con pedidos, excepciones, bloques cerrados, versiones, auditoría, diseños aprobados, confirmaciones y nestings.

Cliente representa la organización o grupo que solicita el pedido. Guarda tipo, nombre, teléfono, ciudad, estado y un identificador opcional para una futura conexión con GoHighLevel.

### Pedidos y bloques de trabajo

Pedido es la entidad central. Guarda un código legible, cliente, vendedora, coordinador, usuario creador, estado, fechas, observaciones y datos opcionales de integración con GoHighLevel.

Cada pedido se relaciona con grupos, bloques, diseños, cambios, colores, confirmaciones, datos de envío y partes de nesting.

BloquePedido separa el pedido en diseño, lista y comercial. Cada bloque tiene su propio estado, fecha de cierre y usuario responsable del cierre.

VersionBloque almacena una fotografía inmutable del bloque al momento de cerrar. También guarda el número de versión, contenido JSON, motivo de reapertura, diferencia contra la versión anterior y acuses de recibo de diseño y producción.

### Catálogos

TipoProducto define productos como camiseta, conjunto, kit, arquero, short o medias. También indica cuántas camisetas, shorts y medias físicas contiene cada producto.

TallaCatalogo relaciona las tallas con un tipo de producto específico. Esto evita asignar una talla incompatible con el producto.

Atributo define características configurables como tela, color, cuello, manga, corte, escudo, short y medias. También marca atributos obligatorios y críticos para producción.

ValorAtributo contiene los valores permitidos para cada atributo.

UbicacionPersonalizacion define los lugares donde se puede registrar una personalización, como pecho, espalda, cuello o mangas.

### Grupos, participantes y prendas

Grupo representa una agrupación dentro del pedido. Guarda la cantidad contratada, el tipo de producto, la política de numeración y observaciones.

ValorConfiguracion almacena la configuración general de un grupo, con un valor para cada atributo.

Participante representa a una persona asociada a un grupo. Tiene nombre, estado, token de enlace, fecha de expiración, revocación y fechas de registro y confirmación.

Prenda es la unidad contable del sistema. Guarda participante, grupo, producto, talla, nombre en la prenda, número, género, tipo de prenda, color, indicador de arquero y política de numeración.

ExcepcionPrenda guarda únicamente las diferencias entre la configuración general del grupo y una prenda específica.

Personalizacion guarda el texto vinculante de una prenda junto con la ubicación exacta donde debe aplicarse.

### Diseño y auditoría

Diseno permite manejar varias versiones de diseño por pedido, con estado, archivos, imágenes y aprobación.

RegistroCambio conserva quién cambió una entidad, qué campo fue afectado, el valor anterior, el valor nuevo, el origen del cambio y la cantidad de prendas afectadas cuando corresponde.

EventoGhl deja preparada una cola de eventos para una futura integración con GoHighLevel. Incluye identificador externo único, tipo, payload, estado de procesamiento, intentos y último error.

### Reglas comerciales y producción

ColorPedido registra los colores del pedido, su nombre, código hexadecimal y referencia física.

Tarifa concentra los precios vigentes para productos, tallas, telas, cuellos, acabados, adicionales y costos internos.

Confirmacion conserva versiones de la confirmación comercial con totales congelados, recargos, adelanto sugerido, adelanto recibido, saldo, comprobante y documento PDF.

DatosEnvio contiene los siete datos necesarios para rotular un envío: nombre completo, documento, celular, ciudad, agencia, referencia y correo.

Nesting representa una impresión que puede mezclar piezas de varios pedidos. Guarda código, tela, ancho de impresión, fecha y responsable.

NestingParte divide el nesting en partes y asigna cada parte a un pedido mediante sus medidas reales de ancho y largo.

ArchivoTif registra archivos TIF divididos por serie para manejar impresiones largas. Guarda nombre, largo, posición dentro de la serie, total de archivos y fecha de entrega.

## Migración inicial de PostgreSQL

La migración 20260910175601_init_sipes_core crea todas las enumeraciones y tablas del núcleo SIPES.

La migración crea las claves primarias de cada entidad, relaciones entre tablas, valores predeterminados, campos opcionales, índices y restricciones únicas definidas en el esquema Prisma.

Entre las restricciones principales se encuentran los códigos únicos de pedidos, productos, participantes, eventos externos, nestings y archivos TIF. También se incluyen claves compuestas para evitar duplicar versiones, configuraciones, excepciones, personalizaciones y partes de un nesting.

Las relaciones de detalle con pedido, grupo, participante, prenda y nesting utilizan borrado en cascada donde el modelo lo requiere. Esto permite eliminar información dependiente sin dejar registros huérfanos en los casos previstos por el diseño.

## Restricciones SQL adicionales

01_constraints.sql complementa la migración inicial con reglas de integridad que necesitan SQL de PostgreSQL.

La fecha de compromiso debe ser posterior a la fecha del pedido.

La numeración puede ser libre o única según la política del grupo. La unicidad se aplica por grupo, ignora valores vacíos y permite repetir el valor S/N.

Los cambios de política de numeración se propagan a las prendas mediante un trigger.

Las prendas nuevas heredan automáticamente la política de numeración de su grupo.

Una excepción no puede repetir el mismo valor que ya tiene la configuración general del grupo.

No se permite modificar prendas, participantes, excepciones ni personalizaciones cuando el bloque Lista está cerrado.

El registro de cambios y las versiones de bloques se protegen contra actualización y eliminación para conservar el historial.

La función de acuse de recibo permite registrar de manera controlada que diseño o producción revisaron una versión.

No se puede aprobar un diseño si existe un color sin código hexadecimal.

El código hexadecimal de color debe cumplir el formato de seis dígitos precedidos por el signo numeral.

El adelanto recibido debe estar entre cero y el total sin impuesto.

El saldo debe coincidir con el total sin impuesto menos el adelanto recibido.

Los totales y recargos no pueden ser negativos.

Solo puede existir una tarifa vigente y activa por tipo y concepto.

El valor de una tarifa no puede ser negativo.

El ancho ocupado por una parte de nesting debe ser mayor que cero y no superar 180 centímetros.

El largo ocupado por una parte de nesting debe ser mayor que cero.

La serie de archivos TIF debe tener posiciones y cantidades válidas.

El largo de un archivo TIF debe ser mayor que cero.

Las reglas de cálculo de confirmaciones, mínimos de venta, consumo real de tela, resumen de producción y permisos por rol todavía requieren implementación en servicios y pruebas.

## API disponible

La aplicación se ejecuta en el puerto 3000 por defecto.

Ruta de documentación Swagger:

http://localhost:3000/api/docs

Ruta para obtener la cabecera y el resumen del pedido de prueba:

GET /api/pedidos/mock/PROMO-2002

La respuesta contiene el código SUB-00842, el cliente Promoción 2002 San José, el estado de confirmación, fechas, colores y resumen de producción.

Ruta para obtener las prendas del pedido de prueba:

GET /api/pedidos/mock/PROMO-2002/prendas

La respuesta contiene 28 registros con identificador, grupo, persona, número, talla, tipo, género y corte.

El pedido de prueba contiene 17 conjuntos y 11 camisetas. El resumen expone 28 filas contables y 62 piezas físicas, 17 shorts y 17 medias.

## Configuración aplicada al servidor

Se habilitó CORS para permitir solicitudes desde cualquier origen durante esta etapa de desarrollo.

Se configuró ValidationPipe con lista blanca, transformación automática y rechazo de propiedades no declaradas.

Se configuró Swagger con el título SIPES API Sublitex, versión 1.0 y etiquetas para pedidos, clientes y grupos.

## Ejecución comprobada

La compilación en modo observación terminó correctamente.

Resultado registrado:

Starting compilation in watch mode

Found 0 errors. Watching for file changes.

La aplicación NestJS inició correctamente y cargó AppModule.

Las rutas registradas fueron:

- GET /api/pedidos/mock/PROMO-2002
- GET /api/pedidos/mock/PROMO-2002/prendas

El servidor quedó disponible en http://localhost:3000.

Swagger quedó disponible en http://localhost:3000/api/docs.

## Publicación en Git

Se ejecutaron los siguientes pasos:

git add .

git commit -m "feat: swagger y mock"

git push origin main

El envío terminó correctamente. La rama local main quedó alineada con origin/main en el commit c9c0b9b.

## Estado actual

El proyecto tiene una base backend funcional para continuar el desarrollo.

La API actual expone datos mock y todavía no conecta los endpoints con operaciones reales de Prisma.

La migración inicial y las restricciones SQL ya definen una base sólida para los datos reales.

La integración con GoHighLevel está preparada en el modelo, pero permanece aplazada.

El siguiente trabajo debe enfocarse en conectar Prisma con NestJS, crear servicios y repositorios para pedidos, implementar autenticación y permisos, agregar DTOs reales, incorporar los flujos de cierre y reapertura de bloques, probar las restricciones SQL y reemplazar gradualmente los datos mock.


## Especificacion del contrato de API

Se formalizo y documento el contrato de API en el archivo contrato-api.md para establecer la integracion tecnica con el equipo de Frontend, cubriendo las responsabilidades asignadas al rol BK1 (Guardian de Arquitectura).

El contrato define las operaciones y estructuras de datos para las tres tablas nucleares a su cargo:

- Tabla Cliente: Creacion y listado de clientes u organizaciones (promociones, colegios, empresas), especificando datos de contacto y tipo de cliente.
- Tabla Pedido: Creacion de la cabecera del pedido con codigo unico legible (SUB-00842), asociacion con cliente y coordinador, gestion de fecha de compromiso (R-A09) y actualizacion del ciclo de vida del pedido.
- Tabla Grupo: Registro de grupos de prendas dentro de un pedido con tipo de producto asignado, cantidad contratada (R-B02) y definicion de la politica de numeracion (LIBRE o UNICA, R-G01) con propagacion a prendas.

Para cada endpoint se especifico el metodo HTTP, ruta, estructura JSON de entrada (Request Body) con validaciones de tipo, ejemplos de respuesta JSON de salida (Response Body) con codigos de estado (200 OK, 201 Created) y la tabla de codigos de error globales (400, 404, 409, 422).
