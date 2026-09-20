# ??? Arquitectura y Estructura Oficial del Repositorio — SIPES Sublitex
> **REGLA OBLIGATORIA PARA TODOS LOS AGENTES Y DESARROLLADORES (CLI / HUMANO):**
> No crear archivos ni carpetas fuera de las rutas declaradas en esta guía.

---

## 1. Estructura de Raíz (Monorepo)

El repositorio se divide estrictamente en 3 áreas:

`	ext
RptSoft-Sublitex/
+-- Backend/          # ?? Backend unificado (NestJS + Prisma + PostgreSQL)
+-- sublitex-web/     # ?? Frontend (Next.js + React + Tailwind)
+-- docs/             # ?? Documentación unificada del proyecto
    +-- context/      # Reglas de negocio, roles y contratos de endpoints
    +-- openspec/     # Especificaciones técnicas formales y auditoría
`

? **PROHIBIDO:**
- NO crear carpetas como src/, prisma/ o archivos package.json en la raíz.
- NO crear carpetas personales como mio/ o duplicadas como Backend-2/.

---

## 2. Estructura Interna del Backend (Backend/)

Todo el backend vive dentro de Backend/. Comandos como 
pm run start:dev, 
pm test y 
px prisma se ejecutan **únicamente dentro de esta carpeta**.

`	ext
Backend/
+-- .env                                  # Variables de entorno locales
+-- package.json                          # Dependencias oficiales de NestJS
+-- tsconfig.json                         # Configuración de compilación TS
¦
+-- prisma/                               # BASE DE DATOS Y ORM (ÚNICO OFICIAL)
¦   +-- schema.prisma                     # Esquema oficial de 26 entidades y enums
¦   +-- 01_constraints.sql                # Triggers de integridad SQL de PostgreSQL
¦   +-- seed.ts                           # Script de siembra
¦   +-- promo2002.data.ts                 # Fixture de datos reales
¦
+-- src/
    +-- main.ts                           # Entrada de la app (Swagger en /api/docs)
    +-- app.module.ts                     # Módulo raíz
    ¦
    +-- core/                             # NÚCLEO TRANSVERSAL
    ¦   +-- prisma/                       # PrismaModule (@Global) y PrismaService
    ¦   +-- filters/                      # PrismaExceptionFilter (captura errores SQL)
    ¦
    +-- modules/                          # MÓDULOS POR DOMINIO
        +-- 1-nucleo-comercial/           # ??? FRENTE BK1 (Santiago)
        ¦   +-- clientes/                 # POST, GET, GET/:id
        ¦   +-- pedidos/                  # POST, GET, GET/:id, PATCH estado, colores, resumen
        ¦   +-- grupos/                   # POST, GET, PUT, PATCH política, DELETE
        ¦   +-- catalogos/                # Tipos de producto, tallas, atributos, ubicaciones
        ¦   +-- auth/                     # Autenticación y roles (Sprint 2)
        ¦   +-- comercial/                # Matriz comercial y tarifas (Sprint 2)
        ¦   +-- nucleo-comercial.module.ts
        ¦
        +-- 2-operacion-prendas/          # ?? FRENTE BK2 (Alex)
        ¦   +-- prendas/                  # Registro de prendas y cálculo físico
        ¦   +-- participantes/            # Enlaces móviles WhatsApp y participantes
        ¦   +-- excepciones/              # Deltas de confección (R-C01)
        ¦   +-- personalizaciones/        # Estampados y ubicaciones (R-F01)
        ¦   +-- operacion-prendas.module.ts
        ¦
        +-- 3-diseno/                     # ?? FRENTE DISEÑO (Fase futura)
        ¦   +-- diseno/
        +-- 4-taller-produccion/          # ?? FRENTE PRODUCCIÓN (Fase futura)
        ¦   +-- nesting/
        +-- 5-auditoria/                  # ?? FRENTE AUDITORÍA (Fase futura)
            +-- auditoria/
`

---

## 3. Reglas de Importación e Inyección

1. **Base de Datos (Prisma):**
   - Siempre importar PrismaService desde: '../../../core/prisma/prisma.service' (o ruta relativa correspondiente hacia src/core/prisma/prisma.service).
   - NUNCA instanciar 
ew PrismaClient() directamente dentro de servicios o controladores.

2. **Filtro Global de Errores:**
   - Las excepciones de base de datos se manejan con PrismaExceptionFilter registrado globalmente en main.ts.

---

## 4. Convenciones de Trabajo por Rol

- **BK1 (Santiago):** Responsable de Backend/src/modules/1-nucleo-comercial/.
- **BK2 (Alex):** Responsable de Backend/src/modules/2-operacion-prendas/.
- Ambos comparten la misma base de datos en Backend/prisma/ y el mismo núcleo en Backend/src/core/.