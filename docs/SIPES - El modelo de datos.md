**SUBLITEX · SIPES**

**El modelo de datos, explicado**

Para leer antes de abrir el código. Versión 0.2 · 7 de septiembre de 2026\.

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
| Prenda | La unidad física que se fabrica y se cuenta. Lleva producto, talla, número, color, género, corte, cuello y tipo. |

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

&nbsp;