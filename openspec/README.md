# OpenSpec SIPES BK1

Este directorio contiene la especificación ejecutable de alcance, datos,
contratos y reglas del Backend 1 de SIPES.

## Fuentes normativas

1. `01___Manual_SIPES.md`
2. `02___Catálogo_de_reglas.md`
3. `Pedido Management Cascade-2026-09-15-152443.svg`
4. `RptSoft-Sublitex/prisma/schema.prisma`
5. `RptSoft-Sublitex/prisma/01_constraints.sql`
6. `RptSoft-Sublitex/contrato-api.md`
7. `RptSoft-Sublitex/SIPES-repo/fixtures/PROMO2002_prendas.csv`
8. Contrato BK2 en `contrato_api.md`

El mapeo de nombres comerciales del fixture está en
`openspec/bk1/fixture-mapping.md`.

## Alcance

Esta especificación cubre clientes, pedidos, colores, grupos, catálogos,
configuración base, estado de pedido y resumen de producción. BK2 consume sus
identificadores y catálogos, pero sus participantes, prendas, excepciones y
personalizaciones no forman parte de esta implementación.

## Estado

La Fase 2 de BK1 está operativa. Las pruebas de reglas existentes y el build
deben pasar antes de integrar cambios posteriores.
