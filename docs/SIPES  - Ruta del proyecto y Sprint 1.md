**SUBLITEX**

**Manual del proyecto SIPES**

SIstema de PEdidos Sublitex

&nbsp;

Versión 1.0 · 16 de septiembre de 2026 · Reemplaza a los tres documentos separados que circularon antes.

&nbsp;

| Hoy solo lees la sección 1 Son tres páginas y toma diez minutos. Con eso alcanza para arrancar el primer día. Las secciones 2 y 3 se consultan cuando las necesitas, no se leen de corrido. La sección 4 la lees el jueves, antes del primer cierre. |
| :---- |

&nbsp;

# **Las cuatro secciones**

|  | Sección | Quién la lee | Cuándo |
| :---- | :---- | :---- | :---- |
| 1 | Cómo empezar | Los cinco | El primer día, completa |
| 2 | La ruta y el sprint 1 | Los cinco | Tu parte el primer día; el resto se consulta |
| 3 | El modelo de datos, explicado | Backend: entera Frontend: solo las siete decisiones | Antes de abrir el código |
| 4 | El reporte del viernes | El guardián la usa; los demás la leen una vez | Antes del primer viernes |

&nbsp;

# **Lo que no está en este manual**

Dos cosas viven fuera, y es a propósito:

* El catálogo de reglas es el otro documento de Drive. Es el contrato del proyecto: se busca por identificador, no se lee de corrido, y por eso no se mezcla con este manual. Nadie del equipo lo edita.

* El código —schema.prisma, 01\_constraints.sql, los datos de prueba y la plantilla del reporte— vive en el repositorio. No va a Drive: si está en Drive, nadie lo usa y se desactualiza.

**SECCIÓN 1**

**Cómo empezar**

Esto es lo único que se lee el primer día. Toma diez minutos y no hace falta nada más para arrancar.

&nbsp;

# **Qué construimos**

Un sistema para que un dato del pedido se escriba una sola vez y lo lean ventas, diseño y producción sin volver a teclearlo.

**Hoy eso vive en WhatsApp y se pierde.** En un pedido real de veintiocho prendas, la palabra «corte» no apareció en ninguna de las cuatro confirmaciones. Seis participantes eran mujeres. Las camisetas se imprimieron rectas y el cliente reclamó. Todo lo que vas a construir existe para que eso no pueda pasar.

# **Tu primer día, en este orden**

| \# | Qué | Quién | Cuánto |
| :---- | :---- | :---- | :---- |
| 1 | Catálogo de reglas — el otro documento de Drive, completo y de principio a fin | Todos | 45 min |
| 2 | Sección 2 de este manual — ahí está tu frente y tus reglas | Todos | 20 min |
| 3 | Hoja de pedido en Excel — ábrela y carga una prenda de prueba | Todos | 20 min |
| 4 | Sección 3 de este manual | Backend: entera Frontend: solo las siete decisiones | 40 / 15 min |
| 5 | Escribe en UNA línea qué hace tu frente. Se leen en voz alta y se comparan. | Todos juntos | 30 min |

&nbsp;

| El paso 5 es el que importa Si dos personas describen lo mismo de forma distinta, ahí está el problema que costaría dos semanas descubrir después. No se pasa a programar hasta que las cinco frases encajen. |
| :---- |

# **Todo lo que existe, y dónde está**

Son tres cosas en Drive y cuatro archivos en el repositorio. Nada más. Si alguien te pasa un documento que no está en esta lista, no es del proyecto.

&nbsp;

| Qué | Dónde | Para qué sirve | Quién lo edita |
| :---- | :---- | :---- | :---- |
| Este manual | Drive | Las cuatro secciones: cómo empezar, la ruta, el modelo y el reporte del viernes. | Solo el guardián |
| Catálogo de reglas | Drive | Qué tiene que ser verdad en el sistema. El identificador de cada regla es el nombre de tu test. | Solo el guardián |
| Hoja de pedido (Excel) | Drive | Lo que hoy hacen las vendedoras a mano. Para frontend es la especificación de las pantallas. | Nadie del equipo |
| schema.prisma | Repositorio | El modelo, en código. | Solo el guardián |
| 01\_constraints.sql | Repositorio | Lo que garantiza la base de datos. Te dice qué NO tienes que validar tú. | Solo el guardián |
| PROMO2002\_prendas.csv | Repositorio | Las 28 filas del pedido real, para montar el simulador sin inventar datos. | Nadie |
| REPORTE-SEMANA-N.md | Repositorio | La plantilla de lo que se entrega cada viernes. Está en docs/reportes/. | El guardián la llena |

# **Los cuatro frentes**

| Frente | Quién | Qué hace | Entrega en el sprint 1 |
| :---- | :---- | :---- | :---- |
| Guardián | Backend 1 | Único que toca el catálogo y el esquema. Monta el repositorio, la base de datos y la integración continua. Después implementa cliente, pedido y grupos. | Repositorio corriendo Reglas A y B en verde |
| Backend | Backend 2 | Participantes y prendas. El corazón del sprint: que la prenda sea la unidad que se cuenta y que ningún total se escriba a mano. | Reglas D, E y K en verde |
| Frontend · base | Frontend 1 | Layout, navegación y sistema de diseño reaprovechando Arte Ideas. Lista de pedidos y detalle de cabecera. | Shell y lista funcionando contra la API real |
| Frontend · tabla | Frontend 2 y 3, en par | La tabla de prendas: veintiocho filas con talla, número, color, género y corte, edición en línea, y las excepciones visiblemente distintas de lo heredado. | La tabla mostrando el pedido real |

&nbsp;

| Frontend no espera al backend El día tres los backend entregan el contrato de la API: qué recibe y qué devuelve cada endpoint, con un ejemplo real de respuesta. Desde ahí el frontend trabaja contra un simulador que devuelve esa forma. Se juntan en la integración de la segunda semana. |
| :---- |

# **Las cinco reglas**

* Terminado es tus reglas en verde. No «ya lo subí», no «funciona en mi máquina», no «el endpoint responde 200».

* Si la integración continua falla, la rama no entra. Sin excepciones y sin permiso especial.

* Quien implementa una regla no escribe el test de esa regla. Lo escribe otro, antes.

* Antes de pedirle código a la IA, escribe en dos líneas qué esperas que haga. Sin eso vas a aceptar lo primero que suene convincente.

* Nada que no tenga regla. Si se te ocurre agregar algo que el catálogo no pide, anótalo para el sprint siguiente y sigue.

# **Cómo reportas tu avance**

Dos commits por bloque de trabajo, y un pull request al cerrar el día.

git commit \-m "SIPES-J1-A"

git commit \-m "feat(R-E03): ficha minima de la prenda"

El primero marca tu checklist, el segundo sube el código y lleva el identificador de la regla. Así se ve el avance sin que nadie pregunte.

**En el pull request escribe cuatro líneas:** qué hiciste, por qué lo hiciste así y qué probaste. Sin pegar código. Quien lo revisa no aprueba hasta poder explicarlo con sus palabras.

# **Lo que se entrega el viernes**

Una sola cosa por semana, para todo el equipo: el archivo REPORTE-SEMANA-N.md. Lo arma el guardián juntando lo de los cinco, antes de las seis de la tarde, y se guarda en docs/reportes/ del repositorio.

**La mitad de ese reporte no se escribe: se pega.** Son salidas de comandos — los tests que corren, qué reglas tienen test, los ocho triggers de la base, los commits de la semana, el estado de la integración continua y el contrato de la API tal como quedó. La otra mitad son cuatro preguntas de dos líneas que responde cada uno.

&nbsp;

| Las cuatro preguntas | Qué NO es una respuesta |
| :---- | :---- |
| Qué entregué, nombrando las reglas por su identificador. | «Terminé la tabla». La entrega es «R-E03 y R-E05 en verde». |
| Qué no llegué a entregar, y por qué. | «Nada». Si entregaste todo, te asignamos poco y hay que saberlo. |
| Qué regla me pareció ambigua o imposible de probar. | Callarse. Reportarla mejora la especificación; no es una queja. |
| Dónde me trabé más de treinta minutos, y cómo salí. | Esconderlo. El bloqueo es un dato; quedarse callado tres horas sí es una falta. |

&nbsp;

| Por qué el reporte es así Porque el identificador de la regla es el nombre del test, la lista de tests que corren es la única prueba de qué existe de verdad en el sistema. Eso no se puede fingir y no hace falta discutirlo. El lunes siguiente vuelven tres correcciones concretas. Tres, no quince. Y entran antes que cualquier funcionalidad nueva. |
| :---- |

# **Si te trabas**

* Más de treinta minutos bloqueado: escríbelo en el canal del equipo y pasa a otra cosa. El bloqueo es un dato, no una espera.

* Si una regla te resulta ambigua, incompleta o imposible de probar, repórtala al guardián con el prefijo REGLA. Eso no es una queja: es la forma en que la especificación mejora.

* El esquema no se toca. Si necesitas un cambio en la base de datos, se lo pides al guardián.

**SECCIÓN 2**

**La ruta y el sprint 1**

Qué se hace en cada sprint, quién hace qué, y cómo se sabe que algo terminó. La lee todo el equipo, pero se consulta más de lo que se lee de corrido.

&nbsp;

# **La misión**

**Que un dato del pedido se escriba una sola vez, y que a partir de ahí ventas, diseño y producción lean el mismo dato sin volver a teclearlo.**

&nbsp;

Hoy un pedido de Sublitex vive en WhatsApp. La vendedora toma notas, arma una confirmación a mano, el cliente pide cambios, se arma otra confirmación, el diseñador vuelve a escribir los nombres en Corel y producción trabaja con una tercera lista. Cada copia manual es una oportunidad de error, y los errores llegan hasta la tela impresa, donde ya no se pueden corregir.

El sistema no existe para tener más funciones que el WhatsApp. Existe para que esos pedidos no se puedan armar mal.

&nbsp;

**La única métrica de éxito:** ¿cuántas veces tuvo una persona que volver a escribir un dato que ya estaba registrado? La respuesta debe ser una sola vez.

# **Qué cambió al mirar nueve pedidos reales**

Se analizaron nueve pedidos reales con sus errores anotados. Lo que sigue no son hipótesis: cada punto corresponde a algo que ya salió mal.

&nbsp;

| Hallazgo | Qué pasó | Qué cambia en el sistema |
| :---- | :---- | :---- |
| El color es el error número uno | Tres de nueve pedidos fallaron por color. «Azul oscuro» salió morado, «amarillo brasil» salió amarillo oro, «verde» salió muy oscuro. El único pedido que no falló especificó los códigos \#f7f4f2 y \#cc9933. | El color deja de ser una palabra y pasa a ser una entidad con código hexadecimal obligatorio. Sin código en todos los colores no se aprueba el diseño. |
| Se despacharon tres juegos sin las medias | El resumen decía «total camisetas 22» y «total shorts 3». Medias no aparecía por ningún lado. | Cada producto declara cuántas camisetas, shorts y medias contiene. Los resúmenes de producción se calculan multiplicando, no contando unidades. |
| Género, corte y cuello son tres cosas | En un pedido había mujeres con cuello V y sin corte princesa, junto a mujeres con corte princesa. Tratarlo como un solo campo obliga a ponérselo a todas o a ninguna. | Tres campos independientes en la prenda. En otro pedido la palabra «corte» no aparecía en ninguna de las cuatro confirmaciones, y terminó en reclamo. |
| Un nesting mezcla varios pedidos | En una misma tela se imprimieron 1497 cm de un pedido y 116 cm de otro, y hubo que repartir el consumo a mano. | El nesting es una entidad propia y cada parte apunta a su pedido. El consumo de tela de un pedido es una asignación, no un cálculo. |
| El teléfono de un auspiciador salió mal impreso | Las confirmaciones decían «sponsors correspondientes» sin escribir nunca el contenido, así que nadie pudo verificarlo. | Todo texto que se imprime vive en una ubicación declarada con su contenido literal, y viaja así a la ficha del diseñador. |
| Una camiseta agregada al final no se produjo | El cliente la pidió por chat, la hoja no se actualizó y no se fabricó. Quedó registrado: «no estaba actualizada la hoja». | Control de cambios con versión, fecha y quién lo pidió. Y el cierre declara qué entró y qué salió respecto de la versión anterior. |
| Un recargo cobrado no coincidía con la tarifa | Se cobró talla XL a S/5 cuando la matriz comercial dice S/3. | Ningún precio se escribe a mano. Sale siempre de una tarifa vigente, y solo puede haber una vigente por concepto. |

# **La ruta: cuatro sprints**

Cada sprint cierra algo que se puede demostrar en pantalla. El orden es por dependencia, no por dificultad: no se puede cerrar un pedido que todavía no se puede armar.

&nbsp;

| Sprint | Título | Objetivo verificable | Reglas |
| :---- | :---- | :---- | :---- |
| 1 Sem. 1–2 | El pedido existe y no se puede romper | Se carga el pedido PROMO 2002 por API y el sistema responde 17 conjuntos, 11 camisetas y 28 prendas, calculados. CLINT aparece una sola vez como persona, con dos prendas de colores distintos. | Bloques A, B, D, E 41 reglas |
| 2 Sem. 3–4 | El pedido admite excepciones sin volverse un caos | Las seis prendas con corte femenino existen como excepción sin tocar las otras veintidós. Los cuatro números 7 conviven. Guardar «Johnatan» sin decir en qué manga falla. | Bloques C, F, G 21 reglas |
| 3 Sem. 5–6 | El pedido se cierra y queda constancia | El sistema emite la confirmación calculada, con todos los atributos críticos impresos aunque tomen su valor por defecto. Reabrir genera una versión que declara altas y bajas. | Bloques H, I 23 reglas |
| 4 Sem. 7–8 | Cada rol ve lo suyo y el jugador registra desde su teléfono | Un jugador entra por enlace sin contraseña, elige talla y número y confirma en menos de un minuto. El diseñador exporta la lista y no vuelve a teclear ningún nombre. | Bloque J 8 reglas más interfaz |

&nbsp;

| El bloque K entra en el sprint 2 Las reglas nuevas de color, componentes físicos, género, tipo de prenda y tarifas se reparten entre los sprints 1 y 2 según a qué bloque pertenecen. El bloque de nesting, tela y archivos TIF va después del sprint 4: es información que se genera cuando el diseño ya existe, así que no bloquea nada del núcleo. |
| :---- |

# **Sprint 1: equipos, roles y misión**

El equipo son cinco practicantes: tres de frontend y dos de backend. Esa composición obliga a una decisión que define todo el sprint.

**El contrato de la API se define antes de implementarlo.** El sprint 1 es casi todo backend, así que si el frontend espera a que la API exista, tres personas se quedan dos semanas sin trabajo real. En los dos primeros días los backend y el guardián escriben la forma exacta de cada endpoint: qué recibe y qué devuelve. Eso sale casi directo de las reglas y del modelo, no hay que inventarlo.

Con ese contrato en la mano, los tres frontend arrancan contra un simulador que devuelve esa forma, sin esperar a nadie. Se encuentran en la integración.

&nbsp;

| Frente | Quién | Misión | Trabaja con |
| :---- | :---- | :---- | :---- |
| Guardián · fundación · pedido y grupos | Backend 1, el más sólido | Que los otros cuatro puedan trabajar sin esperar a nadie, y que al final del sprint el catálogo siga describiendo la realidad. Monta el repositorio, la base de datos y la integración continua. Después implementa cliente, pedido y grupos. Es el único que toca el esquema. | R-A03, A05, A06, A09, A10 R-B01 a B09 Más la guardianía |
| Backend · participantes y prendas | Backend 2 | Que la prenda, y no la persona, sea la unidad que se cuenta, y que ningún total del sistema se escriba nunca a mano. Es el corazón del sprint: si sale bien, el conteo de camisetas nunca vuelve a decir ocho cuando son diez. | R-D01 a D09 R-E01 a E08 R-K02, K03, K04 |
| Frontend · shell y lista de pedidos | Frontend 1 | Que exista el esqueleto de la aplicación y que un pedido se pueda encontrar y abrir. Layout, navegación y sistema de diseño reaprovechando lo de Arte Ideas, más la lista de pedidos con sus filtros y el detalle de cabecera. | Contrato de API Pestaña PROFORMA del Excel |
| Frontend · la tabla de prendas | Frontend 2 y 3, en par | La pantalla más difícil de todo el sistema. Veintiocho filas con talla, número, color, género y corte, con edición en línea, y con las excepciones mostradas visiblemente distintas de los valores heredados de la configuración general. | Contrato de API Pestaña DETALLE del Excel R-C06, R-E07 |

&nbsp;

| El Excel es la especificación de las pantallas Las pestañas PROFORMA y DETALLE de la hoja de pedido definen qué campos van, qué se calcula, qué se agrupa y qué ve el cliente. Para un frontend ese archivo vale más que un wireframe: no tienen que imaginarse nada, y lo que construyan va a coincidir con lo que las vendedoras ya usan. |
| :---- |

# **El orden del trabajo**

No es un calendario. En desarrollo la duración de una tarea no se conoce hasta que se empieza, y un documento que diga «día tres: módulo de pedidos» hace que la gente se sienta atrasada cuando no lo está, y que empiece a marcar tareas como hechas para no quedar mal.

**Lo que sí se fija por adelantado es el orden y el criterio de terminado de cada cosa.** El practicante toma lo siguiente de la lista, sabe cuándo lo terminó porque tiene su criterio escrito, hace su commit y toma lo siguiente.

&nbsp;

| Orden | Qué se hace | Cómo se sabe que terminó |
| :---- | :---- | :---- |
| 1 | Arranque y alineación de vocabulario. Todos leen el catálogo de reglas completo. | Cada uno describió su frente en una línea y las descripciones no se contradicen entre sí. |
| 2 | Fundación: repositorio, base de datos, migraciones de restricciones e integración continua. | La CI corre en verde sobre una rama vacía y la base tiene los diez triggers activos. |
| 3 | CONTRATO DE API. Los dos backend y el guardián escriben la forma de cada endpoint: qué recibe y qué devuelve, con un ejemplo real de respuesta por cada uno. | Los tres frontend pueden empezar a construir contra el simulador sin hacer una sola pregunta. Es el entregable que los desbloquea. |
| 4 | Backend: tests en rojo de todas sus reglas. Frontend: shell, sistema de diseño y las pantallas contra el simulador. | Cada regla tiene su test escrito, todos en rojo, cero implementación. Las pantallas se ven y navegan con datos simulados. |
| 5 | Revisión cruzada: cada uno revisa el trabajo de otro, no el propio. | Las reglas ambiguas quedaron reportadas al guardián con el prefijo REGLA. |
| 6 | Implementación hasta poner los tests en verde y terminar las pantallas. | Los tests propios en verde, uno por uno. Nada que no tenga regla. |
| 7 | Integración: se apaga el simulador y las pantallas leen la API real con el pedido PROMO 2002 cargado. | Los conteos dan 17 conjuntos, 11 camisetas y 28 prendas, calculados, y se ven en pantalla. |
| 8 | Informe y demostración. | Media página por frente y un video con la carga del pedido sin cortes, mostrando el dato viajando desde la base hasta la pantalla. |

# **Entregables del sprint 1**

* Repositorio funcionando con Nest, Next, Prisma y Postgres, con la integración continua corriendo los tests en cada rama.

* La base de datos con sus restricciones activas: no solo las tablas, también los triggers, los índices parciales y los permisos revocados.

* Los tests en verde, uno por regla, con el identificador de la regla como nombre del test.

* El pedido PROMO 2002 cargado por seed, con sus 28 prendas, sus dos colores con código y sus resúmenes calculados.

* El contrato de la API escrito y acordado, con un ejemplo real de respuesta por cada endpoint. Es el entregable del día dos y es lo que desbloquea al frontend.

* El shell de la aplicación con su sistema de diseño, la lista de pedidos y el detalle de cabecera, funcionando contra la API real.

* La tabla de prendas mostrando las 28 filas del pedido real, con los valores heredados visiblemente distintos de las excepciones.

* Los catálogos levantados con Sublitex: productos con sus componentes, tallas con recargos, telas, cuellos, acabados y ubicaciones.

* Informe de cierre por frente: reglas en verde, reglas pendientes con motivo, incidencias, y reglas del catálogo que resultaron mal escritas.

# **Las reglas de trabajo**

Existen porque durante el sprint el responsable no va a estar. Lo que lo reemplaza no es la inteligencia artificial: es la verificación automática. Un test en rojo corrige a las once de la noche de un sábado.

&nbsp;

| Regla | Qué significa |
| :---- | :---- |
| Terminado es reglas en verde | No «ya lo subí», no «funciona en mi máquina», no «el endpoint responde 200». Esa métrica es la que dejó al sistema anterior con noventa y cinco endpoints aprobados aceptando montos negativos. |
| Si la CI falla, la rama no entra | Sin excepciones ni permisos especiales. Es la única regla que hace innecesaria la revisión diaria, porque no requiere el criterio de nadie. |
| Quien implementa no escribe su test | Vale para personas y sobre todo para agentes: quien escribe ambos escribe una prueba que su propio código pasa. |
| Predice antes de pedirle a la IA | Dos líneas en un archivo de texto. Sin predicción no hay forma de juzgar lo que devolvió el agente, y se termina aceptando lo primero que suene convincente. |
| Nada que no tenga regla | Si aparece la idea de agregar algo que el catálogo no pide, se anota para el sprint siguiente y se sigue. |

# **Las reglas nuevas: bloque K**

Quince reglas que salieron del análisis de los pedidos reales. Todavía no están dentro del catálogo publicado; el guardián las incorpora en la primera jornada del sprint. Los identificadores ya están congelados.

&nbsp;

| ID | Regla |
| :---- | :---- |
| R-K01 | El género de la persona, el corte de la prenda y el cuello son tres campos independientes. |
| R-K02 | Una prenda de obsequio o de muestra se fabrica y cuenta para producción, pero no entra en el importe. |
| R-K03 | Cada producto declara cuántas camisetas, shorts y medias contiene. Los resúmenes de producción se calculan multiplicando por esos números, nunca contando unidades. |
| R-K04 | El número de la prenda es texto. «S/N» es un valor válido y distinto de «número pendiente». |
| R-K05 | Un color siempre lleva código hexadecimal. Sin código en todos los colores no se aprueba el diseño. |
| R-K06 | La confirmación al cliente es un documento versionado con sus totales congelados, emitido por el sistema. |
| R-K07 | El adelanto sugerido se calcula; el adelanto recibido se registra. Son dos campos distintos. |
| R-K08 | No se despacha a provincia sin los siete datos de rotulado completos. |
| R-K09 | El pedido mínimo es de doce unidades de venta. Las de obsequio y muestra no cuentan para el mínimo. |
| R-K10 | Ningún precio se escribe a mano. Sale de una tarifa vigente, y solo hay una vigente por concepto. |
| R-K11 | Un nesting puede mezclar piezas de varios pedidos. El consumo de cada pedido es la suma de sus propias partes. |
| R-K12 | El ancho de impresión es fijo en 1.80 metros. Lo que varía es el largo. |
| R-K13 | Un nesting largo se exporta partido en varios archivos TIF, y el nombre lleva el pedido, la tela, el largo y su lugar en la serie. |
| R-K14 | El costo de impresión es metros lineales por la tarifa vigente, que hoy incluye impresión, calandra y corte láser. |
| R-K15 | El consumo de tela de un pedido es una asignación, no un cálculo: depende de con qué otros pedidos entró al nesting. |

# **Quién usa qué**

El inventario completo está en la sección 1\. Acá está lo otro: qué hace cada frente con cada archivo, que es lo que de verdad se pregunta.

&nbsp;

| Archivo | Los 2 backend | Los 3 frontend | El guardián |
| :---- | :---- | :---- | :---- |
| Catálogo de reglas | Lo leen completo. Es su fuente de verdad y el nombre de sus tests. | Lo leen completo el primer día. Después consultan solo los bloques de sus pantallas. | Lo mantiene. Único que lo edita. |
| Este manual | Secciones 1 y 2 al empezar, la 3 entera antes de tocar código. | Secciones 1 y 2 al empezar; de la 3, solo las siete decisiones estructurales. | Lo relee al abrir cada sprint. Único que lo edita. |
| schema.prisma | Lo leen y lo consultan a diario. No lo editan: piden el cambio. | No lo abren. | Único que lo edita. |
| 01\_constraints.sql | Lo leen para saber qué garantiza la base y qué les toca a ellos en tests. | No lo abren. | Lo aplica en la jornada de fundación. |
| PROMO2002\_prendas.csv | Lo usan para sembrar la base con datos reales. | Es lo que devuelve el simulador mientras la API no existe. | — |
| Hoja de pedido | La abren para entender los cálculos que van a implementar. | La usan como especificación de pantalla. | — |

&nbsp;

| Por qué el código no se copia a Drive El esquema, las restricciones y los datos de prueba viven solo en el repositorio. Si existen en dos lados, en tres semanas no coinciden y alguien va a programar contra el equivocado. |
| :---- |

## **Versiones**

Para saber si el manual explica el mismo estado que el código, todo comparte fecha de corte.

| Qué | Versión | Fecha de corte |
| :---- | :---- | :---- |
| Manual del proyecto (este) | 1.0 | 16/09/2026 |
| Catálogo de reglas | 0.2 \+ bloque K | 16/09/2026 |
| schema.prisma | 0.2 \+ bloque K | 16/09/2026 |
| 01\_constraints.sql | 14 reglas · 8 triggers | 16/09/2026 |

# **Decisiones cerradas tras la primera semana**

El equipo revisó el paquete y reportó observaciones. Cuatro eran errores reales de esta documentación y ya están corregidos; las demás eran decisiones de alcance que estaban abiertas y aquí quedan cerradas.

&nbsp;

| Observación | Quién | Decisión |
| :---- | :---- | :---- |
| «La base tiene los diez triggers» — el SQL define 8 | Frontend 3 | ERROR CONFIRMADO. Son 8\. La cabecera del SQL ahora lleva el inventario nombre por nombre y la consulta a pg\_trigger para verificarlo. El criterio de la fundación ya es comprobable. |
| La cabecera del SQL dice «estas cinco reglas» y el archivo implementa muchas más | Frontend 3 | ERROR CONFIRMADO. Corregido: 14 reglas mediante 8 triggers, 1 índice parcial, 10 CHECK y 2 revocaciones. |
| A la misión de la tabla de prendas le falta «cuello» | Frontend 3 | ERROR CONFIRMADO. R-K01 define género, corte y cuello como tres campos independientes y la misión solo nombraba dos. CUELLO VA COMO COLUMNA PROPIA, no combinado con corte. Corregido en la sección 4\. |
| El Excel DETALLE no llegó en el paquete | Frontend 3 | RESUELTO. Se entrega el libro con el pedido PROMO 2002 realmente cargado —28 filas— más un CSV de las mismas filas para montar el simulador. Ya no hay que imaginar nada. |
| Contradicción: el bloque C es sprint 2, pero a la tabla se le asigna R-C06 y la demo exige mostrar a CLINT | Frontend 3 | DECISIÓN. CLINT no es una excepción: son dos prendas de una misma persona en dos colores distintos, cada una heredando el color de su propia fila (R-D01 \+ R-E05). R-C06 se queda en el sprint 1, pero solo como capacidad visual: la tabla se construye sabiendo distinguir heredado de excepción, y en el sprint 1 los datos no traen ninguna excepción, así que se ve uniforme. Crear y editar excepciones es sprint 2\. |
| «PEDISOS» en el título y SIPES expandido de dos formas | Frontend 3 | ERROR CONFIRMADO. El acrónimo estaba expandido de dos maneras y ninguna daba sus letras: el esquema decía «Sistema de Gestión Operativa de Pedidos Sublitex» y el catálogo decía «núcleo del sistema de pedidos». De ahí salía la confusión al intentar armar las siglas. QUEDA FIJADO: SIPES \= SIstema de PEdidos Sublitex. La definición vive en el catálogo de reglas y todos los demás archivos la repiten sin variarla. |
| «28 prendas físicas, 17 shorts y 17 medias» | Backend 1 | PRECISIÓN NECESARIA. Son 28 FILAS de prenda y 62 PIEZAS físicas: 28 camisetas, 17 shorts y 17 medias. Frontend 2 lo reportó bien. El glosario decía «Prenda: la unidad física que se fabrica», lo cual inducía al error, y se corrigió a «la unidad contable; sus piezas físicas salen del producto». |

&nbsp;

| Sobre el Excel y el sistema La hoja de pedido no es un parche temporal que se tira cuando el sistema esté listo. Es la especificación funcional más concreta que tiene el proyecto: si el equipo entiende cómo funciona esa hoja, entiende lo que el sistema tiene que hacer. Vale la pena que la abran y la usen en la primera jornada. |
| :---- |

**SECCIÓN 3**

**El modelo de datos, explicado**

Por qué el modelo es así. Los dos backend la leen entera; los tres frontend, solo las siete decisiones estructurales.

&nbsp;

# **Para qué sirve este documento**

El modelo de datos vive en un archivo llamado schema.prisma, que es código y se abre con VS Code dentro del repositorio. Este documento explica lo mismo en palabras, para que el equipo entienda las decisiones antes de leer una sola línea.

**Una advertencia que importa:** el schema no alcanza por sí solo. Diez reglas críticas del sistema solo se pueden garantizar con las restricciones del archivo 01\_constraints.sql. Sin ellas, el modelo permite exactamente los errores que el sistema existe para evitar.

# **Las siete decisiones estructurales**

Estas son las decisiones que después son carísimas de cambiar. Cada una responde a un error real.

### **1\. Las excepciones se guardan como diferencia, nunca como valor copiado**

La configuración general vive en el grupo. Si una prenda tiene un valor distinto, se guarda solo esa diferencia. El valor efectivo se resuelve al leer: la excepción si existe, y si no, el valor general.

Si se copiara el valor general a cada prenda, cambiar la configuración general dejaría prendas con valores viejos que nadie sabría por qué son distintos. Es la decisión más importante del modelo.

### **2\. La prenda, no la persona, es la unidad que se cuenta**

Una persona puede tener varias prendas. En un pedido real, un mismo participante tenía un conjunto blanco y una camiseta azul, ambos con el número 69\. Modelarlo con una prenda por persona hace imposible representar ese pedido.

Todos los resúmenes — por talla, por producto, por color, por componente — se calculan sobre prendas.

### **3\. Cada producto declara sus piezas físicas**

Un kit completo son una camiseta, un short y un par de medias. El producto lo declara, y producción multiplica. En un pedido real se despacharon tres juegos sin las medias porque el resumen no tenía la línea de medias: nadie las olvidó, el campo no existía.

### **4\. El color es una entidad con código, no una palabra**

Tres de nueve pedidos fallaron por color. El único que no falló especificó los códigos hexadecimales. Por eso el color del pedido es una tabla propia con nombre, código y referencia física, y el diseño no se aprueba si algún color no tiene su código.

### **5\. El número de la prenda es texto**

«S/N» es un valor real que aparece en pedidos históricos, y es distinto de «número pendiente». Un número entero no puede representar esa diferencia.

Además, los números se repiten y eso es normal: en un pedido de veintiocho prendas había cuatro personas con el número 7 y cuatro con el 8\. La unicidad es una política que se activa por grupo, no la regla general.

### **6\. El nesting es una entidad propia y sus partes apuntan a su pedido**

En una misma tela se imprimieron mil cuatrocientos noventa y siete centímetros de un pedido y ciento dieciséis de otro. El consumo de tela de un pedido no se puede calcular solo: depende de con qué otros pedidos entró al nesting. Es una asignación, no un cálculo.

Si el sistema cargara el total del nesting a un solo pedido, el costo de ese pedido quedaría inflado y el del otro en cero.

### **7\. Ningún precio se escribe en el pedido**

Los precios y recargos viven en un catálogo de tarifas con vigencia, y solo puede haber una vigente por concepto. En un pedido real se cobró el recargo de talla XL a cinco soles cuando la tarifa oficial es tres, y nadie lo notó porque el precio se escribía a mano.

# **Las entidades, en palabras**

## **El pedido y su estructura**

| Entidad | Qué representa |
| :---- | :---- |
| Cliente | Una organización o grupo: el colegio, la promoción, el club. No es una persona. |
| Pedido | El acuerdo completo. Tiene un código legible porque va a viajar por WhatsApp igual. |
| Grupo | Conjunto de participantes que comparten una configuración general. Es el nivel donde vive la configuración, no el pedido. |
| Participante | La persona que recibe prendas. Pertenece a un grupo y puede tener una o varias prendas. |
| Prenda | La unidad CONTABLE: una línea de prenda. Lleva producto, talla, número, color, género, corte, cuello y tipo. Sus piezas físicas —camisetas, shorts, medias— salen del producto, no de contar filas: las 28 filas del pedido PROMO 2002 son 62 piezas. |

## **La configuración y sus excepciones**

| Entidad | Qué representa |
| :---- | :---- |
| Atributo | Una característica de catálogo cerrado: tela, color, cuello, manga, corte, escudo. |
| ValorConfiguracion | El valor por defecto de cada atributo para todas las prendas del grupo. |
| ExcepcionPrenda | Un valor distinto para una prenda concreta. Se guarda como terna: prenda, atributo, valor. |
| Personalizacion | Texto libre estampado en una ubicación declarada. Es vinculante para producción y se muestra con la ortografía exacta con que se registró. |
| ColorPedido | Un color del pedido con su nombre, su código hexadecimal y su referencia física. |

## **El cierre y la constancia**

| Entidad | Qué representa |
| :---- | :---- |
| BloquePedido | Diseño, Lista y Comercial. Se cierran de forma independiente, cada uno con su candado. |
| VersionBloque | Copia inmutable de un bloque al cerrarlo. Diseño y producción trabajan siempre contra una versión declarada. |
| Confirmacion | El documento que se envía al cliente, con sus totales calculados y congelados. Es versionado: en un pedido real circularon cuatro confirmaciones sucesivas. |
| RegistroCambio | Qué campo, valor anterior, valor nuevo, quién, cuándo y desde qué rol. Solo se agrega, nunca se edita ni se borra. |

## **La producción y la tela**

| Entidad | Qué representa |
| :---- | :---- |
| Nesting | La organización de piezas sobre una tela. Puede mezclar piezas de varios pedidos. |
| NestingParte | Cada parte con su ancho ocupado, su largo y el pedido al que se le carga. La diferencia entre el ancho ocupado y los ciento ochenta centímetros es el desperdicio lateral. |
| ArchivoTif | Un archivo de exportación. Un nesting largo se parte en varios porque un archivo de más de cinco metros es inmanejable por peso. |
| Tarifa | Precio o recargo con vigencia. También guarda los costos internos, como el metro lineal de impresión. |

# **Qué garantiza la base de datos y qué garantizan los tests**

Toda regla que diga «para todos, sin excepción, incluido el administrador» tiene que vivir en la base de datos. Cualquier otra capa tiene un camino alrededor: un script de mantenimiento, una consola de administración, una importación masiva.

&nbsp;

### **Lo garantiza Postgres**

* La unicidad del número dentro del grupo, cuando la política del grupo lo exige, mediante un índice único parcial.

* Que un bloque cerrado no se pueda modificar, mediante un trigger sobre prendas, participantes, excepciones y personalizaciones.

* Que una excepción no pueda ser idéntica al valor general del grupo.

* Que el historial y las versiones no se puedan editar ni borrar, quitando el permiso.

* Que no se apruebe un diseño con algún color sin código hexadecimal.

* Que el adelanto recibido nunca exceda el total y que el saldo cuadre.

* Que solo haya una tarifa vigente por concepto.

&nbsp;

### **Lo garantizan los tests**

* Que cambiar la configuración general no pise las excepciones existentes.

* Que el valor efectivo se resuelva al leer y nunca se copie.

* Que todos los resúmenes se calculen sobre prendas y ningún conteo se escriba a mano.

* Que la confirmación la emita el sistema y que imprima los atributos críticos aunque tomen su valor por defecto.

* Que el cierre declare qué participantes entraron y cuáles salieron respecto de la versión anterior.

* Que los permisos se apliquen en la consulta a la base de datos y no en el controlador.

&nbsp;

| La lección de Arte Ideas En el sistema anterior los permisos vivían en la vista y no en la consulta. Por eso un superusuario leía los clientes de otro cliente. Un solo lugar equivocado y toda la matriz de roles queda decorativa. |
| :---- |

# **Cómo generar el diagrama**

El diagrama entidad-relación no se dibuja a mano: se genera desde el mismo schema, así nunca queda desactualizado. Dentro del repositorio:

npm i \-D prisma-erd-generator @mermaid-js/mermaid-cli

Después se descomenta el bloque del generador que está al inicio del archivo schema.prisma y se corre la generación de Prisma. El diagrama sale en la carpeta de documentación.

**SECCIÓN 4**

**El reporte del viernes**

Lo único que se entrega cada semana. Lo arma el guardián juntando lo de los cinco.

&nbsp;

# **La regla de este documento**

**Nada que un comando pueda responder se escribe a mano.**&nbsp;

Si dice «avanzamos bien» y no hay una salida de comando que lo respalde, no cuenta como avance. La mitad del reporte no se redacta: se pega.

&nbsp;

La plantilla en blanco está en el repositorio, en docs/reportes/REPORTE-SEMANA-N.md. Se llena ahí, se commitea, y se entrega el texto.

# **Parte 1 · Lo que dice la máquina**

Lo corre el guardián sobre la rama principal —no sobre la de nadie— y pega las siete salidas tal cual, sin recortar los fallos.

&nbsp;

| Qué se pega | Para qué |
| :---- | :---- |
| npm test \-- \--verbose | Cuántos tests corren y cuántos pasan. Un reporte sin ningún fallo en la semana 1 es más sospechoso que uno con tres. |
| grep \-rhoE "R-\[A-K\]\[0-9\]{2}" test/ | sort \-u | Qué reglas tienen test. Como el identificador de la regla es el nombre del test, esta lista es la única prueba de qué existe de verdad. |
| Las reglas citadas en src/ que no aparecen en test/ | Debería estar vacía. Cada identificador que salga acá es código que nadie está verificando. |
| SELECT tgname FROM pg\_trigger WHERE NOT tgisinternal | Tienen que salir los ocho triggers de 01\_constraints.sql. Si salen menos, la fundación no está puesta. |
| git log \--since="7 days ago" | Quién trabajó en qué bloque, sin tener que preguntarlo. |
| El estado de la integración continua | Verde o rojo, y desde cuándo. |
| El contrato de la API tal como quedó el viernes | Con «← CAMBIÓ» marcado en cada línea que se movió desde el lunes, y por qué. |

# **Parte 2 · Lo que escribe cada persona**

Cuatro preguntas, dos líneas cada una. Si no cabe en dos líneas, es que todavía no está claro.

&nbsp;

| La pregunta | Qué NO es una respuesta |
| :---- | :---- |
| Qué entregué, nombrando las reglas por su identificador. | «Terminé la tabla». La entrega es «R-E03 y R-E05 en verde». |
| Qué no llegué a entregar, y por qué. | «Nada». Si de verdad entregaste todo, te asignamos poco y eso también hay que saberlo. |
| Qué regla me pareció ambigua, incompleta o imposible de probar. | Callarse. Se reporta con el prefijo REGLA. Si los cinco dicen «ninguna», es que nadie leyó el catálogo con cuidado. |
| Dónde me trabé más de treinta minutos, y cómo salí. | Esconderlo. El bloqueo es un dato, no una falta; quedarse callado tres horas sí lo es. |

# **Parte 3 · La pregunta de la semana**

**¿Qué cosa creíamos el lunes que resultó falsa el viernes?**

La responde el guardián en cinco líneas, hablando por el equipo. Si la respuesta es «nada», la semana no enseñó nada — y eso es un problema de la semana, no de la pregunta.

# **Lo que NO va en el reporte**

* Capturas de pantalla.

* Porcentajes de avance. No existe «70% listo»: la regla está en verde o no lo está.

* «Ya está casi», «solo falta probar», «funciona en mi máquina».

* Código pegado. Para eso está el repositorio.

* Justificaciones largas. Los motivos de lo no entregado van en dos líneas y ahí terminan.

# **Qué pasa después**

| Cuándo | Qué |
| :---- | :---- |
| Viernes, antes de las 6 p.m. | El guardián arma el reporte y lo entrega. |
| Fin de semana | Se revisa: qué está verde de verdad, qué se salió del contrato, qué reglas se declararon sin test. |
| Lunes | Vuelven tres correcciones concretas. Tres, no quince. |

&nbsp;

| Las tres correcciones van primero Entran al trabajo de la semana antes que cualquier funcionalidad nueva. Una corrección que se posterga dos semanas deja de ser una corrección y pasa a ser la forma en que el proyecto funciona. |
| :---- |

&nbsp;