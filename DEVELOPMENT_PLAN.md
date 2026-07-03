# Trajectus Magna — Plan de reconstrucción (v2)

> Prompt original adaptado: *"reconstruye todo nuestro código desde cero; la versión antigua
> es tu spec; construye una versión 10 veces mejor; escribe tests que capturen todo lo que
> hace ahora y repite hasta pasarlos todos."*

## 0. Alcance (adaptación del prompt a este proyecto)

Este repo es el tema base **Atelier** (vendor, no se toca) + una **capa custom "TM"**
(~4.200 líneas). Lo que se reconstruye desde cero es la capa TM:

| Área | Archivos |
|---|---|
| Secciones | `countdown-hero`, `tm-home-postdrop`, `tm-collection-header`, `tm-collection-strip`, `tm-product-editorial` |
| Snippets | `tm-header`, `tm-footer` |
| Plantillas standalone | `page.acceso`, `page.acceso-codigo`, `page.la-firma`, `page.unboxing` |
| Layouts modificados | `layout/theme.liquid`, `layout/password.liquid` |
| CSS global | `assets/tm-global.css` |

No se reconstruyen: el tema Atelier, ni los micro-parches a `meta-tags`,
`search-results` y `predictive-search-products-list` (vendor con ajuste mínimo).

## 1. La spec = comportamiento observable de la versión antigua

Invariantes que los tests fijan (extraídos del código antiguo):

1. **Drop**: fecha `2026-06-05T18:00:00+02:00`; countdown D/H/M/S que clampa a `00` al vencer.
2. **Modo pre/post drop**: `html.post-drop` oculta `.tm-section-drop`, `#header-group`,
   `#footer-group`; `html.pre-drop` oculta `.tm-home-postdrop`. Header/footer TM solo en post-drop.
3. **Acceso por código** (`page.acceso-codigo`): 20 códigos VIP exactos (`DV-001`…`SP-020`),
   código público `TM2026` (solo válido tras la fecha del drop), cookies `tm_vip`/`tm_access`
   (30 días, `path=/`, `SameSite=Lax`), redirección a `/collections/club`.
4. **Home post-drop**: colección `club`, 2 productos (hover a segunda imagen), fallback cards
   con assets locales, strip de specs (280g/m² · 100% Algodón Piqué · Escudo Heráldico),
   manifiesto «No todo está disponible para todos.» → `/pages/la-firma`.
5. **Countdown hero (pre-drop)**: eyebrow `05 · VI · MMXXVI`, título `CLUB POLO`,
   CTA `ACCESO ANTICIPADO`, formulario `contact` de notificación.
6. **La Firma**: manifiesto + 5 pilares numerados con títulos exactos.
7. **Unboxing**: 2 fases, código regalo `MAGNA02`, botón copiar con fallback, `noindex, nofollow`.
8. **Password page**: countdown + toggle `ACCESO ANTICIPADO` que revela el form
   `storefront_password` (con `aria-expanded`).
9. **Identidad**: paleta negro/crudo, Cormorant Garamond + DM Sans, `prefers-reduced-motion`
   respetado en todo, IDs de settings existentes preservados (los JSON de plantillas ya
   publicados siguen funcionando).

## 2. Qué significa «10× mejor» aquí

1. **Un solo sistema de diseño** — `assets/tm-tokens.css` unifica los dos sistemas de
   variables que estaban en conflicto (`--tm-bg #0a0a0f` vs `--tm-black #0a0a0a`).
2. **Cero duplicación de lógica** — JS compartido y testeable en `assets/`:
   - `tm-countdown.js` (matemática pura + montaje por `data-tm-deadline`)
   - `tm-access.js` (clasificación de códigos pura + cookies + montaje por config JSON)
   - `tm-motion.js` (reveal por IntersectionObserver, stagger, fallback, reduced-motion)
   - `tm-menu.js` (menú móvil con focus trap, Escape y retorno de foco)
3. **Fecha del drop en un solo sitio por superficie** — setting de sección con default,
   `data-tm-deadline` en el DOM; ya no hay 4 copias hardcodeadas inconsistentes.
4. **Modo pre/post drop real** — deja de estar forzado a `post-drop`: se calcula por fecha,
   con override de desarrollo `?tm_mode=pre|post` (persistido en `sessionStorage`).
5. **Contenido editable** — textos, enlaces y specs pasan a settings/blocks de schema con
   los valores actuales como default (el editor de temas por fin sirve).
6. **CSS cacheable** — estilos de sección extraídos a assets (`tm-drop.css`, `tm-postdrop.css`,
   `tm-standalone.css`) en vez de `<style>` inline repetido por render.
7. **Imágenes responsive** — `image_url` + `srcset`/`sizes` + `width`/`height` en vez de un
   único tamaño fijo.
8. **Accesibilidad** — focus trap en menú móvil, countdown sin `aria-live` por segundo
   (anuncio útil en vez de spam al lector de pantalla), roles/labels consistentes.
9. **Testeable** — `npm test` (`node --test`, sin dependencias) valida contratos + lógica.

## 3. Estrategia de tests (TDD sobre la spec)

- `tests/contracts/*.test.js` — contratos de comportamiento extraídos de la versión antigua.
  Se ejecutan contra el código viejo (línea base verde) y deben seguir verdes tras la
  reconstrucción. Cada test lee el "bundle" de una feature (liquid + assets referenciados),
  así son agnósticos a si el código está inline o extraído.
- `tests/unit/*.test.js` — lógica pura de la nueva arquitectura (countdown, clasificación
  de códigos, cookies). Rojos sobre el código viejo (no era testeable); verdes al final.
- `shopify theme check` — lint de Liquid/JSON como puerta final.

Ciclo: escribir tests → línea base → reconstruir → `npm test` en bucle hasta verde total.

## 4. Fases

1. **Tests** que capturan la spec (este plan, sección 1 y 3). ✅ línea base
2. **Fundaciones**: `tm-tokens.css`, `tm-motion.js`, `tm-countdown.js`, `tm-access.js`, `tm-menu.js`.
3. **Reconstrucción** de secciones, snippets, plantillas standalone y layouts sobre las fundaciones.
4. **Iteración** hasta que contratos + unit + theme check pasen.
5. Verificación visual en preview (`shopify theme dev`) — pendiente de humano.
