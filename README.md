# SIPES — Sistema de Pedidos Sublitex (Frontend MVP)

Frontend web para el taller de confección y sublimación deportiva **Sublitex** (Gamarra, Lima, Perú).

Permite gestionar el ciclo de pedidos deportivos: ficha técnica comercial, grilla de prendas (con tallas, cortes, excepciones y desglose BOM de producción) y cotización de proforma sin cálculos manuales.

---

## Inicio Rápido

### Requisitos
- **Node.js**: v20 o superior.
- **npm**: v10 o superior.

### Levantar el entorno local

```bash
# 1. Ingresar a la aplicación web
cd sublitex-web

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

---

## Verificación de Calidad

El proyecto exige mantener siempre los tests y compilación en verde:

```bash
cd sublitex-web

npm test            # Ejecuta las 13 suites de tests con Vitest
npm run lint        # Verificación estricta de ESLint
npx tsc --noEmit    # Chequeo estricto del compilador TypeScript
npm run build       # Compilación de producción optimizada (Turbopack)
```

---

## Estructura del Repositorio

- **`sublitex-web/`**: Aplicación Next.js 16 (App Router), React 19 y Tailwind CSS 4.
  - `src/domain/`: Lógica de negocio pura (cálculo de precios, desglose BOM, proforma, validaciones).
  - `src/services/`: Adaptador DTO, cliente HTTP y validación estricta de contratos.
  - `src/mocks/`: Simulador local con persistencia y seed del pedido real PROMO 2002.
  - `src/components/`: Componentes organizados por dominio y capacidad.
- **`openspec/`**: Especificaciones funcionales del sistema (Spec-Driven Development).
  - `specs/`: Requerimientos vivos del sistema (`pedidos`, `detalle-pedido`, `prendas`, `proforma`, `catalogos`, `integracion-bk2`).
  - `changes/`: Historial de cambios propuestos y archivados.
- **`docs/`**: Fuentes de verdad técnicas (esquema relacional, restricciones SQL y catálogo de reglas).

---

## ¿Cómo Proponer Cambios o Nuevas Funcionalidades?

Toda nueva característica o modificación a una funcionalidad existente se gestiona mediante especificaciones formales con OpenSpec.

👉 **Consulta la [Guía de Contribución (CONTRIBUTING.md)](CONTRIBUTING.md)** para conocer el flujo de trabajo en 3 pasos antes de escribir código.
