# ObrasRD Search Normalization

## Objetivo
Permitir busquedas con lenguaje comun dominicano de construccion sin romper la taxonomia canonica (`stage -> discipline -> service -> work type`).

## Alcance actual
Implementado en el flujo SPA de [SearchPage](../src/pages/SearchPage.tsx):

- normalizacion acento-insensible
- lowercase
- tolerancia singular/plural simple
- mapeo deterministico de jerga -> terminos canonicos
- fallback seguro cuando no hay match
- logging opcional de queries no mapeadas (solo si hay analytics disponible en `window`)

No incluye AI search ni embeddings.

## Componentes

1. Utilidad de normalizacion:
- `src/lib/search/search-normalization.ts`
- API principal: `buildSearchNormalization(rawQuery)`

2. Diccionario de sinonimos/jerga:
- `src/lib/search/dominican-construction-synonyms.ts`
- Ejemplos incluidos:
  - `poner piso`
  - `tirar una loza / losa`
  - `hacer planos`
  - `arreglar filtracion`
  - `levantar una pared`
  - `hacer una marquesina`
  - `tirar corriente`
  - `reparar techo`
  - `remodelar bano`
  - `frisar pared`
  - `hacer verja`
  - `cambiar tuberia`
  - `hacer cisterna`
  - `poner paneles solares`

3. Logging privacy-safe:
- `src/lib/search/search-analytics.ts`
- Evento: `search_unmatched_normalized_query`
- Payload sin texto crudo: hash, cantidad de tokens, longitud de caracteres.

## Como funciona

1. Se normaliza la query (`normalizeSearchText`):
- quita tildes
- convierte a minusculas
- limpia puntuacion
- compacta espacios

2. Se generan variantes de tokens (plural/singular simple).

3. Se detectan sinonimos por patrones normalizados y se expanden terminos de busqueda con:
- slugs canonicos
- labels canonicos
- terminos de expansion
- categorias legacy relacionadas

4. Search usa `searchTerms` normalizados para comparar contra haystacks normalizados de proveedores/materiales.

5. Si la query normalizada no hace match con sinonimos ni vocabulario canonico, se marca como unmatched (para observabilidad opcional).

## Principios

- Taxonomia canonica sigue siendo la fuente de verdad.
- Comportamiento deterministico y testeable.
- Compatible con migracion parcial y datos legacy.
- Facil de extender agregando entradas al diccionario.

## Cobertura inicial de frases solicitadas

Cubiertas por pruebas automatizadas:
- `poner piso`
- `tirar una loza`
- `hacer planos`
- `arreglar filtracion`
- `levantar una pared`
- `hacer una marquesina`
- `tirar corriente`
- `reparar techo`
- `remodelar baño`

## Como expandir el diccionario

1. Agrega una nueva entrada en `DOMINICAN_CONSTRUCTION_SYNONYMS` con:
- `id` estable
- `patterns` en lenguaje real de usuario
- `canonical` (slugs canonicos)
- `expansionTerms` para recall adicional

2. Mantener determinismo:
- no expresiones ambiguas excesivas
- no side effects
- evitar terminos sensibles o PII

3. Agregar/ajustar pruebas en:
- `src/lib/search/search-normalization.test.ts`

## Pruebas

- `src/lib/search/search-normalization.test.ts`
- Cobertura base:
  - normalizacion de tildes/case
  - expansion de jerga a canonico
  - tolerancia singular/plural
  - deteccion de query unmatched
  - cobertura de frases comunes solicitadas
