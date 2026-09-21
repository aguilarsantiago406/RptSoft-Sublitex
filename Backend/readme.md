# 🚀 SIPES — Backend API (Sublitex)

API REST modular para el **Sistema de Información y Pedidos para la Empresa Sublitex (SIPES)**, desarrollada con **NestJS 11**, **Prisma ORM** y **PostgreSQL**.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado y activo en tu equipo:
* **Node.js**: v20.x o v22.x LTS
* **npm**: v10.x o superior
* **PostgreSQL**: v15 o v16 (corriendo localmente en el puerto `5432`)

---

## 🛠️ Guía de Instalación y Puesta en Marcha

Sigue estos pasos en orden para levantar el proyecto desde cero:

### 1. Ubicarse en la carpeta del Backend
Abre tu terminal y entra en el directorio `Backend`:
```bash
cd Backend
```

### 2. Instalar dependencias
Para evitar conflictos con peer dependencies de NestJS y Swagger, instala con el flag `--legacy-peer-deps`:
```bash
npm install --legacy-peer-deps
```

---

## ⚙️ 3. Configuración de Variables de Entorno (`.env`)

Crea tu archivo `.env` en la raíz de `Backend/` a partir de la plantilla:
```bash
# En Windows PowerShell:
Copy-Item .env.example .env

# O en bash:
cp .env.example .env
```

Abre `.env` y verifica o personaliza las siguientes variables clave:

```env
PORT=3000
NODE_ENV=development

# 1. Conexión a PostgreSQL: reemplaza TU_PASSWORD por tu contraseña local de PostgreSQL
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/sipes_db?schema=public"

# 2. Secreto JWT para autenticación (Obligatorio para que la app inicie)
JWT_SECRET=sublitex-dev-secret-change-in-production

# 3. Orígenes permitidos de CORS
CORS_ORIGIN="*"
```

---

## 🗄️ 4. Base de Datos, Migraciones y Datos de Prueba (Seed)

Sigue estos 3 pasos para dejar la base de datos totalmente operativa con el caso real **PROMO 2002**:

### Paso 4.1: Crear la Base de Datos y ejecutar Migraciones
Ejecuta el comando de migraciones de Prisma:
```bash
npx prisma migrate dev
```
> 💡 **Nota:** Si la base de datos `sipes_db` aún no existe en tu PostgreSQL, Prisma te preguntará:  
> `Database "sipes_db" does not exist at "localhost:5432". Would you like to create it? (y/n)`  
> Escribe **`y`** y presiona **Enter**. Prisma creará la base de datos y aplicará las tablas automáticamente.

### Paso 4.2: Aplicar Triggers y Restricciones SQL Complejas
Aplica las reglas de integridad que no se pueden representar solo en el schema de Prisma:
```bash
npx prisma db execute --file prisma/01_constraints.sql
```
*(Verás el mensaje: `Script executed successfully`).*

### Paso 4.3: Poblar la Base de Datos con el Caso Real (`PROMO 2002`)
Ejecuta el script de siembra (*seed*):
```bash
npm run prisma:seed
```
*(O también: `npx prisma db seed`)*

👉 **Salida esperada:**
```text
Seed SIPES listo
Pedido PROMO 2002: SUB-000842
Grupos: 2
Prendas (filas): 28
```

---

## 🏃 5. Levantar el Servidor

Para iniciar la aplicación en modo desarrollo (con recarga en vivo):
```bash
npm run start:dev
```

Cuando termine de compilar, verás en la consola:
```text
Servidor SIPES: http://localhost:3000
Swagger: http://localhost:3000/api/docs
```

---

## 📑 6. Explorar y Probar la API (Swagger)

Abre tu navegador en:
👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

Desde Swagger puedes probar todos los endpoints organizados por dominios:
* **Autenticación (BK1):** Registro y login de usuarios (`/api/auth/*`).
* **Clientes y Pedidos (BK1):** Gestión de pedidos, estados y colores (`/api/pedidos/*`).
* **Participantes (BK2):** 
  * Flujo WhatsApp sin JWT (`/api/participantes/enlace/:token`).
  * Panel administrativo (`/api/grupos/:grupoId/participantes`).
* **Prendas y Producción (BK2):** 
  * Ficha mínima y gestión (`/api/prendas/*`).
  * Resumen de corte físico real (`GET /api/pedidos/{pedidoId}/resumen-produccion`).
* **Excepciones y Personalizaciones (BK2):** Deltas de confección y estampados.

---

## 🧪 7. Pruebas Automatizadas (Jest / TDD)

Para validar que todas las reglas de negocio y los controladores se mantengan en **100% VERDE**:

```bash
# Correr todas las suites de pruebas unitarias
npm test

# Correr pruebas en modo escucha (watch)
npm run test:watch

# Generar reporte de cobertura de código
npm run test:cov
```

---

## 🧰 8. Comandos Útiles de Prisma

* **Abrir visor visual de la base de datos (Prisma Studio):**
  ```bash
  npm run prisma:studio
  ```
  *(Abre una interfaz gráfica web en `http://localhost:5555` para ver y editar registros directamente).*

* **Regenerar el cliente TypeScript de Prisma:**
  ```bash
  npm run prisma:generate
  ```
