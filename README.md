# 🧵 SIPES — Sistema de Gestión Operativa de Pedidos Sublitex

Bienvenido al repositorio central de **SIPES** (*Sistema de Información y Pedidos para la Empresa Sublitex*), desarrollado por **APM Inversiones E.I.R.L.**.

Este sistema nace como la solución definitiva a los dolores operativos, mermas textiles y errores de despacho en la confección deportiva y escolar mediante sublimación digital, tras un análisis exhaustivo de pedidos reales históricos (como el caso emblemático del pedido **PROMO 2002**).

---

## 🎯 Misión Central del Sistema

> *"Garantizar que la **prenda** (y no la persona) sea la unidad física contable del sistema y que **ningún total se escriba nunca a mano**."*

---

## 🏛️ Arquitectura del Repositorio

El proyecto adopta una estructura modular desacoplada por frentes de trabajo, permitiendo que múltiples equipos desarrollen en paralelo sin colisiones de código ni dependencias circulares:

```text
RptSoft-Sublitex/
├── README.md                      # Documentación general del repositorio
│
└── Backend/                       # Núcleo de la API RESTful (NestJS + Prisma + PostgreSQL)
    ├── prisma/                    # Esquema declarativo y migraciones
    │   ├── schema.prisma          # Definición oficial de las 26 entidades del sistema
    │   └── constraints.sql        # Triggers y restricciones complejas en PostgreSQL
    │
    └── src/
        ├── core/                  # 🧠 Núcleo transversal compartido
        │   ├── prisma/            # PrismaModule (@Global) y PrismaService
        │   └── filters/           # PrismaExceptionFilter (captura de errores SQL)
        │
        └── modules/               # 📦 Módulos agrupados por Dominio Funcional
            ├── 1-nucleo-comercial/   # 🛡️ FRENTE BK1: Pedido base, clientes y catálogos
            ├── 2-operacion-prendas/  # ⚙️ FRENTE BK2: Participantes, prendas, excepciones y personalizaciones
            ├── 3-diseno/             # 🎨 FRENTE DISEÑO: Versionado y aprobación gráfica
            ├── 4-taller-produccion/  # 🖨️ FRENTE PRODUCCIÓN: Nesting, corte y archivos TIF
            └── 5-auditoria/          # 🔍 FRENTE AUDITORÍA: Trazabilidad inmutable (append-only)
```

---

## 👥 División de Frentes de Trabajo

### 🛡️ Frente Backend 1 (Guardián / Pedido y Catálogos)
* **Responsabilidad:** Mantenimiento del catálogo de reglas de negocio, esquema de base de datos (`schema.prisma`) y candados SQL (`constraints.sql`).
* **Módulos:** Autenticación de personal (`Usuario`), `Cliente`, `Pedido` (con bloques `DISENO`, `LISTA` y `COMERCIAL`), Catálogos maestros cerrados (`TipoProducto`, `TallaCatalogo`, `Atributo`, `ValorAtributo`, `UbicacionPersonalizacion`), `Grupo`, `ValorConfiguracion`, `ColorPedido` (códigos HEX estrictos) y `Tarifa`.

### ⚙️ Frente Backend 2 (Corazón Operativo / Participantes y Prendas - Sprint 1)
* **Responsabilidad:** Garantizar la precisión contable de lo que se enviará al taller de confección.
* **Módulos:**
  1. **`participantes/`**: Registro de personas reales (`nombrePersona`), enlaces sin contraseña para WhatsApp (`enlaceToken`) y ciclo de vida (`PENDIENTE` ➔ `REGISTRADO` ➔ `CONFIRMADO`).
  2. **`prendas/`**: Unidad física contable. Registro de fichas mínimas (talla, género, apodo `nombreEnPrenda`, número `"S/N"` o texto), tipos de prenda (`VENTA`, `OBSEQUIO`, `MUESTRA` con costo $0.00) y cálculo automático del **Resumen de Producción** multiplicando por las piezas físicas reales (`camisetas`, `shorts`, `medias`).
  3. **`excepciones/`**: Registro de deltas de confección (`prendaId`, `atributoId`, `valorAtributoId`) sin duplicar la configuración global del grupo.
  4. **`personalizaciones/`**: Estampados de texto libre vinculados obligatoriamente a una ubicación declarada.

---

## 🛡️ Reglas de Negocio Esenciales Reflejadas en el Código

1. **La Prenda es la Unidad Contable (R-E01, R-E07):**  
   Una persona puede tener múltiples prendas asignadas (por ejemplo: un jugador de campo que además solicita una camiseta de arquero). Los conteos de corte y costura se realizan siempre sobre `Prenda`, nunca sobre `Participante`.
2. **Conteo por Piezas Físicas (R-K03):**  
   Cada producto declara explícitamente cuántas camisetas, shorts y medias contiene. El resumen de producción multiplica las prendas por estas piezas para evitar que pedidos se despachen incompletos.
3. **El Número de Prenda es Texto (R-K04):**  
   El campo `numero` admite `"S/N"` (*Sin Número*), diferenciando a una prenda terminada sin número de una prenda pendiente por registrar (`null`).
4. **Prendas de Obsequio y Muestra (R-K02):**  
   Se fabrican y cuentan en el total físico de producción, pero su aporte al importe cobrado es estrictamente `$0.00`.
5. **Arquitectura Delta para Excepciones (R-C01, R-C05):**  
   Si una prenda cambia un atributo respecto al grupo, solo se guarda la diferencia puntual. La base de datos rechaza excepciones que coincidan con el valor general del grupo para evitar redundancias.
6. **Autenticación Híbrida (R-D05, R-J01):**  
   El personal interno y coordinadores usan **JWT**. Los participantes entran desde su celular mediante un **token único temporal sin contraseña** enviado por WhatsApp.

---

## 🚀 Guía de Inicio Rápido (Desarrollo Local)

### Prerrequisitos
* **Node.js** (v18 o superior)
* **npm**
* Instancia de **PostgreSQL** activa

### Pasos de Instalación

1. **Navegar a la carpeta del Backend:**
   ```bash
   cd Backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**  
   Crea un archivo `.env` en la raíz de `Backend/` con la cadena de conexión a tu base de datos:
   ```env
   DATABASE_URL="postgresql://usuario:password@localhost:5432/sipes_db?schema=public"
   PORT=3000
   ```

4. **Generar el cliente de Prisma:**
   ```bash
   npx prisma generate
   ```

5. **Iniciar el servidor en modo desarrollo:**
   ```bash
   npm run start:dev
   ```

6. **Acceder a la documentación Swagger:**  
   Una vez iniciado el servidor, abre en tu navegador:
   * 📑 **Swagger UI:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
