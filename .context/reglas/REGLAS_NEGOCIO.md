# REGLAS DE NEGOCIO CRÍTICAS — SUBLITEX SIPES
# Sistema de Gestión Operativa de Pedidos
# Versión: 0.2 | Actualizado: 2026-09-16
# Este archivo es la fuente de verdad para BK1, BK2 y Frontend.

---

## ENUMS OFICIALES DE LA BASE DE DATOS (Prisma/PostgreSQL)

### EstadoPedido (8 estados — ciclo de vida completo)
```
BORRADOR          → Estado inicial al crear pedido
EN_CONFIGURACION  → Se está definiendo grupos, colores, tallas
EN_RECOLECCION    → Se están recolectando datos de participantes
EN_REVISION       → Revisión interna del taller antes de producción
EN_PRODUCCION     → En máquinas de sublimación/confección
ENTREGADO         → Entregado físicamente al cliente
CERRADO           → Liquidado comercialmente
CANCELADO         → Anulado (desde cualquier estado)
```
⚠️  NUNCA usar: EN_COTIZACION, ACTIVO, FINALIZADO (NO existen en schema.prisma)

### PoliticaNumeracion (2 valores ÚNICOS)
```
LIBRE   → Números pueden repetirse o estar en cualquier orden
          Ejemplo: promos escolares (4 alumnos con el número 7 = normal)
UNICA   → Cada número debe ser único dentro del grupo
          Ejemplo: equipos de fútbol (no pueden haber 2 jugadores con el #10)
```
⚠️  NUNCA usar: CORRELATIVO — No existe en schema.prisma. Causa error 500 en Postgres.

### TipoCliente (5 valores)
```
COLEGIO | PROMOCION | CLUB | EMPRESA | PARTICULAR
```

### EstadoParticipante (3 valores — BK2)
```
PENDIENTE | REGISTRADO | CONFIRMADO
```

### TipoBloque (3 valores — BK2)
```
DISENO | LISTA | COMERCIAL
```

### TipoPrenda (3 valores — BK2)
```
VENTA | OBSEQUIO | MUESTRA
```
R-K02: OBSEQUIO y MUESTRA se fabrican pero NO se cobran al cliente.

### Genero (5 valores — BK2, para prendas y participantes)
```
HOMBRE | MUJER | NINO | NINA | SIN_ESPECIFICAR
```
R-K01: Género del PORTADOR ≠ Corte de la prenda ≠ Cuello. Son 3 campos separados.

---

## REGLAS DE NEGOCIO PRINCIPALES

### R-A03 — Código de Pedido
- Formato: SUB-XXXX donde XXXX es correlativo secuencial (SUB-0001, SUB-0002...)
- Se genera automáticamente al crear el pedido, NO lo envía el usuario.

### R-A05 — Estado del Pedido
- El pedido siempre inicia en estado BORRADOR.
- Campo `motivo` del cambio de estado es OPCIONAL.
- Endpoint: PATCH /api/pedidos/:id/estado (método PATCH, no PUT ni GET)

### R-B01 / R-G01 — Política de Numeración
- LIBRE es el default. Solo UNICA para equipos deportivos.
- Si politicaNumeracion = UNICA: `prisma/01_constraints.sql` rechaza duplicados automáticamente.

### R-B02 — Cantidad Contratada
- `cantidadContratada` en Grupo es el número acordado comercialmente.
- BK2 la usa para calcular /api/pedidos/:id/resumen-produccion.
- Es OBLIGATORIA en Grupo.

### R-K03 — Piezas Físicas por TipoProducto
- Un CONJUNTO = 1 camiseta + 1 short + 1 par de medias (3 piezas físicas).
- Los totales de producción se calculan por piezas físicas, NO por "unidades".
- Valores en TipoProducto: { camisetas, shorts, medias }.

### R-K05 — Código HEX de Color Obligatorio
- Formato estricto: #RRGGBB (6 dígitos hex, con el #)
- Regex: /^#([0-9A-Fa-f]{6})$/
- Valores inválidos: "#FFF", "azul", "rgb(0,0,255)" → error 400.
- La ruta acepta un color individual o un arreglo no vacío; todos los elementos
  deben cumplir la validación HEX antes de persistirse.

### R-D05 — Participantes (BK2)
- Un Participante NO es un Usuario del sistema.
- Se registra mediante enlace firmado sin cuenta de usuario.
- El coordinador del cliente NO puede editar datos de un participante.

### R-F06 — Observaciones
- OPCIONALES en Grupo, Pedido y Participante. No afectan cálculos.

### R-H03 — Control de Producción (BK2)
- El resumen compara prendas_reales vs cantidadContratada.
- Si prendas_reales < cantidadContratada → alerta de faltantes.

---

## RELACIONES ENTRE MÓDULOS

```
Cliente
  └─ Pedido (N por cliente)
       ├─ ColorPedido (colores HEX del diseño — BK1)
       ├─ BloquePedido (DISENO, LISTA, COMERCIAL — BK2)
       └─ Grupo (N por pedido — BK1 crea, BK2 llena con participantes)
            ├─ TipoProducto (FK obligatoria — del catálogo maestro)
            ├─ ValorConfiguracion (CUELLO, TELA, CORTE, ACABADO)
            ├─ Participante (BK2 registra)
            └─ Prenda (BK2 crea — una por participante×grupo)
```

---

## DEPENDENCIAS DE CATÁLOGO (seed obligatorio antes de crear grupos)

### TipoProducto
| código       | nombre              | camisetas | shorts | medias |
|--------------|---------------------|-----------|--------|--------|
| CAMISETA     | Camiseta deportiva  | 1         | 0      | 0      |
| SHORT        | Short deportivo     | 0         | 1      | 0      |
| CONJUNTO     | Conjunto deportivo  | 1         | 1      | 0      |
| KIT_COMPLETO | Kit completo        | 1         | 1      | 1      |
| CASACA       | Casaca/Buzo         | 1         | 0      | 0      |

### TallaCatalogo
- Adulto: S, M, L, XL, XXL
- Niño: 4, 6, 8, 10, 12, 14, 16

---

## PUERTOS Y URLs BASE
- Backend BK1:   http://localhost:3001
- Frontend:      http://localhost:3000 (Next.js)
- Swagger/Docs:  http://localhost:3001/api/docs
