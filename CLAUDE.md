# Dogfy CRM · Sales — Contexto del proyecto

## Stack
- Vue 3 + TypeScript + Vite
- PrimeVue v4 (tema Aura, customizado en `src/theme/dogfy.ts`)
- Pinia (stores: `auth`, `reto`)
- Chart.js via `<Chart>` de PrimeVue
- CSS scoped por componente + variables globales en `src/assets/main.css`

---

## Deploy

- **URL producción:** https://dogfy-crm-sales.vercel.app
- **Plataforma:** Vercel (proyecto `dogfy-crm-sales`, cuenta `hacemosproducto`)
- **Deploy:** `vercel --prod` desde la raíz del proyecto
- **SPA routing:** `vercel.json` en la raíz — redirige todas las rutas a `index.html`

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## Roles y vistas

El prototipo simula tres roles seleccionables desde la barra superior:

| Rol | Componente dashboard | Panel derecho |
|---|---|---|
| `agente` | `DashboardAgente.vue` | Calendario semanal + Citas + Recordatorios |
| `team_lead` | `DashboardTeamLead.vue` | Objetivo mensual (barra verde) + Reto semanal + Recordatorios |
| `manager` | `DashboardManager.vue` | Objetivos mes por país + Leads por país + Recordatorios |

El panel derecho vive en `AppRightPanel.vue` y renderiza condicionalmente según `auth.currentRole`.

---

## Paleta de colores (`src/theme/palette.ts`)

```ts
export const CHART_COLORS = [
  '#3B82F6',  // 0 — blue-500    (primario / No gestionados)
  '#2dd4bf',  // 1 — teal-400    (secundario / No contesta)
  '#fbbf24',  // 2 — amber-400   (frescos)
  '#4ade80',  // 3 — green-400   (adicional)
  '#f9a8d4',  // 4 — pink-300
  '#60a5fa',  // 5 — blue-400
]
export const CHART_AREA_FILL = 'rgba(59, 130, 246, 0.08)'
export const CHART_PREV_COLOR = '#c2c2c2'   // línea periodo anterior (dashed)
```

**Regla de adyacencia en donuts:** en donuts de 3 segmentos, el segmento 0 y 2 son adyacentes (se tocan). Usar blue→teal→amber para máximo contraste.

---

## Color semántico: éxito / objetivos

```css
--success: #22c55e;    /* green-500 */
--success-bg: #dcfce7;
```

- **TODAS** las barras de progreso de **objetivos a cumplir** usan `var(--success)`.
- Aplica en:
  - `KpiCard.vue` — barra `progreso/objetivo` dentro de las KPI cards (`:deep(.kpi-progress .p-progressbar-value)`)
  - `AppRightPanel.vue` — ProgressBar del TeamLead (`:deep(.p-progressbar-value)`)
  - `AppRightPanel.vue` — barras "Objetivos mes" del Manager (divs custom con `var(--success)`)
  - `DashboardTeamLead.vue` — ProgressBar de objetivo mensual
  - Toggles, radio buttons, checkboxes: overrides en `main.css`

**Patrón de override PrimeVue ProgressBar** (usar siempre con `!important`):
```css
:deep(.p-progressbar-value) { background: var(--success) !important; }
```

---

## Barras de proyección / Meta (Chart.js)

Las barras de "Meta" en gráficos de barras usan textura de rayas diagonales para distinguirlas de las barras de realidad.

```ts
// En palette.ts
export function createMetaPattern(barColor: string, bgColor = '#BFDBFE'): CanvasPattern | string

// Uso en datasets:
{ label: 'Meta', backgroundColor: createMetaPattern('white', '#BFDBFE'), borderWidth: 0, borderRadius: 4, borderSkipped: false }
```

- Fondo: `#BFDBFE` (blue-200 claro)
- Rayas: blancas, diagonales, 55% opacidad
- **Sin borde** (`borderWidth: 0`) — evita el outline que hacía las barras parecer doble-bordeadas

---

## Barras de ranking / proporción (HTML custom, no Chart.js)

Se usan divs propios en lugar de `<ProgressBar>` de PrimeVue para control total del color.

```html
<div class="bar-track">
  <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }" />
</div>
```

```css
.bar-track { height: 5px; background: var(--n-100); border-radius: 99px; overflow: hidden; }
.bar-fill  { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
```

Aplica en: Bolsa de leads (Manager y TeamLead), Objetivos mes (Manager right panel), Leads por país, Top cupones, Top campañas.

**Colores por tipo de barra:**
- Datos diferenciados (leads por país, top cupones, top campañas): `CHART_COLORS[i % CHART_COLORS.length]`
- Objetivos a cumplir (barras de progreso): `var(--success)`

---

## Layout general

```
crm-main
├── sidebar (izquierda, 200px expandida / 48px colapsada)
├── crm-content
│   ├── crm-topbar (búsqueda + toggle disponibilidad)
│   └── content-wrap (max-width: 1600px; margin: 0 auto; padding: 20px 22px)
│       └── [dashboard component]
└── right-panel (derecha, ~280px)
```

- **No añadir `max-width` a `.dash-content`** — causa desalineación entre el input de búsqueda (topbar, ancho completo) y el contenido.
- El panel derecho se colapsa a 48px en ≤1024px (hover para expandir), se fuerza expandido en modo UW.
- Breakpoints de preview: TV · TH · 1440 · HD · UW — seleccionables desde la topbar.

---

## Tarjeta Reto semanal (post-it)

Color de fondo: `#FEF9C3` (amarillo muy claro), borde `#fde68a`.
Aplica en `DashboardAgente.vue` y `AppRightPanel.vue` (sección team_lead):

```css
.reto-card { background: #FEF9C3 !important; border-color: #fde68a !important; }
```

---

## Componentes UI clave

### `SectionCard.vue`
- Prop `title` activa el header con `justify-content: space-between`.
- Slot `#header` renderiza el lado derecho del header (selects, botones, CTAs).
- Si no hay `title` ni contenido en `#header`, el header no se muestra.

### `KpiCard.vue`
Props: `valor`, `label`, `comparativa`, `tendencia` (`up`|`down`), `progreso`, `objetivo`, `badge`, `tone`.
- La barra de progreso interna (`progreso/objetivo`) es verde success via `:deep(.kpi-progress .p-progressbar-value)`.
- `tone` acepta: `rose` | `amber` | `emerald` | `violet` — cambia el fondo de la card.

### `AgentAvatar.vue`
Avatar circular con iniciales. Props: `name`, `size`.

### Calendario semanal (agente)
- Hoy: fondo neutro `var(--n-200)`, NO brand color.
- Días con evento: punto `var(--brand)`.
- Datos de citas en `src/data/mock.ts` → `mockProximasCitas` (array con campo `date: 'YYYY-MM-DD'`).
- **Mantener fechas actualizadas al mes corriente** para que los puntos aparezcan.

---

## Ficheros clave

| Fichero | Propósito |
|---|---|
| `src/theme/palette.ts` | Colores de charts, fill de área, patrón hatch Meta |
| `src/theme/dogfy.ts` | Tokens PrimeVue (botones, tags, colores de componentes) |
| `src/assets/main.css` | Variables CSS globales (`--success`, `--brand`, neutros `--n-*`) + overrides PrimeVue |
| `src/data/mock.ts` | Todos los datos de muestra del prototipo |
| `src/stores/auth.ts` | Rol activo (`currentRole`), modo preview (`previewWidth`) |
| `src/stores/reto.ts` | Contenido del reto semanal (editable desde modal `EditarRetoModal.vue`) |
| `src/components/layout/AppRightPanel.vue` | Panel derecho — lógica de rol, widgets (citas, recordatorios, objetivos) |
| `src/components/layout/AppSidebar.vue` | Sidebar de navegación con colapso |
| `src/components/layout/AppTopbar.vue` | Barra superior — selector de rol, breakpoints, búsqueda |
| `src/components/ui/SectionCard.vue` | Card contenedor universal con slot de header |
| `src/components/ui/KpiCard.vue` | Card de KPI con barra de progreso opcional |
| `src/components/dashboard/DashboardAgente.vue` | Dashboard vista Agente |
| `src/components/dashboard/DashboardTeamLead.vue` | Dashboard vista Team Lead |
| `src/components/dashboard/DashboardManager.vue` | Dashboard vista Manager |
| `vercel.json` | Rewrite rule para SPA routing en Vercel |

---

## Datos mock

Todos los datos viven en `src/data/mock.ts`. No hay backend — es un prototipo con datos simulados. Para cambiar cualquier dato visible en el prototipo, editar ese fichero.

Exports principales:
- `mockAgente` — datos del agente logueado (nombre, ventas, CR, bracket…)
- `mockLeadsActivos` — tabla de leads activos con estados
- `mockEquipoBarras` — datos para el gráfico de barras del TeamLead
- `mockTopVentas` — ranking top vendedores
- `mockObjetivosPaises` — objetivos mensuales por país (Manager)
- `mockLeadsPorPais` — distribución de leads por país (Manager)
- `mockProximasCitas` — citas próximas con campo `date: 'YYYY-MM-DD'`
- `mockRecordatorios` — lista de recordatorios (to-do)

---

## Notas de desarrollo

- `InputNumber` de PrimeVue: `inputStyle` debe ser **objeto**, no string.
  ```html
  <!-- Correcto -->
  <InputNumber :inputStyle="{ width: '56px', textAlign: 'center' }" />
  <!-- Incorrecto — error de build TS -->
  <InputNumber inputStyle="width:56px;text-align:center" />
  ```
- Las opciones de selects con tipo unión deben tipearse explícitamente en el array para evitar error de asignación.
- El store `auth.ts` no usa `onMounted`/`onUnmounted` — no importarlos.
