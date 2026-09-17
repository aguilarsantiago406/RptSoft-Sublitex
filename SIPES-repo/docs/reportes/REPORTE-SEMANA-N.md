# REPORTE · SEMANA _N_ · SIPES

**SIPES — SIstema de PEdidos Sublitex**

| | |
|---|---|
| Semana | _1 / 2 / 3 / 4_ |
| Fecha de cierre | _AAAA-MM-DD_ |
| Lo arma | El guardián (Backend 1) |
| Cuándo | Viernes, antes de las 6:00 p.m. |
| Dónde se guarda | `docs/reportes/REPORTE-SEMANA-N.md` en el repositorio |

**La regla de este documento: nada que un comando pueda responder se escribe a mano.**
Si dice "avanzamos bien" y no hay salida de comando que lo respalde, no cuenta como avance.

---

## PARTE 1 · Lo que dice la máquina

Lo pega el guardián. Una sola vez para todo el equipo. Se corre en la rama principal, no en la de nadie.

### 1.1 · Tests: cuántos corren y cuántos pasan

```
npm test -- --verbose 2>&1 | tail -n 60
```

> Pega la salida completa aquí, sin recortar los fallos.
> Si algo falla, se pega igual. Un reporte sin fallos en la semana 1 es más sospechoso que uno con tres.

```
(salida)
```

### 1.2 · Qué reglas tienen test

```
grep -rhoE "R-[A-K][0-9]{2}" test/ | sort -u | tr '\n' ' '
```

> Como el identificador de la regla es el nombre del test, esta lista es la única prueba de qué reglas existen de verdad en el sistema. Se cruza contra el catálogo.

```
(salida)
```

### 1.3 · Qué reglas están citadas en el código pero no tienen test

```
comm -23 <(grep -rhoE "R-[A-K][0-9]{2}" src/ | sort -u) <(grep -rhoE "R-[A-K][0-9]{2}" test/ | sort -u) | tr '\n' ' '
```

> Esta lista debería estar vacía. Cada identificador que aparezca acá es código que nadie está verificando.

```
(salida)
```

### 1.4 · Triggers en la base de datos

```
psql "$DATABASE_URL" -c "SELECT tgname FROM pg_trigger WHERE NOT tgisinternal ORDER BY tgname;"
```

> Tienen que salir los **ocho** del archivo `01_constraints.sql`. Si salen menos, la fundación no está puesta y todo lo demás está construido sobre nada.

```
(salida)
```

### 1.5 · Commits de la semana

```
git log --since="7 days ago" --pretty=format:"%ad · %an · %s" --date=short
```

> Acá se ve quién trabajó en qué bloque sin que nadie tenga que preguntarlo.

```
(salida)
```

### 1.6 · Integración continua

```
gh run list --limit 10
```

> Si no usan GitHub CLI, pega el estado del último pipeline de la rama principal: verde o rojo, y desde cuándo.

```
(salida)
```

### 1.7 · El contrato de la API, tal como quedó el viernes

> Pega la lista de endpoints con su forma: método, ruta, qué recibe, qué devuelve.
> Si cambió respecto del lunes, marca con `←  CAMBIÓ` cada línea que cambió y por qué.

```
(contrato)
```

---

## PARTE 2 · Lo que escribe cada persona

Cinco bloques. **Dos líneas por respuesta, no más.** Si no cabe en dos líneas, es que todavía no está claro.

Copia este bloque cinco veces, uno por persona.

### _Nombre_ — _frente_ (guardián / backend / frontend base / frontend tabla)

**1. Qué entregué esta semana.**
Nombra las reglas por su identificador. "Terminé la tabla" no es una entrega; "R-E03 y R-E05 en verde" sí.

> _(dos líneas)_

**2. Qué no llegué a entregar, y por qué.**
Esta respuesta nunca es "nada". Si de verdad entregaste todo, entonces lo asignado era poco y eso también hay que saberlo.

> _(dos líneas)_

**3. Qué regla me pareció ambigua, incompleta o imposible de probar.**
Se reporta con el prefijo `REGLA:`. Decir "ninguna" es una respuesta válida, pero si los cinco dicen "ninguna" es que nadie leyó el catálogo con cuidado.

> _(dos líneas)_

**4. Dónde me trabé más de treinta minutos, y cómo salí.**
El bloqueo es un dato, no una falta. Lo que sí es una falta es haberse quedado tres horas sin decirlo.

> _(dos líneas)_

---

## PARTE 3 · La pregunta de la semana

La responde el guardián, en cinco líneas, hablando por el equipo:

**¿Qué cosa creíamos el lunes que resultó falsa el viernes?**

> _(cinco líneas)_

Si la respuesta es "nada", la semana no enseñó nada, y eso es un problema de la semana, no de la pregunta.

---

## Lo que NO va en este reporte

- Capturas de pantalla.
- Porcentajes de avance. No existe "70% listo": la regla está en verde o no lo está.
- "Ya está casi", "solo falta probar", "funciona en mi máquina".
- Código pegado. Para eso está el repositorio.
- Justificaciones. Los motivos de lo no entregado van en dos líneas en la pregunta 2 y ahí terminan.

---

## Qué pasa después

1. **Viernes** · El guardián arma este archivo y lo entrega.
2. **Fin de semana** · Se revisa: qué está verde de verdad, qué se salió del contrato, qué reglas se declararon sin test.
3. **Lunes** · Vuelven **tres correcciones concretas** para la semana siguiente. Tres, no quince.

Esas tres correcciones entran al trabajo de la semana antes que cualquier funcionalidad nueva.
