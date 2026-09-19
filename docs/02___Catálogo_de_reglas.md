Reglas del Núcleo Sublitex

Sublitex · SIPES — SIstema de PEdidos Sublitex

# **Reglas del núcleo**

**SIPES** se escribe siempre así y se expande siempre así: **SIstema de PEdidos Sublitex**. Esta es la única definición del nombre; el esquema, el SQL y los documentos la repiten sin variarla. Catálogo de reglas de negocio verificables para el flujo **pedido → configuración y excepciones → participantes y prendas → cierre**. Cada regla es una afirmación comprobable: si no tiene un test que la pruebe, no existe en el sistema.

**88** reglas **10** bloques Versión **0.2** Corregida contra el pedido real **PROMO 2002** Fuera del núcleo: pagos, metraje, proveedores, costos, exportación a Corel

Estructura Pedido → grupos → participantes → prendas La configuración vive en el grupo. La talla, el número y el color viven en la prenda.

Numeración Números libres por defecto Corregido en v0.2. La unicidad es una política que se activa por grupo, no la regla general.

Autoridad del dato Registra el jugador, confirma el coordinador La ficha vale desde que se registra; la lista no avanza sin confirmación.

Cierre Por etapas, con confirmación generada Diseño se congela primero. La confirmación al cliente la escribe el sistema, no una persona.

Post-cierre Bloqueado, con autorización y nueva versión Ningún cambio entra solo. Versionado obligatorio desde el día uno.

## **Lo que enseñó el pedido PROMO 2002**

Seis hallazgos del análisis de las cuatro confirmaciones de WhatsApp de un pedido real de 28 prendas. Tres de ellos contradicen la versión 0.1 de este catálogo y uno contradice el propio documento de requerimientos. Están acá porque son el argumento: no son hipótesis sobre lo que podría fallar, son lo que ya falló.

01

#### *Los números se repiten, y es lo normal*

En las 28 prendas del pedido final, el número 7 aparece cuatro veces y el 8 otras cuatro. No es un error de digitación: es una promoción de exalumnos, no un equipo de fútbol. Los números son sentimentales, no de plantilla. El requerimiento pide impedir duplicados; la realidad del negocio los exige.

N° 7 ANMIX BRENIS · J. HUANCAS · JORGE C. · ALAN R. N° 8 ALAN F. · THIAGO R. · TOGUE · HADA N° 69 CLINT (conjunto) · THEO · CLINT (camiseta) N° 12 JHEINER · JUAN R. N° 10 C. ACOSTA · PATRICIA A.

**Corrige**R-D04 de v0.1  
**Produce**Bloque G completo

02

#### *Un participante puede tener más de una prenda*

CLINT aparece dos veces en la misma lista: un conjunto blanco y una camiseta azul, ambos con el número 69\. La unidad que lleva producto, talla, número y color no es la persona: es la prenda. Modelar el participante como si tuviera una sola prenda hace imposible representar este pedido.

COLOR BLANCO · Conjuntos · Talla XL CLINT — N.° 69 COLOR AZUL · Camiseta · Talla XL CLINT — N.° 69

**Corrige**R-D01, R-D02 de v0.1  
**Produce**Bloque E completo

03

#### *Un participante desapareció del pedido y nadie lo notó*

Entre la segunda y la tercera confirmación, JH KL RAMOS sale de la lista y en su lugar entra JUAN R. El mensaje del cliente solo pedía *agregar* a Juan R.; nunca dijo que sacaran a nadie. La baja se comunicó por ausencia, y una ausencia no se lee. Es el error más caro del anexo y el más difícil de detectar a ojo.

Confirmación 2 · Talla M … JHEINER 12 · JH KL RAMOS 15 · JORGE C. 7 … Confirmación 3 · Talla M … JHEINER 12 · JUAN R. 12 · JORGE C. 7 …

**Produce**R-H10

04

#### *El conteo de la confirmación final está equivocado*

El encabezado dice ocho camisetas y debajo hay diez nombres. El total general de 28 unidades sí es correcto, así que el encabezado quedó de dos versiones atrás y nadie lo revisó. Es exactamente lo que pasa cuando un subtotal se escribe a mano en vez de calcularse.

Camisetas – 8 unidades THEO · THIAGO R. · AMPARO · TOGUE · MIRTHA ANA LI · LOCONI · HADA · PATRICIA A. · CYNTHIA → 10

**Produce**R-E08, R-H07

05

#### *El total no cuadra con sus propios precios unitarios*

Con las cantidades y precios que la misma confirmación declara, el total sería S/ 1,065. Dice S/ 1,225. La diferencia de S/ 160 aparece idéntica en las cuatro confirmaciones y nunca está itemizada. Puede ser el recargo de arquero, el envío o un acuerdo verbal, pero hoy nadie sabe cuál de los tres.

17 conjuntos × S/ 45 \= 765 11 camisetas × S/ 25 \= 275 banderola \= 25 \----- 1,065 declarado: 1,225 sin explicar: 160

**Produce**R-H08

06

#### *La palabra «corte» no aparece en ninguna de las cuatro confirmaciones*

Ni «corte», ni «mujer», ni «femenino». Hay al menos seis participantes con nombre de mujer y el corte se acordó por WhatsApp. El reclamo no vino de un dato equivocado: vino de un dato que nunca se escribió. Por eso una confirmación debe imprimir los atributos críticos aunque tomen su valor por defecto — el silencio es lo que falla.

AMPARO · MIRTHA · ANA LI · HADA · PATRICIA A. · CYNTHIA «Amigo los polos de mujer no tienen el corte especial para mujeres» «Todos los polos son rectos hasta las de las mujeres»

**Produce**R-H06

## **Glosario**

Vocabulario cerrado. Si una conversación, un ticket o un nombre de tabla usa una palabra que no está acá, o falta un término o se está inventando un sinónimo. Esta lista es la que impide que cinco personas modelen cinco cosas distintas.

**Pedido**

El acuerdo completo con un cliente. Nace de una oportunidad de GoHighLevel y contiene uno o más grupos. *SUB-000842*

**Grupo**

Conjunto de participantes que comparten una configuración general. Es el nivel donde vive la configuración, no el pedido. *«Conjuntos blancos», «Camisetas»*

**Participante**

La persona que recibe prendas. Pertenece a un grupo y puede tener **una o varias** prendas.

**Prenda**

**La unidad contable, no la pieza física.** Es una línea del pedido: una persona, un producto, una talla, un número, un color, un corte, una condición de arquero. Las piezas físicas salen del producto: una prenda «kit completo» son tres piezas (camiseta, short, medias) y una prenda «camiseta sola» es una. En el pedido PROMO 2002 hay **28 prendas** y **62 piezas**. Los totales comerciales se cuentan sobre prendas; los de producción, sobre piezas. Nunca se mezclan.

**Atributo**

Característica configurable de catálogo cerrado con valores cerrados: tela, color, cuello, manga, corte, escudo, short, medias.

**Configuración general**

El valor por defecto de cada atributo para todas las prendas de un grupo.

**Excepción**

Un valor de atributo distinto al general para una prenda concreta. Se guarda como terna *(prenda, atributo, valor)*.

**Valor efectivo**

Lo que realmente corresponde: la excepción si existe, si no el valor general. Se calcula al leer, nunca se copia.

**Personalización**

Texto libre estampado en una ubicación concreta. Terna *(prenda, ubicación, contenido)*. Es vinculante para producción. *manga izquierda → «Johnatan»*

**Observación**

Texto libre **no vinculante**. Lo que deba llegar a producción es un atributo o una personalización, nunca una observación.

**Nombre en prenda**

El texto que se estampa como nombre principal. Distinto del nombre de la persona; puede ser apodo.

**Política de numeración**

Ajuste por grupo: números libres (por defecto) o números únicos. Determina si el sistema impide repetir.

**Cantidad contratada**

Lo que se acordó comercialmente para un grupo. Es contra lo que se contrasta la cantidad real de prendas registradas.

**Bloque**

Unidad que se cierra por separado: Diseño, Lista, Comercial. Cada uno con su propio candado y su propia versión.

**Confirmación**

El documento que se envía al cliente. Lo genera el sistema a partir de los datos; ninguna persona lo escribe ni lo transcribe.

**Versión**

Copia inmutable de un bloque al cerrarlo. Diseño y producción trabajan siempre contra una versión declarada.

Bloqueantes

Impacto en el modelo

Nuevo en v0.2

Decisión abierta

88 de 88

A

### **Pedido, origen y ciclo de vida**

10 reglas

* R-A01

* Todo pedido nace de una oportunidad de GoHighLevel y guarda su **Contact ID** y su **Opportunity ID**. Un pedido sin ese vínculo es una excepción que debe justificarse.

* Nuevo en v0.2Impacto en el modelo

* R-A02

* Los datos comerciales del cliente —nombre, teléfono, empresa, vendedor asignado— **no se registran en Sublitex**: se leen desde GoHighLevel. Sublitex no es su dueño y no los edita.

* Si se pueden editar en los dos lados, en tres meses habrá dos verdades y nadie sabrá cuál vale.

* Nuevo en v0.2

* R-A03

* Todo pedido tiene un código único legible generado por el sistema, no editable por ningún rol.

* Legible porque va a viajar por WhatsApp igual. Con un identificador ilegible la gente va a seguir diciendo «el pedido de la promo 2002».

* R-A04

* Recibir dos veces el mismo evento de GoHighLevel **no crea dos pedidos**. La creación es idempotente sobre el Opportunity ID.

* Los webhooks se reenvían. Es la causa más común de pedidos duplicados en integraciones de este tipo.

* Nuevo en v0.2Impacto en el modelo

* R-A05

* El pedido tiene un **estado global** y cada bloque tiene **su propio estado**. Los quince estados propuestos en el requerimiento se modelan como tres bloques con estado propio más el estado global, no como una lista lineal de quince.

* «Diseño aprobado» y «Lista cerrada» no son momentos sucesivos de una misma línea: son candados independientes que pueden estar en cualquier combinación.

* Nuevo en v0.2Impacto en el modelo

* R-A06

* Solo se admiten las transiciones declaradas, y solo hacia adelante. Cualquier otra se rechaza con error, no con advertencia.

* Bloqueante

* R-A07

* Cada estado global declara explícitamente a qué estado corresponde en GoHighLevel. La sincronización nunca infiere el equivalente.

* Nuevo en v0.2

* R-A08

* Si la sincronización con GoHighLevel falla, el pedido **sigue operando en Sublitex** y el evento queda en cola para reintento. GoHighLevel nunca bloquea la operación.

* Nuevo en v0.2Decisión abierta

* R-A09

* La fecha compromiso de entrega debe ser posterior a la fecha del pedido, y es obligatoria para salir de Borrador.

* R-A10

* Un pedido cancelado es terminal: no admite ninguna modificación. Quién lo creó y cuándo es inmutable para todos los roles.

B

### **Grupo y configuración general**

9 reglas

* R-B01

* Todo grupo pertenece a un solo pedido y tiene un nombre único dentro de ese pedido.

* R-B02

* Todo grupo declara un **tipo de producto base** y una **cantidad contratada**.

* La cantidad contratada es lo que permite detectar «se acordaron 26 prendas y hay 28 registradas». Sin ella no hay contra qué contrastar.

* R-B03

* Todo grupo tiene exactamente una configuración general. No existe grupo sin configuración.

* R-B04

* Los atributos de la configuración general salen de un **catálogo cerrado con valores cerrados**. El texto libre nunca es un atributo.

* El texto libre que sí debe llegar a producción se registra como personalización (bloque F), que tiene ubicación declarada. Lo demás va a observaciones y no es vinculante.

* Impacto en el modelo

* R-B05

* Cada atributo declara dos marcas independientes: si es **obligatorio** para aprobar diseño y si es **crítico para producción**.

* Tela, color, cuello, manga y corte son obligatorios. Corte, talla y escudo son críticos. Sponsor de manga derecha no es ninguna de las dos.

* R-B06

* Un grupo no puede pasar a recolección con atributos obligatorios sin valor.

* Bloqueante

* R-B07

* Cambiar un valor de la configuración general **no sobreescribe las excepciones existentes**.

* Si «corte: masculino» pasa a «unisex», las prendas con excepción «femenino» siguen en femenino. Solo funciona si se guarda el delta y no el valor resuelto — ver R-C03.

* Impacto en el modelo

* R-B08

* Cambiar la configuración general con prendas ya registradas exige confirmación e informa **a cuántas prendas afecta** antes de aplicar.

* R-B09

* Si la configuración general pasa a coincidir con una excepción, esa excepción se marca **redundante** y se propone eliminarla. El sistema no la elimina solo.

* Borrarla sola sería correcto matemáticamente y desastroso operativamente: se perdería el registro de que ese caso fue pedido explícitamente.

C

### **Excepciones**

9 reglas

* R-C01

* Una excepción se define siempre como la terna **(prenda, atributo, valor)**. Nunca como una nota de texto.

* Impacto en el modelo

* R-C02

* Una prenda puede tener cero o muchas excepciones, pero **como máximo una por atributo**.

* R-C03

* El valor efectivo de un atributo es su excepción si existe y, en su defecto, el valor de la configuración general del grupo. **El valor general nunca se copia a la prenda.**

* Es la decisión de arquitectura más importante del sistema. Se guarda solo la diferencia; el valor completo se resuelve al leer. Si se copia, R-B07 se vuelve imposible y aparecen prendas con valores viejos que nadie sabe por qué son distintos.

* Impacto en el modelo

* R-C04

* Toda excepción registra quién la creó, cuándo, y admite un motivo opcional.

* R-C05

* Una excepción cuyo valor es idéntico al general es inválida: el sistema la rechaza al guardar.

* R-C06

* Toda vista distingue visualmente qué valores vienen de la configuración general y cuáles son excepción. **Nunca se muestran indistinguibles.**

* R-C07

* El sistema genera siempre un resumen de excepciones por atributo, con conteo y acceso al detalle.

* «Corte: 23 masculino · 5 femenino → ver las 5». Es lo que evita que el diseñador descubra las excepciones leyendo una conversación.

* R-C08

* Las excepciones de atributos **críticos para producción** se muestran destacadas en las vistas de diseño y producción sin abrir ningún detalle.

* R-C09

* Si una prenda acumula excepciones en más de tres atributos, el sistema sugiere mover a su participante a un grupo propio. Es sugerencia, no bloqueo.

* Decisión abierta

D

### **Participantes**

9 reglas

* R-D01

* Todo participante pertenece a exactamente un grupo y tiene **una o más prendas**. Un participante sin prendas está incompleto.

* Nuevo en v0.2Impacto en el modelo

* R-D02

* El **nombre en prenda** es un campo distinto del nombre de la persona. Puede ser un apodo. Es el que viaja a producción.

* Es el origen del error «Chapoñán → Capoñán». Si son el mismo campo, alguien va a «corregir» el apodo pensando que corrige un error de tipeo.

* Impacto en el modelo

* R-D03

* Estados del participante: **Pendiente** (nunca entró) → **Registrado** (llenó sus datos) → **Confirmado** (el coordinador lo validó).

* R-D04

* El participante solo puede editar sus propios datos, y solo mientras el bloque Lista no esté cerrado.

* R-D05

* El participante accede por un **enlace personal sin contraseña**, que lo identifica a él y a su grupo.

* R-D06

* El enlace tiene vencimiento y el coordinador puede revocarlo o regenerarlo. Un enlace revocado no da acceso a nada.

* R-D07

* El coordinador del cliente y el coordinador operativo pueden editar cualquier ficha de su pedido. El cambio se atribuye a quien lo hizo, **no al participante**.

* R-D08

* Eliminar un participante que ya registró datos exige confirmación explícita y queda en el historial. Nunca desaparece en silencio.

* R-D09

* El sistema muestra permanentemente: participantes esperados, registrados, confirmados e incompletos.

E

### **Prendas**

8 reglas

* R-E01

* Toda prenda pertenece a un participante y hereda el grupo de ese participante.

* Nuevo en v0.2

* R-E02

* La prenda lleva **producto, talla, número, color, corte y condición de arquero**. Los demás atributos se resuelven por valor efectivo desde la configuración del grupo.

* Nuevo en v0.2Impacto en el modelo

* R-E03

* La ficha mínima de una prenda es **nombre en prenda, número y talla**. Sin los tres, la prenda está incompleta.

* R-E04

* La talla pertenece al catálogo del tipo de producto. Los catálogos difieren: adulto usa letras, niño usa números. **No hay talla en texto libre.**

* En el pedido real convivían tallas 10 y 14 (niños) con S, M, L y XL. Y XXL, que el cliente pidió, no figuraba en ninguna lista. El catálogo de tallas se revisa con ventas, no con desarrollo.

* Nuevo en v0.2

* R-E05

* El **color es un atributo de la prenda**, no del pedido ni del grupo. Un mismo participante puede tener prendas de colores distintos.

* Nuevo en v0.2Impacto en el modelo

* R-E06

* La condición de arquero es un atributo de la prenda. Una prenda de arquero puede tener producto, manga y precio distintos a los del resto del grupo.

* Nuevo en v0.2

* R-E07

* Todos los resúmenes —por talla, por producto, por componente, por color— se calculan **sobre prendas, nunca sobre participantes**.

* Nuevo en v0.2Impacto en el modelo

* R-E08

* Ningún conteo se escribe a mano. La cantidad de prendas de un grupo, de un color o de una talla es siempre un valor calculado.

* Es el hallazgo 04: «Camisetas – 8 unidades» seguido de diez nombres, en el documento que el cliente aprobó.

* Nuevo en v0.2Bloqueante

F

### **Personalizaciones**

6 reglas

* R-F01

* Una personalización es la terna **(prenda, ubicación, contenido)**. La ubicación sale de un catálogo cerrado; el contenido es texto libre.

* Es la forma de aceptar «Kalessi abajo del cuello» sin volver al texto plano. Estructurado donde importa, libre donde tiene que serlo.

* Nuevo en v0.2Impacto en el modelo

* R-F02

* El catálogo de ubicaciones es cerrado en cada momento y ampliable con el tiempo: pecho, espalda, cuello delantero, cuello posterior, manga izquierda, manga derecha, short delantero, short posterior.

* Nuevo en v0.2

* R-F03

* Una personalización sin ubicación asignada es inválida. **No se admite «los nombres de los hijos en los brazos» sin decir cuál va en cuál brazo.**

* En el pedido real el cliente mandó tres nombres —Johnatan, Kalessi, Diego— para dos mangas y un cuello, sin decir el reparto. Esa ambigüedad la resolvió alguien de memoria.

* Nuevo en v0.2Bloqueante

* R-F04

* El contenido de una personalización **es vinculante para producción** y se muestra siempre con la ortografía exacta con que fue registrado.

* Nuevo en v0.2

* R-F05

* Una personalización se registra una sola vez y se muestra en todas las vistas sin volver a escribirse. **Ninguna vista permite re-teclearla.**

* Es el criterio de éxito del requerimiento convertido en regla: cuántas veces alguien tuvo que volver a escribir un dato ya registrado. La respuesta debe ser cero.

* Nuevo en v0.2

* R-F06

* Las observaciones son texto libre **no vinculante**. Lo que deba llegar a producción tiene que ser un atributo o una personalización. Producción no está obligada a leer observaciones.

* Nuevo en v0.2Impacto en el modelo

G

### **Numeración**

6 reglas

* R-G01

* Cada grupo declara una **política de numeración**: números libres (por defecto) o números únicos.

* Corrige la regla R-D04 de la v0.1, que exigía unicidad siempre. El requerimiento también la pedía. El pedido real la desmiente: cuatro personas con el número 7 en una promoción es lo normal, no un error.

* Nuevo en v0.2Impacto en el modelo

* R-G02

* Con números libres, dos prendas pueden compartir número y el sistema **no lo impide**. Lo muestra, no lo bloquea.

* Nuevo en v0.2

* R-G03

* Con números únicos, la unicidad se garantiza con una **restricción en la base de datos**, no con una validación en el servicio. Ante dos registros simultáneos, uno se guarda y el otro recibe error.

* Es la única forma de que dos jugadores que confirman en el mismo segundo no queden ambos con el 10\.

* BloqueanteImpacto en el modelo

* R-G04

* Al elegir número, el participante ve **qué números ya están tomados** en su grupo, pero no a quién pertenecen. Con política libre los ve como ocupados pero seleccionables.

* R-G05

* Con números libres, el conteo de repeticiones se muestra como información en el resumen, **nunca como alerta bloqueante**.

* Nuevo en v0.2

* R-G06

* Cambiar la política de un grupo que ya tiene números repetidos exige resolver los repetidos primero. El cambio no se aplica a medias.

* Nuevo en v0.2

H

### **Cierre, versiones y confirmación**

14 reglas

* R-H01

* El pedido tiene tres bloques que se cierran de forma independiente: **Diseño**, **Lista** y **Comercial**.

* Impacto en el modelo

* R-H02

* Cerrar Diseño exige un diseño en estado Aprobado y todos los atributos obligatorios de todos los grupos con valor.

* Bloqueante

* R-H03

* Cerrar Lista exige cero prendas incompletas, cero conflictos de numeración según la política del grupo, y la discrepancia contra la cantidad contratada resuelta o justificada por escrito.

* Bloqueante

* R-H04

* Producción no puede iniciar sin Diseño y Lista cerrados. El bloque Comercial **no** bloquea producción.

* Propuesta: que un saldo pendiente no detenga la fábrica. Es decisión de negocio de Sublitex, no técnica — confirmar.

* BloqueanteDecisión abierta

* R-H05

* La confirmación que se envía al cliente **la genera el sistema**. Ninguna persona la escribe, la transcribe ni la edita antes de enviarla.

* Las cuatro confirmaciones del anexo las tecleó una persona a partir de conversaciones. Ahí se perdió el corte femenino, ahí quedó el subtotal viejo y ahí desapareció JH KL RAMOS.

* Nuevo en v0.2Impacto en el modelo

* R-H06

* La confirmación imprime **todos los atributos críticos con su valor efectivo, incluidos los que tomaron el valor por defecto**. Un atributo crítico nunca se omite por no ser una excepción.

* El reclamo del corte femenino no vino de un dato equivocado sino de un dato que nunca se escribió. Si la confirmación hubiera dicho «Corte: masculino» en las 28 prendas, el cliente lo habría visto y corregido.

* Nuevo en v0.2Bloqueante

* R-H07

* Todos los totales de la confirmación —unidades, por producto, por talla, por componente, por color— **se calculan**. Ninguno se escribe.

* Nuevo en v0.2Bloqueante

* R-H08

* Si el importe total no se puede derivar de cantidades por precio unitario más los adicionales declarados, el sistema señala la diferencia y **no permite emitir la confirmación** hasta que esté itemizada.

* En el pedido real hay S/ 160 sin explicar, idénticos en las cuatro confirmaciones. Nadie los notó porque nadie rehizo la suma.

* Nuevo en v0.2Bloqueante

* R-H09

* Antes de cerrar cualquier bloque, el sistema presenta un resumen calculado y exige confirmación explícita sobre él.

* R-H10

* El resumen de cierre lista explícitamente **qué participantes y prendas entraron y cuáles salieron** respecto de la versión anterior. Una baja nunca se comunica por ausencia.

* Es el hallazgo 03\. JH KL RAMOS salió del pedido entre dos confirmaciones y nadie lo dijo, porque desaparecer de una lista de veintiséis nombres no se ve.

* Nuevo en v0.2Bloqueante

* R-H11

* Al cerrar un bloque, el sistema guarda una **versión inmutable** de todos sus datos, con fecha, hora y responsable.

* Impacto en el modelo

* R-H12

* Un bloque cerrado es de solo lectura **para todos los roles sin excepción**, incluido el administrador.

* Bloqueante

* R-H13

* Reabrir un bloque exige rol autorizado y **motivo escrito obligatorio**, genera una nueva versión y muestra el diff contra la anterior: qué campos cambiaron, de qué valor a qué valor y de qué prendas.

* R-H14

* Si el pedido ya está en producción, la reapertura genera una alerta que **debe ser acusada de recibo** por diseño y producción. Ninguna versión se elimina jamás.

* Este es el caso XL → XXL. El historial pasivo no habría evitado el reclamo: alguien tiene que confirmar que vio el cambio.

I

### **Historial y alertas**

9 reglas

* R-I01

* Todo cambio registra: qué campo, valor anterior, valor nuevo, quién, cuándo y desde qué rol.

* R-I02

* El historial es de solo lectura. No existe edición ni borrado de entradas para ningún rol, ni por interfaz ni por API.

* Bloqueante

* R-I03

* El historial es consultable filtrado por participante, por prenda, por atributo y por autor.

* R-I04

* Un cambio hecho por el participante sobre sus propios datos se atribuye al participante, no al coordinador que le compartió el enlace.

* R-I05

* Los cambios de configuración general se registran junto con el número de prendas afectadas **en ese momento**.

* R-I06

* Las alertas se **calculan siempre desde el estado actual**. No se guardan como registros que puedan quedar desactualizados.

* Una alerta almacenada es una alerta que en algún momento va a mentir. Que sean derivadas cuesta un poco de rendimiento y ahorra una clase entera de bugs.

* Impacto en el modelo

* R-I07

* Toda alerta es **bloqueante** o **informativa**. No hay categoría intermedia.

* Bloqueantes: falta talla, número o nombre en prenda; atributo obligatorio sin valor; personalización sin ubicación; total sin cuadrar; diseño no aprobado; número repetido en grupo con política única. Informativas: discrepancia contra la cantidad contratada; números repetidos con política libre; prenda con más de tres excepciones; excepción redundante.

* R-I08

* El sistema nunca permite cerrar un bloque con una alerta bloqueante activa, sin importar el rol de quien lo intente.

* Bloqueante

* R-I09

* Cada alerta indica **qué falta y dónde corregirlo**, con enlace directo al participante, prenda, grupo o atributo implicado.

J

### **Roles y visibilidad**

8 reglas

* R-J01

* El sistema tiene siete roles: **Administrador, Coordinador Operativo, Vendedora, Coordinador del cliente, Participante, Diseño y Producción**.

* Nuevo en v0.2

* R-J02

* Solo el Administrador visualiza utilidad, margen, tarifas de proveedor y costos de costura.

* R-J03

* El Coordinador Operativo ve todo lo operativo y los costos que necesita para preparar pagos, pero **no margen ni utilidad**.

* Es el rol que sostiene el objetivo estratégico de delegar la operación. Cuánto costo exactamente necesita ver es una decisión que hay que tomar con el administrador.

* Nuevo en v0.2Decisión abierta

* R-J04

* La Vendedora ve la información comercial de sus propios clientes, no la de otras vendedoras.

* Nuevo en v0.2Decisión abierta

* R-J05

* El Coordinador del cliente y el Participante nunca acceden a información comercial interna, **ni por interfaz ni por API**.

* Bloqueante

* R-J06

* El Participante ve únicamente sus propias prendas y el diseño aprobado de su grupo. No accede a la lista completa ni a los datos de otros.

* R-J07

* Diseño y Producción ven todo lo operativo —atributos, excepciones, personalizaciones, prendas, archivos— y nada financiero.

* R-J08

* Los permisos se aplican **en la consulta a la base de datos**, no en la vista. Un rol sin permiso no recibe el dato; no lo recibe oculto.

* En Arte Ideas los permisos vivían en la vista y no en el queryset. Por eso un superusuario leía los clientes de otro tenant. Un solo lugar equivocado y toda la matriz de roles es decorativa.

* Nuevo en v0.2BloqueanteImpacto en el modelo

Ninguna regla coincide con el filtro.

## **Cómo cambia este catálogo**

El negocio está en operación y va a seguir cambiando. Un catálogo que no cambia es un catálogo que dejó de describir el negocio. Que aparezcan reglas nuevas no es una falla del método: es el método funcionando. Lo que sí hay que gobernar es *cómo* cambia, porque estos identificadores van a estar escritos en nombres de test y en mensajes de commit.

1. **Los identificadores no se reutilizan ni se renumeran nunca.** Entre la v0.1 y la v0.2 sí renumeré —la vieja R-D04 se convirtió en el bloque G— y eso ya no puede volver a pasar. Desde la v0.2 los identificadores quedan congelados.

2. **Una regla derogada no se borra: se marca derogada y se queda**, con la versión en que murió y qué la reemplazó. Un catálogo con lápidas es más útil que uno donde las reglas desaparecen sin dejar rastro.

3. **Una regla nueva se agrega al final de su bloque** con el siguiente número libre. Nunca se intercala.

4. **Todo cambio pasa por una sola persona y queda registrado:** qué regla, qué cambió, por qué, quién y en qué versión. Sin esa persona, en un mes hay cinco catálogos.

5. **Cambiar una regla obliga a tocar su test.** Ese es el mecanismo de seguridad: si la regla cambió y el código no, el test falla y alguien se entera el mismo día.

**Una regla que falta es más peligrosa que una regla que cambió.** Las que cambian se anuncian solas; las que faltan solo aparecen mirando pedidos reales, como apareció la del corte femenino. Los primeros dos meses, cada pedido que pase por el sistema debería contrastarse contra este catálogo.

## **Qué hacer con esto**

1. **Revisar y discutir, no aprobar.** Quedan seis decisiones abiertas marcadas. La versión 0.1 tenía una regla frontalmente equivocada que solo se descubrió al leer un pedido real; asumir que ninguna de las 88 restantes lo está sería ingenuo.

2. **Convertir cada regla en un test antes de escribir el código.** El identificador de la regla es el nombre del test. Un módulo está terminado cuando sus reglas están en verde, no cuando sus endpoints responden 200\.

3. **Repartir por bloque, no por capa.** Un practicante se lleva excepciones completo —modelo, servicio, API y tests— en vez de «todos los modelos» o «todo el frontend». Así el error se ve rápido y es de una sola persona.

4. **Construir primero la rebanada PROMO 2002\.** Este pedido entero, con sus 28 prendas, sus números repetidos, CLINT con dos prendas, las personalizaciones de Juan R. y las seis participantes con corte femenino. Si el sistema lo representa sin perder nada y emite la confirmación correcta, el núcleo funciona.

**\# El identificador de la regla es el nombre del test** describe('R-G01 · política de numeración por grupo', () \=\> { it('acepta cuatro prendas con el número 7 si la política es libre', ...) it('rechaza la segunda prenda con el número 7 si la política es única', ...) it('no deja cambiar a política única mientras haya repetidos (R-G06)', ...) }) describe('R-H10 · el cierre declara las bajas', () \=\> { it('lista a JH KL RAMOS como baja al comparar v2 contra v1', ...) it('no deja cerrar si una baja no fue revisada', ...) }) describe('R-H06 · la confirmación imprime los críticos por defecto', () \=\> { it('incluye «corte: masculino» aunque ninguna prenda tenga excepción', ...) })