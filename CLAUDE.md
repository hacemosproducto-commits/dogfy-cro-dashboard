# Dogfy CRM · Sales — Contexto del proyecto

## Stack
- Vue 3 + TypeScript + Vite
- PrimeVue v4 (tema Aura, customizado en `src/theme/dogfy.ts`)
- Pinia (stores: `auth`, `reto`)
- Chart.js via `<Chart>` de PrimeVue
- CSS scoped por componente + variables globales en `src/assets/main.css`

---

## Estrategia de ramas

| Rama | Propósito | Vercel URL |
|------|-----------|-----------|
| `v2-ideal` | Visión completa: todas las mejoras UX **+** features nuevas. Es la rama principal de desarrollo del prototipo. | https://dogfy-crm-sales.vercel.app |
| `v1-ux-only` | Solo mejoras de UX sobre el CRM actual — sin features nuevas. Misma funcionalidad que el staging, mejor experiencia visual. | https://dogfy-crm-v1-ux.vercel.app |

- Para retomar trabajo en V2: trabaja en la rama `v2-ideal`
- Para retomar trabajo en V1: trabaja en la rama `v1-ux-only`
- Repositorio: https://github.com/hacemosproducto-commits/dogfy-cro-dashboard

---

## Deploy

- **URL producción (V2):** https://dogfy-crm-sales.vercel.app
- **Plataforma:** Vercel (proyecto `dogfy-crm-sales`, cuenta `hacemosproducto`)
- **Deploy:** `vercel deploy --prod --yes` desde la raíz del proyecto
- **SPA routing:** `vercel.json` en la raíz — redirige todas las rutas a `index.html`

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## Acceso / Password gate

La app está protegida con una pantalla de contraseña antes de renderizar nada.

- **Contraseña:** `CRM1234`
- Implementada en `src/components/layout/PasswordGate.vue`
- Al entrar correctamente guarda `dogfy_crm_auth = '1'` en `localStorage` — no vuelve a pedir hasta que se borre
- Para cambiar la contraseña: editar `const PASS = 'CRM1234'` en `PasswordGate.vue`
- Para forzar re-login: borrar `localStorage.removeItem('dogfy_crm_auth')` en DevTools

---

## Roles y vistas

El prototipo simula tres roles seleccionables desde la barra superior (DevToolbar):

| Botón toolbar | Rol | Usuario mock | Dashboard | Panel derecho |
|---|---|---|---|---|
| Agente | `agente` | Juan Camilo Cruz | `DashboardAgente.vue` | Calendario semanal + Citas + Recordatorios |
| Team Lead | `team_lead` | Michele Carlini | `DashboardTeamLead.vue` | Objetivo mensual + Reto semanal + Recordatorios |
| Manager | `manager` | Judit Cabrera | `DashboardManager.vue` | Objetivos mes por país + Leads por país + Recordatorios |

El panel derecho vive en `AppRightPanel.vue` y renderiza condicionalmente según `auth.currentRole`.

---

## Paleta de colores (`src/theme/palette.ts`)

```ts
export const CHART_COLORS = [
  '#3B82F6',  // 0 — blue-500    (primario / No gestionados)
  '#2dd4bf',  // 1 — teal-400    (secundario / No contesta)
  '#fbbf24',  // 2 — amber-400   (frescos)
  '#4ade80',  // 3 — green-400   (adicional / Pausados)
  '#6366F1',  // 4 — indigo-500  (extra — usado para "Otros")
  '#60a5fa',  // 5 — blue-400
]
export const CHART_AREA_FILL = 'rgba(59, 130, 246, 0.08)'
export const CHART_PREV_COLOR = '#c2c2c2'   // línea periodo anterior (dashed)
```

**Regla de adyacencia en donuts:** en donuts de 3 segmentos, el segmento 0 y 2 son adyacentes (se tocan). Usar blue→teal→amber para máximo contraste.

**`CHART_PREV_COLOR` reservado para líneas de período anterior** (dashed, gris) en charts de histórico. **No usarlo en segmentos de donut** — usar `CHART_COLORS[4]` (indigo) cuando se necesite un 4º color.

---

## Color semántico: éxito / objetivos

```css
--success: #22c55e;    /* green-500 */
--success-bg: #dcfce7;
```

- **TODAS** las barras de progreso de **objetivos a cumplir** usan `var(--success)`.
- Aplica en:
  - `KpiCard.vue` — barra `progreso/objetivo` (`:deep(.kpi-progress .p-progressbar-value)`)
  - `AppRightPanel.vue` — ProgressBar del TeamLead (`:deep(.p-progressbar-value)`)
  - `AppRightPanel.vue` — barras "Objetivos mes" del Manager (divs custom)
  - `DashboardTeamLead.vue` — ProgressBar de objetivo mensual
  - Toggles, radio buttons, checkboxes: overrides en `main.css`

**Chips y badges verdes:** usar `color: #15803d` (green-700) sobre `--success-bg` para contraste suficiente. No usar `var(--success)` como color de texto.

**Patrón de override PrimeVue ProgressBar:**
```css
:deep(.p-progressbar-value) { background: var(--success) !important; }
```

---

## Barras de proyección / Meta (Chart.js)

```ts
{ label: 'Meta', backgroundColor: createMetaPattern('white', '#BFDBFE'), borderWidth: 0, borderRadius: 4, borderSkipped: false }
```
- Fondo: `#BFDBFE` (blue-200), rayas blancas diagonales, sin borde.

---

## Barras de ranking / proporción (HTML custom)

```html
<div class="bar-track">
  <div class="bar-fill" :style="{ width: item.pct + '%', background: item.color }" />
</div>
```
```css
.bar-track { height: 5px; background: var(--n-100); border-radius: 99px; overflow: hidden; }
.bar-fill  { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
```
- Datos diferenciados: `CHART_COLORS[i % CHART_COLORS.length]`
- Objetivos: `var(--success)`

---

## Botones y modales — convenciones

### Outlined neutral (override global)
En `main.css`, todos los `p-button-outlined` sin `severity` específica reciben automáticamente un tratamiento neutral (texto `var(--n-600)`, borde `var(--n-300)`):
```css
.p-button.p-button-outlined:not(.p-button-danger):not(.p-button-success):not(.p-button-warning):not(.p-button-info) {
  color: var(--n-600) !important;
  border-color: var(--n-300) !important;
  background: transparent !important;
}
```
**Consecuencia:** ya no se necesita una clase `.btn-secondary`. Cualquier `<Button outlined>` queda neutro por defecto.

### Cabecera unificada en modales de edición

Todos los modales de edición usan el mismo patrón visual en el header:
- **Círculo neutro** (`var(--n-100)` bg / `var(--n-600)` color, 36×36px, `border-radius: 50%`) con icono centrado
- **Título** en 15px / font-weight 600 / `var(--n-800)` debajo del icono
- **Subtítulo** opcional en 12px / `var(--n-400)`
- Header con `border-bottom: 1px solid var(--n-150)` vía `:pt`

**Regla:** el icono del modal debe coincidir con el icono del módulo (section card) del que sale.  
SVGs de assets usan `<img :src="icon" class="modal-svg-icon" />` con `.modal-svg-icon { width: 18px; height: 18px; display: block; }`.

| Modal | Icono | Título | Subtítulo |
|---|---|---|---|
| EditarLeadModal | `pi pi-user` | Editar contacto | — |
| EditarPerroModal | `dogIcon` SVG (`@/assets/icons/dog.svg`) | Editar perro | — |
| EditarEnvioModal | `truckIcon` SVG (`@/assets/icons/truck.svg`) | Editar dirección | Datos de entrega |
| EditarRetoModal | `pi pi-trophy` | Editar reto | Objetivo del equipo esta semana |
| AsignarLeadsModal | `pi pi-users` | Asignar leads | (icono en círculo neutro) |
| ModoFeriaModal | store SVG inline (`width="18" stroke-width="1.75"`) | — | (círculo neutro) |

```css
.modal-icon {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--n-100); color: var(--n-600);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.modal-svg-icon { width: 18px; height: 18px; display: block; }
```

### Orden de botones en modales
**Regla universal:** la acción principal va a la **derecha**. La acción secundaria/cancelación a la izquierda.

| Modal / Dialog | Izquierda (secundario) | Derecha (primario) |
|---|---|---|
| Crear lead / Crear cita / Crear recordatorio / Editar reto | Cancelar (outlined) | Crear / Guardar |
| Asignar leads | Cancelar (outlined) | Asignar |
| Notificación tipo `cita` | Ver en agenda (outlined si hay lead) | Ir al lead |
| Notificación tipo `error` | Gestionar en lead (outlined si hay teléfono) | Llamar |
| Notificación tipo `recordatorio` | Aplazar (outlined) | Marcar como hecho |
| Lista de difusión | Cancelar (outlined) | Enviar lista |

**Jerarquía de acciones:** `Llamar` > `Ir al lead` > `Ver en agenda` > `Ver calendario`. Cuando coexisten, la más prioritaria se promueve a primaria (derecha).

**Patrón de implementación con outlined dinámico:**
```html
<!-- Si hay ambos botones, el secundario se vuelve outlined -->
<Button label="Ver en agenda" icon="pi pi-calendar" :outlined="!!selected.leadId" @click="..." />
<Button v-if="selected.leadId" label="Ir al lead" icon="pi pi-user" @click="..." />
```

### Modales en mobile · TODOS como bottom sheets

Patrón unificado: en mobile (`≤ 480px` y preview `.is-mob`) **todos los dialogs de PrimeVue** se convierten automáticamente en bottom sheets:

- Anclados al borde inferior (`align-items: flex-end` en `.p-dialog-mask`)
- Ancho completo (100%)
- Esquinas superiores redondeadas (`border-radius: 16px 16px 0 0`)
- Altura máxima 90vh (el backdrop superior sigue visible → tap para dismiss)
- **Drag handle visual** (barrita gris en el centro arriba del modal) generada via `::before`

```css
@media (max-width: 480px) {
  .p-dialog-mask { align-items: flex-end !important; justify-content: stretch !important; }
  .p-dialog-mask .p-dialog {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    border-radius: 16px 16px 0 0 !important;
    max-height: 90vh !important;
  }
  .p-dialog-mask .p-dialog::before {
    content: '';
    /* drag handle 36×4px gris arriba */
  }
}
```

**Excepción**: `.full-bottom-sheet` (WhatsApp/Histórico desde FAB) toma `calc(100dvh - 48px)` — sigue siendo casi pantalla completa.

`.detail-dialog--bottom` (notif/cita/recordatorio sheets) hereda el patrón general.

Aplica a TODOS los modales del prototipo automáticamente: CrearLeadModal, CrearCitaModal, CrearRecordatorioModal, AsignarLeadsModal, EditarLeadModal, EditarPerroModal, EditarEnvioModal, EditarRetoModal, Lista de difusión, etc.

Gemela `.is-mob` en `main.css` para preview mode.

### Dialog responsive (bottom sheet / centered)
Detección reactiva con `windowWidth` ref + listener de resize. Patrón compartido en `NotificacionesView` y `AppRightPanel`:
```ts
const _isWide = computed(() => windowWidth.value >= 900)
const _dialogPos   = computed(() => _isWide.value ? 'center' : 'bottom')
const _dialogClass = computed(() => _isWide.value ? 'detail-dialog--center' : 'detail-dialog--bottom')
```
```css
:global(.detail-dialog--bottom .p-dialog) { border-radius: 16px 16px 0 0 !important; }
:global(.detail-dialog--center .p-dialog) { border-radius: 12px !important; }
```

---

## Section toolbar — patrón universal

**Layout homogéneo en todas las tablas:** `[CTAs] [spacer] [chips filtros] [Filtros btn]`

| Vista | Izquierda | Derecha |
|---|---|---|
| Leads | Listas de difusión (outlined) · **+ Asignar leads** (primario) | chips · Filtros |
| Ventas | *(sin CTAs)* | chips · Filtros |
| Errores de pago | tabs (Recuperables / Perdidos / Gestionados) | chips · Filtros |
| Agentes | hint de scroll | Filtros |

```html
<div class="section-toolbar">
  <!-- CTAs específicos del rol -->
  <Button v-if="..." label="Acción principal" />
  <span class="spacer" />
  <!-- Chips de filtros activos -->
  <FiltrosChips v-model="filtrosActivos" />
  <!-- Botón Filtros siempre al final -->
  <Button label="Filtros" icon="pi pi-filter" :outlined="..." :badge="..." />
</div>
```
```css
.section-toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.section-toolbar .spacer { flex: 1; }
```

En `ErroresPagoView`, `.section-tabs-row` aplica el mismo patrón con tabs a la izquierda en lugar de CTAs.

---

## Bulk action bar — patrón unificado

Barra que aparece al seleccionar filas en AgentesView y ErroresPagoView. Mismo estilo en ambas vistas.

```css
.bulk-bar {
  background: #F0FDFA;   /* teal-50, sin borde */
  border-radius: 8px; padding: 8px 12px;
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin-bottom: 10px;
}
.bulk-count { color: var(--n-700); font-size: 13px; font-weight: 500; }
.bulk-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-left: auto; }
```

- Fondo `#F0FDFA` (teal-50), sin outline ni borde
- Todos los botones son `<Button outlined>` sin `severity` → quedan neutros por el override global de `main.css`
- Contador de selección a la izquierda, botones a la derecha con `margin-left: auto`

**AgentesView:** Asignar leads · Marcar disponible · Marcar no disponible · Modo offline
**ErroresPagoView:** Marcar recuperable · Marcar perdido · Marcar gestionado

---

## Modal Lista de difusión (`LeadsView.vue`)

Modal de creación de lista de difusión WhatsApp. Estructura del cuerpo:

1. **Cabecera custom** con icono WhatsApp verde + título + subtítulo (`pt.header` para padding)
2. **Nombre de la lista** — `<InputText>`
3. **Mensaje** — `<Textarea autoResize :maxlength="1000">` con contador de caracteres (rojo > 900)
4. **Plantillas rápidas** — chips naranjas que inyectan texto pre-escrito (`listaTplNames`)
5. **Vista previa WhatsApp** — burbuja `#dcf8c6` sobre fondo `#e5ddd5`, aparece con `<Transition name="lista-fade">` cuando hay mensaje
6. **Destinatarios** — chips con iniciales + primer nombre de cada lead seleccionado (hasta 5, luego "+N más" y contador total); o aviso vacío si no hay selección
7. **Footer** — Cancelar (outlined) / Enviar lista (deshabilitado hasta tener nombre + mensaje + ≥1 lead)

**Plantillas en LeadsView:**
```ts
const listaTplNames = [
  { label: 'Recuperación', texto: '...' },
  { label: 'Seguimiento',  texto: '...' },
  { label: 'Oferta',       texto: '...' },
]
```

---

## LeadsPorEstadoCard — componente reutilizable

Componente compartido para mostrar la distribución de leads por estado, usado en:
- `DashboardAgente.vue` (modo con total — header "115 Leads activos")
- `DetalleAgenteView.vue` (modo sin total — título "Leads por estado")

**Ubicación:** `src/components/ui/LeadsPorEstadoCard.vue`

**Props:**
```ts
interface LeadEstadoItem { label: string; estado: string; val: number | string }

{
  estados: LeadEstadoItem[]          // filas (cada una navega a /leads?estado=...)
  erroresPago?: number               // si se pasa, renderiza la fila roja "Error de pago"
  total?: number | string            // modo dashboard: muestra "N Leads activos" en header
  totalLabel?: string                // default "Leads activos"
  totalLink?: string                 // default "/leads"
  leadsBasePath?: string             // default "/leads"
  erroresPath?: string               // default "/errores-pago"
  title?: string                     // default "Leads por estado" (cuando no hay total)
}
```

**Uso típico:**
```html
<!-- Dashboard agente: con total y header -->
<LeadsPorEstadoCard :total="115" :estados="leadsEstados" :erroresPago="3" />

<!-- Detalle agente: solo título y rows -->
<LeadsPorEstadoCard :estados="leadsEstado" :erroresPago="agente.erroresPago" />
```

La fila "Error de pago" sigue el patrón visual unificado: fondo `var(--error-bg)`, texto `var(--error)`, dot rojo, hover `#fce3dc`.

---

## AgentesView — presencia y menú contextual

### Presence dots en avatares

Cada fila de la tabla de agentes muestra un dot de color sobre el avatar indicando disponibilidad en tiempo real.

```html
<div class="avatar-presence">
  <AgentAvatar :nombre="data.nombre" :ini="data.ini" size="sm" />
  <span class="presence-dot" :class="{
    'presence-dot--offline': offlineStore.isOffline(data.id),
    'presence-dot--away': !offlineStore.isOffline(data.id) && noDisponibles.has(data.id),
  }" />
</div>
```

**Estados:**
| Clase | Color | Significado |
|---|---|---|
| (ninguna) | `var(--success)` verde | Disponible |
| `presence-dot--offline` | `var(--warning)` amber | Modo offline (feria) |
| `presence-dot--away` | `var(--n-400)` gris | No disponible |

**CSS clave:**
```css
.avatar-presence {
  position: relative;
  display: inline-flex;  /* CRÍTICO: inline-flex, no block — para que el dot se ancle al avatar */
  flex-shrink: 0;
}
.presence-dot {
  position: absolute; bottom: -1px; right: -1px;
  width: 9px; height: 9px; border-radius: 50%;
  background: var(--success);
  border: 1.5px solid #fff; box-sizing: border-box;
}
```

`display: inline-flex` es obligatorio. Con `display: block` (default de `<div>`), el wrapper se expande al ancho de la celda y `right: -1px` posiciona el dot en el extremo derecho de la celda, no del avatar.

### Menú contextual (click derecho en filas)

Click derecho sobre una fila abre un `<ContextMenu>` de PrimeVue con las mismas acciones que la bulk bar.

```html
<DataTable @row-contextmenu="onRowContextMenu" contextMenu>
<ContextMenu ref="cm" :model="contextMenuItems" />
```

**Comportamiento de selección:**
- Click derecho sobre fila **ya seleccionada** → opera sobre todas las seleccionadas
- Click derecho sobre fila **no seleccionada** → deselecciona todo, selecciona solo esa, abre menú

```ts
function onRowContextMenu(e: any) {
  if (!selectedIds.has(e.data.id)) {
    selectedIds.clear()
    selectedIds.add(e.data.id)
  }
  cm.value?.show(e.originalEvent)
}

const contextMenuItems = computed(() => [
  { label: 'Asignar leads',       icon: 'pi pi-users',       command: () => openBulkAsignar() },
  { label: 'Marcar disponible',   icon: 'pi pi-check-circle', command: () => setBulkDisponible(true) },
  { label: 'Marcar no disponible',icon: 'pi pi-ban',          command: () => setBulkDisponible(false) },
  { separator: true },
  { label: 'Modo offline',        icon: 'pi pi-power-off',   command: () => { showBulkOffline.value = true } },
])
```

El handler usa `e: any` para evitar el error TS2322 de `DataTableRowContextMenuEvent`.

---

## DetalleAgenteView — responsive y coherencia

Vista de detalle del agente accesible desde el ranking del TeamLead o desde "Mi equipo" del Manager. Reutiliza componentes ya existentes para asegurar coherencia con el resto del prototipo.

### Componentes reutilizados
| Sección | Componente |
|---|---|
| KPIs | `KpiCard` con `tendencia` (verde ↑ / rojo ↓) |
| Objetivos (Meta diaria / mensual) | `ProgressBar` con override `var(--success)` |
| Leads por estado | `LeadsPorEstadoCard` (sin total) |
| Avatar | `AgentAvatar` |
| Cards | `SectionCard` |
| CTAs | `Button` con `severity="secondary"` + `outlined` |

### Card de Perfil
Composición vertical balanceada con dos "pesos visuales" en extremos opuestos:

```
┌──────────────────────────────────────┐
│ [Avatar]          [+ Asignar leads]  │ ← header: avatar izq · CTA top-right
│                                      │
│ Nombre  [● Disponible]               │ ← nombre + tag inline
│ 🇪🇸 País                              │
│ CR X% · CR frescos Y%                │ ← métricas en línea con separador ·
│ Ø ventas/mes Z                       │
│ Período de prueba: hasta dd/mm/yyyy  │ ← muted (11px, n-400)
└──────────────────────────────────────┘
```

**Estructura:**
- `.perfil-header` con `justify-content: space-between` → avatar y CTA en extremos (contrapeso visual)
- `.perfil-name-row` flex inline para nombre + tag "Disponible" (badge verde `var(--success-bg)` / `#15803d`)
- `.perfil-info` stack vertical con `.pm-item` para métricas (CR, CR frescos, Ø ventas/mes)
- `.perfil-prueba` en 11px / `var(--n-400)` (información subordinada)

**CTAs en header:** dos botones inline en la esquina superior derecha:
1. "Asignar leads" — siempre visible (`severity="secondary" outlined`)
2. "Modo offline" (Activar modo feria) — visible solo si `canManageFeria && !isAgenteFeria`

```html
<div class="perfil-header-actions">
  <Button label="Asignar leads" icon="pi pi-user-plus" size="small" severity="secondary" outlined @click="showAsignar = true" />
  <Button v-if="canManageFeria && !isAgenteFeria" label="Modo offline" icon="pi pi-power-off" size="small" severity="secondary" outlined @click="showFeriaModal = true" />
</div>
```
```css
.perfil-header-actions { display: flex; flex-direction: row; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
```

**Disponibilidad — ToggleSwitch (TL/Manager) vs badge (agente):**
- Si `isAgenteFeria`: muestra badge "Offline" con `pi pi-power-off`
- Si `canManageFeria` (TL o Manager): muestra `<ToggleSwitch>` + label "Disponible"/"No disponible"
- Si agente: muestra badge estático "Disponible"

```html
<div v-if="canManageFeria" class="perfil-toggle-row">
  <ToggleSwitch v-model="agenteDisponible" class="perfil-toggle" />
  <span class="perfil-toggle-label" :class="agenteDisponible ? 'toggle-on' : 'toggle-off'">
    {{ agenteDisponible ? 'Disponible' : 'No disponible' }}
  </span>
</div>
```

El ToggleSwitch se dimensiona a 28×16px con override scoped para encajar en la línea del nombre del agente.

**Pre-selección de agente al abrir el modal:**
El botón abre `AsignarLeadsModal` con el agente del perfil ya marcado, agilizando la asignación.
```html
<AsignarLeadsModal v-model:visible="showAsignar" :preselectAgenteId="agente.id" />
```
El modal acepta el prop opcional `preselectAgenteId`. Internamente un `watch(visible)` rellena `selectedAgentes` con ese id al abrirse, o lo resetea a `[]` si no hay preselección (caso por defecto: abrir desde `LeadsView → + Asignar leads`).

### KPI delta — convención
Para "Errores de pago" y "Tiempo medio en llamadas", **menos es mejor**, así que se usa texto negativo (`-8%`, `-12s`) con `tendencia="up"` (verde ↑) para mantener coherencia visual con los demás KPIs positivos.

### Objetivos — barras de progreso
Las dos barras (Meta diaria / Meta mensual) son `<ProgressBar>` de PrimeVue con override scoped:
```css
:deep(.meta-progress .p-progressbar-value) { background: var(--success) !important; }
```
Mismo patrón que en `KpiCard`, `AppRightPanel` (TeamLead objetivo mensual) y `DashboardTeamLead`.

### Cifras coherentes
Constantes nombradas al principio del computed `agente`:
```ts
const META_DIARIA_OBJ  = 6    // 6 ventas/día (realista por agente)
const META_MENSUAL_OBJ = 120  // 6 × 20 días laborables
```
- `promedioVentasMes` = `ventasMes × 1.15` (histórico ~15% mayor que el mes en curso)
- `ventasHoy` se capa a `min(ventasDias, 12)` para evitar valores absurdos
- `metaDiaria.actual` se capa a `min(ventasDias, OBJ + 4)`

### Regla de negocio — leads Pendientes
**Cada agente puede tener máximo 1 lead `Pendiente` activo simultáneamente** (o 0 si su estado es "No disponible"). Reflejado en `mockAgentes`: todos los agentes tienen `pendientes: 1`. La fila "Pendientes" en `LeadsPorEstadoCard` lee este valor directamente.

### Layout (4 filas)
```
Row 1 (row-top):    [Perfil] [Tipos de ventas] [Leads por estado]
Row 2 (kpi-row):    [5 KPIs en línea]
Row 3 (metas-grid): [Objetivos · Meta diaria | Meta mensual horizontal]
Row 4:              [Histórico de ventas]
```

`Leads por estado` se sube a la fila superior para balancear las 3 cards en altura. `Objetivos` ocupa ancho completo con las dos metas side-by-side separadas por divisor vertical (`.meta-vdivider`).

### Breakpoints
| Ancho | row-top | kpi-row | metas-grid |
|---|---|---|---|
| > 1100px | `1.2fr 1.4fr 1fr` (3 cols) | `repeat(5, 1fr)` | `1fr 1px 1fr` (horizontal) |
| ≤ 1100px | `1fr 1fr` + Leads full row | `repeat(3, 1fr)` | `1fr 1px 1fr` |
| ≤ 900px | `1fr` (stack) | `repeat(2, 1fr)` + 5ª full | `1fr` (stack, divisor horizontal) |
| ≤ 480px / `.is-mob` | `1fr` | `1fr 1fr` + 5ª full | `1fr` (stack) |

Donut de tipos de ventas se reduce a 100-130px en mobile.

### Tipos de ventas — donut homogeneizado
Mismo patrón visual que el donut de `DashboardAgente`:
- Layout: leyenda izquierda · donut derecha
- Wrapper: `.donut-wrap` con `aspect-ratio: 1`, `min-width: 110px`, `max-width: 160px`
- Tipografía central: `20px / 12px` (igual que dashboard)
- Cutout: `74%` (estándar prototipo)
- 4 segmentos: blue · amber · green · **indigo** (sin gris en segmentos)

---

## AppRightPanel — botones de widget

Patrón unificado para CTAs icónicos en los headers de las cards del panel derecho.

### Botones `+` (Próximas citas, Recordatorios)
PrimeVue `<Button text rounded size="small" icon="pi pi-plus" />` con override scoped:
```css
:deep(.section-card__header .p-button-text.p-button-rounded) {
  width: 28px !important; height: 28px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  color: var(--brand) !important;
  background: transparent !important;
}
:deep(.section-card__header .p-button-text.p-button-rounded:hover) {
  background: var(--n-100) !important;
  color: var(--brand) !important;
}
```

### Navegación del calendario semanal
- `.wcal-nav` (chevrons prev/next semana): color `var(--n-400)` (neutro) → hover bg `var(--n-100)` + color `var(--n-700)`
- `.wcal-ver-link` (flecha → al calendario): color `var(--brand)` (naranja) → hover bg `var(--n-100)`, mantiene naranja

### Check de recordatorios
Botón circular 15×15px (reducido de 18×18 para equilibrio visual), borde gris, icono check de 8px cuando completado.

### Chevron de citas — eliminado
Las filas `.cita-item` ya no muestran chevron derecha; el hover gris (`var(--n-50)`) ya comunica la interactividad.

---

## Alturas de gráficas (Chart.js)

Alturas estándar por tipo de gráfica:

| Componente | Tipo | Altura |
|---|---|---|
| DashboardAgente — línea ventas | line | `240px` (responsive: `200px`) |
| DashboardTeamLead — barras equipo | bar | `240px` |
| DashboardTeamLead — línea histórico | line | `260px` |
| DashboardManager — barras ventas | bar | `240px` |
| DashboardManager — línea histórico | line | `260px` |

Override responsive en DashboardAgente:
```css
@media (max-width: 480px) {
  .row-2col :deep(.p-chart) { height: 200px !important; }
}
```

---

## Layout general

```
App.vue
├── PasswordGate (si no autenticado)
└── DevToolbar (siempre visible, QA only)
    preview-wrap
    ├── sidebar (izquierda, 210px expandida / 68px colapsada) — oculto en mobile
    ├── crm-content
    │   ├── AppHeader (búsqueda + usuario + botón crear lead contextual)
    │   └── content-wrap (max-width: 1600px; padding: 20px 22px)
    │       └── [RouterView]
    └── right-panel (derecha, ~272px) — drawer en mobile
```

- **No añadir `max-width` a `.dash-content`** — desalinea el buscador del topbar.
- Panel derecho: colapsa a 48px en ≤1024px, forzado expandido en UW.

---

## Breakpoints y responsive

### DevToolbar
La toolbar (`DevToolbar.vue`) muestra únicamente el **selector de rol/perfil** con los tres usuarios mock. Los breakpoints se prueban redimensionando el navegador o usando las DevTools del navegador (inspector → icono de responsive). No hay botones de breakpoint en la UI.

**Perfiles en la toolbar:**
| Botón | Rol | Usuario mock |
|---|---|---|
| Agente | `agente` | Juan Camilo Cruz |
| Team Lead | `team_lead` | Michele Carlini |
| Manager | `manager` | Judit Cabrera |

### Breakpoints CSS (media queries reales)

| Nombre | Ancho | Comportamiento |
|---|---|---|
| Desktop | > 1024px | Layout completo: sidebar expandible + content + right panel visible |
| Tablet horizontal (TH) | ≤ 1024px | Right panel colapsado a 48px icon-strip; sidebar sigue colapsado |
| Tablet vertical (TV) | ≤ 900px | Right panel oculto; kpi-row pasa a 2 columnas; búsqueda expandible; "Marcar todas" sube al header en Notificaciones; popup centrado en notificaciones |
| Mobile | ≤ 480px | Sidebar oculto, bottom nav, right panel como drawer deslizable; bottom sheet en notificaciones |

**Anchos de referencia para testing manual:**
| Nombre | Ancho px | Cómo probar |
|---|---|---|
| Mob | 390 | iPhone 14 Pro preset en DevTools |
| TV | 768 | iPad portrait preset |
| TH | 1024 | iPad landscape / "Responsive" a 1024px |
| 1440 | 1440 | MacBook 16" / iMac típico |
| HD | 1920 | Monitor 1080p |
| UW | 2560 | Monitor ultrawide |

### Clase `.is-mob` (preview mode)
`auth.previewWidth` puede fijarse programáticamente. Cuando `previewWidth ≤ 480`, `auth.isMobPreview` es `true` y el `preview-wrap` recibe la clase `is-mob`.

Las reglas `@media (max-width: 480px)` se duplican en `main.css` como `.is-mob .selector` para que los layouts mobile funcionen dentro del contenedor de preview sin redimensionar el navegador real.

**Patrón:** toda regla `@media (max-width: 480px) { .selector { ... } }` tiene su gemela `.is-mob .selector { ... }` en `main.css`.

---

## AppHeader (`src/components/layout/AppHeader.vue`)

### Búsqueda
- **> 900px:** input fijo visible (`header-search`, 220px)
- **≤ 900px:** input oculto; aparece botón circular 🔍 que expande un input animado (`search-expand` transition). Al abrir, el nombre del usuario se oculta (`:has(.mobile-search--open)`)

### Botones icon (circular, `border-radius: 50%`)
- `search-btn` — visible ≤ 900px (expande input animado)
- `panel-btn` — visible ≤ 480px (abre right panel drawer de widgets)

**Orden mobile (≤480px):** `[Logo] [Buscar...] 🔍 ⊞`

> Notificaciones tiene **tab dedicado en el bottom nav** ("Avisos"), no en el header. Patrón monday.com.

### Botón "+ Crear lead" (desktop) / FAB Speed Dial (mobile + tablet)

**Desktop (`> 900px`):**
- Botón inline `.crear-lead-btn` en el header (lado derecho)
- Visible solo en rutas que empiezan por `/leads` (`isLeadsSection` computed)
- Controla `auth.showCrearLead`

**Mobile + Tablet narrow (`≤ 900px`):**
- Se sustituye por un **FAB Speed Dial** (`<SpeedDial>` de PrimeVue)
- Visible **siempre** (no solo en /leads) — patrón Jobber/monday.com
- Posición fija abajo-derecha (`bottom: 24px`, en mobile `calc(76px + safe-area)` sobre el bottom nav)
- Tap en el FAB → expande verticalmente las acciones rápidas

**Acciones del FAB — modelo híbrido (rol + contexto):**

El FAB cambia según la pantalla. En pantallas de detalle (lead, venta, agente) muestra acciones **sobre la entidad**; en pantallas-lista o dashboard muestra acciones de creación genéricas por rol.

| Pantalla (`route.name`) | Acciones del FAB |
|---|---|
| `perfil-lead` (`/leads/:id`) | 📞 Llamar · 💬 WhatsApp · 🕐 Histórico · 🔖 Crear recordatorio · 🚩 Reportar lead falso |
| `perfil-venta` (`/ventas/:id`) | 📞 Llamar · 💬 WhatsApp · 🕐 Histórico · 🔖 Crear recordatorio |
| `detalle-agente` (`/agentes/:id`) | 👥 Asignar leads · 🔖 Crear recordatorio |
| `leads` (lista) | Crear lead · Crear cita · Crear recordatorio · Quiero leads (agente) — **sin** "Asignar leads" (ya en toolbar) |
| Resto (dashboard, ventas, etc.) | Crear lead · Crear cita · Crear recordatorio + Quiero leads (agente) / Asignar leads (TL+Mgr) |

**WhatsApp e Histórico en perfil-lead/perfil-venta (mobile):**

En estas rutas, **mobile NO usa el right panel drawer** — en su lugar el FAB dispara **bottom sheets full-screen** dedicados:

- `auth.showWhatsappSheet` → bottom sheet con el chat WhatsApp completo (alto `calc(100dvh - 48px)`)
- `auth.showHistorialSheet` → bottom sheet con el historial completo (tabs Todo/Llamadas/Comentarios + lista scrolleable)

El botón `panel-btn` (⊞) del header se **oculta** en `perfil-lead` y `perfil-venta` (computed `isProfileRoute`) — no tiene utilidad ya que WhatsApp/Histórico viven en el FAB.

En **desktop** estas rutas siguen mostrando el right panel lateral con las cards WhatsApp + Historial (sin cambios). Solo el comportamiento mobile cambia.

**Estructura de los bottom sheets** (clase `.full-bottom-sheet`):
- Border-radius 16px arriba
- 100% width, alto = `100dvh - 48px`
- Header con título + status
- Content flex con overflow oculto, scroll en la sección de mensajes/items

**Lógica:** un `computed` lee `route.name` y decide qué acciones mostrar. Las acciones reutilizables están declaradas como constantes en el cuerpo del computed para evitar duplicación.

**Helpers:** `callPhone(phone)` y `openWhatsapp(phone)` para abrir `tel:` y `wa.me/`.

**Lo que NO va en el FAB:**
- `Listas de difusión` — requiere selección previa de leads, queda en toolbar de `/leads`
- Edición de reto semanal — contextual del widget TL
- Ver envío / navegación — el FAB es para acciones, no para navegar (eso va en links/botones inline)

### Flags globales del store para modales

```ts
// src/stores/auth.ts
const showCrearLead         = ref(false)
const showCrearCita         = ref(false)
const showCrearRecordatorio = ref(false)
const showAsignarLeads      = ref(false)
```

### Dónde vive cada modal

| Modal | Lugar | Por qué |
|---|---|---|
| `CrearLeadModal` | `AppHeader.vue` | Global, sin @save handler especial |
| `AsignarLeadsModal` | `AppHeader.vue` | Global, sin @save handler |
| `CrearCitaModal` | `AppRightPanel.vue` | Tiene @save que afecta widget de próximas citas |
| `CrearRecordatorioModal` | `AppRightPanel.vue` | Tiene @save que añade a `recordatoriosLocal` |

Los modales de cita/recordatorio están en `AppRightPanel.vue` (que se monta en las 2 rutas de `PANEL_ROUTES` — solo ficha de lead y venta) y los widgets `+` los disparan via computed setters al `auth` store. Esto permite que el FAB y los widgets compartan **una sola instancia** de cada modal:

```ts
// En AppRightPanel.vue
const showCrearCita = computed({
  get: () => auth.showCrearCita,
  set: (v) => { auth.showCrearCita = v },
})
```

Razón del cambio: en pantallas narrow el botón inline + search-btn + panel-btn dejaban poco espacio al nombre del usuario, que se rompía a 2 líneas. Además consolidamos todos los puntos de creación en un solo FAB siguiendo el patrón validado vía Mobbin (Jobber, monday.com).

### "+ Asignar leads" — dos flujos válidos

| Lugar | Comportamiento |
|---|---|
| FAB SpeedDial (TL/Mgr) | Abre modal sin preselección — flujo "asigno bulk" |
| Toolbar de `/leads` | Mismo — usa `auth.showAsignarLeads` |
| `DetalleAgenteView` botón en perfil | Mantiene su **instancia local** con `:preselectAgenteId` para preseleccionar al agente |

La instancia local de `DetalleAgenteView` es independiente — se mantiene porque la pre-selección requiere prop específica.

---

## Mobile layout

### Bottom nav (`AppBottomNav.vue`) — patrón monday.com

5 ítems fijos para todos los roles. El último ("Más") abre un **bottom sheet** con las secciones secundarias.

| Posición | Todos los roles |
|---|---|
| 1 | 🏠 Inicio (`/dashboard`) |
| 2 | 👥 Leads (`/leads`) |
| 3 | 📊 Ventas (`/ventas`) |
| 4 | 🔔 Avisos (`/notificaciones`) |
| 5 | ⋯ **Más** (abre bottom sheet) |

> ✅ Notificaciones como tab dedicado (1 tap, siempre visible) — validado contra monday.com via Mobbin.

**Contenido del bottom sheet "Más" — por rol:**

| Ítem | Agente | Team Lead | Manager |
|---|---|---|---|
| Agenda | ✅ | ✅ | ✅ |
| Errores de pago | ✅ | ✅ | ✅ |
| Agentes | ❌ | ✅ | ✅ |
| Exportaciones | ❌ | ✅ | ✅ |
| Configuración | ❌ | ❌ | ✅ |

**Implementación:**
```ts
const primaryItems = [
  { route: '/dashboard',      icon: 'pi pi-home',       label: 'Inicio' },
  { route: '/leads',          icon: 'pi pi-users',      label: 'Leads' },
  { route: '/ventas',         icon: 'pi pi-chart-line', label: 'Ventas' },
  { route: '/notificaciones', icon: 'pi pi-bell',       label: 'Avisos' },
]

// El 5to slot es un <button> que abre el bottom sheet (no es RouterLink)
const moreItems = computed(() =>
  ALL_MORE_ITEMS.filter(i => i.roles.includes(auth.currentRole))
)

// "Más" se resalta cuando la ruta actual está en uno de sus items
const isMoreActive = computed(() =>
  moreItems.value.some(item => route.path.startsWith(item.route))
)
```

**El bottom sheet** usa `<Dialog position="bottom">` de PrimeVue con border-radius top, dismissableMask, y lista de items con iconos en boxes redondeados (`var(--n-100)` background).

- `position: fixed` en real mobile / `position: absolute` en preview `.is-mob`
- Sin scroll — `flex: 1; min-width: 0` en cada ítem
- `padding-bottom: env(safe-area-inset-bottom)` para notch

### Panel derecho como drawer
- Se activa con clase `right-panel--mobile-open` (state: `auth.mobilePanelOpen`)
- `transform: translateX(100%)` → `translateX(0)` con transición
- Overlay oscuro via `<Teleport to="body">` con `Transition`
- Botón de apertura: icono ⊞ en AppHeader (mobile ≤480px) + overlay para cerrar

### Right panel drawer — solo widgets

A partir del patrón monday.com, el right panel drawer **NO incluye navegación secundaria** (todo eso vive en el bottom sheet "Más"). El drawer queda 100% para widgets contextuales:

- Calendario semanal (agente)
- Próximas citas
- Recordatorios
- Reto semanal (TL)
- Objetivo mensual (TL)
- Objetivos mes por país (Manager)
- Leads por país (Manager)
- Notificaciones widget

### Bug fix · opacity del drawer

El breakpoint `@media (max-width: 1024px)` ponía `.right-panel-inner { opacity: 0 }` por diseño (el panel se expandía con hover en tablet). Pero en mobile el panel se abre con **clic**, no con hover → contenido invisible.

**Fix en `AppRightPanel.vue` dentro de `@media (max-width: 480px)`:**
```css
.right-panel-inner {
  opacity: 1 !important;      /* anula el opacity:0 del breakpoint ≤1024px */
  min-width: 0 !important;
  padding-bottom: calc(76px + env(safe-area-inset-bottom)) !important;
}
```

El `padding-bottom` también arregla que el bottom nav (60px) ocultaba el final del contenido del drawer.

### Rutas donde aparece el right panel (`PANEL_ROUTES`)

Lista de `route.name` válidos para que el `<aside v-if="showPanel">` se renderice:

```ts
// V1: panel solo en ficha de lead/venta (mismo comportamiento que V0/staging)
const PANEL_ROUTES = [
  'perfil-lead',
  'perfil-venta',
]
```

**V2 amplía esto a 13 rutas** — en V1 el panel lateral solo aparece en las fichas de lead y venta (igual que el CRM actual). Si una ruta no está en la lista, el botón de panel no tiene efecto.

### Bolsa de leads (DashboardTeamLead + DashboardManager)
- En desktop: donut + lista en horizontal (`flex-direction: row`)
- En mobile `≤480px`: se apilan verticalmente (`flex-direction: column; gap: 16px`)
- Donut se centra y reduce a 140px de ancho
- Las filas con botón "Asignar" usan `flex-wrap: wrap` para evitar overflow
- Reglas `.is-mob` duplicadas en `main.css`

### Auth store: estado mobile
```ts
mobilePanelOpen: ref(false)
isMobPreview: computed(() => previewWidth !== null && previewWidth <= 480)
showCrearLead: ref(false)   // modal global "Crear lead"
toggleMobilePanel() / closeMobilePanel()
```

---

## Notificaciones (`src/views/NotificacionesView.vue`)

### Filtros y acciones
- Filtro tipo (tabs): Todos / Chats / Citas / Recordatorios / Errores de pago  *(V1: tabs separados — sin cambio respecto a producción)*
- Scroll horizontal en mobile (tabs `overflow-x: auto`)
- "Marcar todas como leídas":
  - **≤ 900px:** aparece en el header de la vista
  - **> 900px:** aparece junto a los tabs (`.mark-all-btn--filters`)

### Dialog de detalle
- **< 900px:** bottom sheet (`position="bottom"`, `border-radius: 16px 16px 0 0`)
- **≥ 900px:** popup centrado (`position="center"`, `border-radius: 12px`, `max-width: 480px`)
- Detección reactiva via `windowWidth` + `onMounted/onUnmounted` resize listener
- Auto-mark as read al abrir (`n.leida = true` en `openDetail`)
- Border-bottom del header aplicado vía `:pt` en el contenedor `.p-dialog-header` (no en el slot) para que cubra también el botón X

### CTAs por tipo de notificación
| Tipo | Botón primario | Botón secundario |
|---|---|---|
| Chat | Abrir conversación (WhatsApp) | — |
| Cita | Ver en agenda | Ir al lead |
| Error de pago | Gestionar en lead | Llamar (`tel:`) |
| Recordatorio | Marcar como hecho | Aplazar |

### Aplazar — patrón dos sheets (Todoist)

El flujo de aplazar un recordatorio usa **dos Dialogs secuenciales** en lugar de un Popover flotante. Esto evita la superposición de capas (dialog detalle → popover → DatePicker overlay).

**Flujo:**
1. "Aplazar" cierra el dialog de detalle → abre **Sheet 1** (opciones rápidas)
2. Sheet 1: "En 1 hora" (con hint hora), "Mañana" (con hint día+hora original), "Fecha personalizada ›"
3. "Fecha personalizada" cierra Sheet 1 → abre **Sheet 2** con `<DatePicker inline>` + botón Confirmar
4. `← back` en Sheet 2 regresa al Sheet 1 sin abrir el detalle de nuevo

**Variables de estado (`NotificacionesView`, `AppRightPanel`):**
```ts
showAplazar       = ref(false)   // Sheet 1
showCustomAplazar = ref(false)   // Sheet 2 (NotificacionesView)
showAplazarRec    = ref(false)   // Sheet 1 (AppRightPanel)
showCustomRec     = ref(false)   // Sheet 2 (AppRightPanel)
aplazarFecha      = ref<Date | null>(null)
```

**Hints dinámicos:**
- `aplazarHint1h` — hora actual + 1h redondeada ("Hoy · 17:00")
- `aplazarHintManana` — día de la semana abreviado + hora original del recordatorio ("Lun · 09:15")

La hora original se extrae con `fechaStr.split('·')[1].trim()` (AppRightPanel) o `fecha.split('·')[1].trim()` (NotificacionesView).

**Clave:** `DatePicker` en modo `inline` renderiza el calendario dentro del dialog sin abrir ningún overlay adicional.

---

## Calendario mobile (`CalendarioView.vue`)

### Detección de mobile en el componente
El componente tiene su propia detección combinada (no depende solo del DevToolbar):
```ts
const isMob = computed(() => auth.isMobPreview || windowWidth.value <= 480)
```
Incluye listener de `resize` en `onMounted`/`onUnmounted`.

### Vista Mes mobile — multi-month scroll
- Se renderizan **12 meses** apilados verticalmente en `.mob-months-scroll`
- El scroll es el mecanismo de navegación (no hay botones prev/next en mobile)
- Título de cada mes con `position: sticky; top: 0` para mantenerlo visible al scrollear
- Cells compactas (52px alto) con pills `dot + título truncado`, máx 2 por celda
- Tap en día → switch a vista Día + scroll automático a ese día en la agenda
- Botón "Hoy" hace `scrollIntoView` al mes actual

### Vista Día mobile — agenda continua
- Lista de días con eventos en los próximos **180 días** en `.mob-agenda-scroll`
- Días sin citas se omiten (excepto hoy, que siempre aparece con "Sin citas")
- Layout: columna izquierda (DOW + número + mes) + columna derecha (event cards)
- Event cards con borde izquierdo de color + `›` si el evento tiene `leadId`
- Tap en evento con lead → navega a `/leads/:leadId`
- Botón "Hoy" hace `scrollIntoView` al grupo de hoy

### Toggle de vistas en mobile
- Solo se muestran **"Día"** y **"Mes"** — "Semana" se oculta
- `watch(isMob)` redirige de Semana → Día si se activa mobile

### Scroll automático
- `onMounted`: scroll al mes actual (Mes) o a hoy (Día)
- `watch([vista, isMob])`: al cambiar a Día en mobile, scroll a `currentDate` en la agenda
- `gotoDay(d)`: cambia a Día y hace scroll al día seleccionado via `#ag-YYYY-MM-DD`

### Navegación a lead desde citas
Cada `Cita` tiene `leadId: string | null`. Si `leadId` existe, el click navega a `/leads/:leadId`.
Aplica en: agenda mobile, time-grid desktop (Semana y Día).

---

## Perfil Lead (`src/views/PerfilLeadView.vue`)

### Topbar del perfil

Implementado con **CSS Grid `1fr auto`** para garantizar que los botones siempre queden a la derecha, incluso cuando la columna izquierda hace wrap:

```css
.perfil-topbar {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
}
.topbar-left   { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.topbar-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }
```

**Por qué grid y no flex:** `margin-left: auto` en un hijo flex no funciona cuando el elemento padre hace wrap en múltiples líneas — el margen solo empuja en la misma línea. `grid-template-columns: 1fr auto` garantiza estructuralmente que `.topbar-actions` ocupa la columna derecha siempre.

Los elementos se agrupan en pares:
- **`.topbar-pair`** — label + control sin ruptura interna (`flex-shrink: 0`)
  - Par 1: `Agente:` + chip/select
  - Par 2: `Estado:` + select
- **`.topbar-actions`** — botones `Reportar lead falso` + `Llamar`

**Separador `|` — detección dinámica de wrap con ResizeObserver:**
El `|` entre Agente y Estado solo es útil cuando ambos pares están en la misma línea horizontal. Si el `topbar-left` hace wrap y los pares caen en filas distintas, el separador queda huérfano. Se usa `v-show="sepVisible"` controlado por un `ResizeObserver`:

```ts
// En PerfilLeadView.vue
const topbarLeftRef = ref<HTMLElement | null>(null)
const sepVisible    = ref(true)

function checkSepWrap() {
  const pairs = topbarLeftRef.value?.querySelectorAll<HTMLElement>('.topbar-pair')
  if (pairs?.length >= 2)
    sepVisible.value = Math.abs(pairs[0].getBoundingClientRect().top - pairs[1].getBoundingClientRect().top) < 2
}
// onMounted: new ResizeObserver(checkSepWrap).observe(topbarLeftRef.value)
```
No se usan media queries fijas para el sep — el ResizeObserver lo gestiona en cualquier breakpoint.

**Comportamiento responsive:**
```
> 900px:    Agente: [chip] | Estado: [pill ▾]     [Reportar] [Llamar]
481–900px:  Agente: [chip] | Estado: [pill ▾]     (botones ocultos → FAB)
            (si wrappean: | desaparece automáticamente)
≤ 480px:    Agente: [chip]
            Estado: [pill ▾]
            (botones ocultos → FAB, preview .is-mob)
```

**`.topbar-actions` se oculta a `≤ 900px`** (tablet vertical y mobile) — "Reportar lead falso" y "Llamar" viven en el FAB Speed Dial a partir de ese breakpoint. La clase `.is-mob .topbar-actions { display: none !important }` en `main.css` cubre adicionalmente el preview mode mobile.

### Agente select — pill totalmente redondo

El selector de agente asignado usa `border-radius: 999px` (full pill) para consistencia visual con el pill de estado adyacente:

```css
.agente-select {
  min-width: 220px;
  border-radius: 999px !important;
}
```

### Botones de edición (lápiz) en cards — hover circular

Los 3 botones de edición del perfil (card del perro, card del lead, card de envío) usan `.card-edit`. Aplica override scoped para hover circular en lugar del default cuadrado de PrimeVue:

```css
:deep(.card-edit) {
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  border-radius: 50% !important;
}
:deep(.card-edit:hover) {
  background: var(--n-100) !important;
}
```

### Estado del lead — pill con chevron integrado

El Select de estado usa un **pill custom como trigger** en lugar del Tag + dropdown PrimeVue por separado:

```vue
<Select :modelValue="estadoLead" :options="ESTADOS_LEAD" @update:modelValue="onEstadoChange">
  <template #value="{ value }">
    <span class="estado-pill" :class="`estado-pill--${estadoSeverity(value || estadoLead)}`">
      <span class="estado-pill-label">{{ value || estadoLead }}</span>
      <i class="pi pi-chevron-down estado-pill-chevron" />
    </span>
  </template>
  <template #option="{ option }">
    <Tag :value="option" :severity="estadoSeverity(option)" />
  </template>
</Select>
```

El `.p-select-dropdown` nativo de PrimeVue se oculta con `display: none` — la chevron vive **dentro del pill**.

**Estado "Venta" no es seleccionable manualmente.** Se filtra de las opciones del dropdown — un lead pasa a Venta vía el flujo de venta, no editando el estado:

```ts
const estadosSeleccionables = computed(() =>
  ESTADOS_LEAD.filter(e => e !== 'Venta')
)
```

**Regla de negocio · "En cita":** un lead solo puede estar en estado `En cita` si tiene una cita asignada. Al seleccionar "En cita" en el dropdown:

```ts
function onEstadoChange(nuevo: string) {
  if (nuevo === 'En cita' && estadoLead.value !== 'En cita') {
    estadoLead.value = nuevo
    auth.showCrearCita = true   // dispara modal global de Crear cita
  } else {
    estadoLead.value = nuevo
  }
}
```

El modal `CrearCitaModal` (en `AppRightPanel`, listening a `auth.showCrearCita`) se abre automáticamente para que el usuario asigne la cita y confirme el cambio de estado.

### Focus de opciones del Select — neutral, no naranja

PrimeVue Aura aplica un tinte brand al `.p-focus` y `.p-select-option-selected`. En selects con Tags coloreados (como el de estado) eso entra en conflicto con el color del tag. Override global en `main.css`:

```css
.p-select-overlay .p-select-option.p-focus,
.p-select-overlay .p-select-option:hover,
.p-select-overlay .p-select-option-selected.p-focus,
.p-select-overlay .p-select-option-selected:hover {
  background: var(--n-100) !important;
  color: inherit !important;
}
.p-select-overlay .p-select-option-selected {
  background: var(--n-50) !important;
}
```

Aplica a todos los selects del prototipo. Los Tags coloreados dentro del overlay conservan su color sin contaminación.

### EditarPerroModal — distribución de filas (desktop)

| Fila | Campos |
|---|---|
| 1 | Nombre del perro + Raza |
| 2 | Sexo + Peso + Cumpleaños (`flex: 2`) |
| 3 | Actividad + Apetito + Silueta |
| 4 | Esterilizado (`ep-field--half`) + Proyección de crecimiento (si mestizo+cachorro) + Gestante (si hembra+no esterilizada) |
| 5 | Patologías + Alergias (si patología "Alergias alimentarias") |
| 6 | Menús |

**Regla de distribución:** no dejar filas con un único campo suelto; si un campo es condicional, compartirlo con su campo relacionado.

### EditarPerroModal — campo Cumpleaños (month picker)

El campo cumpleaños es un **input-trigger + popover flotante**:
- **Cerrado:** botón con estilo input (border, padding, altura 38px) que muestra "Mes Año" + icono `pi-calendar`
- **Abierto:** card flotante (`position: absolute; top: calc(100% + 4px); width: 220px; z-index: 300`) con:
  - Fila de año: `< AÑO >` con botones `mp-nav-btn` (círculo 28px), deshabilitados en los extremos
  - Grid 3×4 de meses abreviados en español: Ene · Feb · Mar / ... / Oct · Nov · Dic
  - Mes seleccionado: pill brand (`background: var(--brand); border-radius: 100px`)
  - Hover en no-seleccionados: `background: var(--n-100)`
- **Cierre:** al seleccionar un mes, al hacer click fuera (listener `click` en `document` vía `nextTick`)
- **Animación:** `Transition name="mp-drop"` — fade + `translateY(-6px)` de entrada/salida
- `ANOS = Array.from({ length: 20 }, (_, i) => String(currentYear - i))` — índice 0 = año más reciente

```css
.mp-trigger--open {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent);
}
.mp-month--sel { background: var(--brand); color: #fff; border-radius: 100px; }
```

### EditarPerroModal — Proyección de crecimiento

- **Condición:** solo visible cuando `raza === 'Mestizo'` y perro tiene 0–12 meses (`esCachorro` computed)
- **Ubicación:** misma fila que Esterilizado (fila 4), reemplazando al spacer cuando aplica
- **Label con tooltip:** icono `pi-info-circle ep-label-info` envuelto en `<InfoTooltip>` explicando la condición
- El badge "Mestizo · cachorro" fue eliminado; el tooltip sustituye esa información

### EditarPerroModal — botón eliminar perro

El botón de papelera solo aparece si **el lead tiene más de un perro**. Si solo hay 1 perro, el botón se oculta (el lead debe tener al menos 1 perro siempre).

```vue
<EditarPerroModal
  :perro="perroEditando"
  :canDelete="lead.perros.length > 1"
  @delete="..."
/>
```

```vue
<!-- En EditarPerroModal -->
<button v-if="canDelete" class="ep-trash" @click="$emit('delete')">
```

### EditarPerroModal — selección de menús (sabores)

Selector visual de sabores ("Pollo · Pavo · Buey · Salmón") con pills toggle.

**Reglas:**
- **Default:** todos los menús están seleccionados al abrir el modal para un perro nuevo
- **Mínimo 1 menú** seleccionado siempre — `toggleMenu` no permite quitar el último activo
- Edge case "incompatible con Dogfy" (0 menús): no se gestiona en este modal — la venta no será posible en otra parte del flujo

**Layout responsive:**
| Ancho | Disposición pills | Disposición fields del form |
|---|---|---|
| Desktop | Grid 4 columnas (todos los menús en una fila) | Filas `.ep-row` con 2-3 fields side-by-side |
| Mobile (≤ 480px) | Grid 2 columnas (2 menús por fila) | Stack vertical — cada field full-width |

**Pill harmónico:** `padding: 8px 14px 8px 8px` — padding-left igual al padding-top, así el indicador X-circle queda centrado en el rounded-end del pill.

```css
.menus-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
@media (max-width: 480px) {
  .menus-row { grid-template-columns: repeat(2, 1fr); }
  .ep-row    { flex-direction: column; gap: 14px; }
  .ep-row .ep-field { flex: 1 1 100%; width: 100%; }
}
```

Gemelas `.is-mob` en `main.css` para preview mode.

### Gramaje — solo lectura

En V1, el gramaje lo determina exclusivamente el algoritmo a partir de los datos del perro. **No existe override manual.** El valor se muestra directamente:

```html
{{ isMixto ? Math.round(parseInt(perro.gDia) / 2) + 'g/día' : perro.gDia }}
```

El override de gramaje (`.gr-delta-chip`, `.gr-override-wrap`, `InputNumber`, `overrideEnabled`, `displayGr`) existe en V2 pero fue eliminado de V1 porque no está disponible en el CRM de producción actual.

### Presupuesto — Plan mixto
El toggle Plan completo / Plan mixto es funcional:
- **Plan mixto activa factor `× 0.5`** sobre precios y cantidades
- Precios (prueba y mensualidad): `÷ 2`
- Gramaje efectivo (total): `÷ 2`
- Cantidad: primer número `÷ 2` ("28u" → "14u")
- Tamaño: primer número `÷ 2` ("2x300g" → "1x300g")
- Base por perro: `÷ 2`
- El hint `(alg: XXg)` en el total **no aparece** cuando Plan mixto está activo (es reducción esperada, no override)

### EditarLeadModal — campo Teléfono

El campo teléfono tiene un prefijo de país (`Select` 76px) + input de número (`flex: 1`). El truco clave:

```css
/* La regla global .el-field :deep(.p-select) { width: 100% } aplasta el width del prefijo.
   Sobreescribir en el contexto más específico: */
.tel-input :deep(.p-select) { width: 76px !important; flex-shrink: 0; }
.tel-number { flex: 1; min-width: 0; }
```

Sin el `!important` en el contexto `.tel-input`, el `Select` del prefijo se expande a 100% del contenedor y empuja el input de número fuera del diálogo. **Mismo patrón en `CrearLeadModal`** (usa `.tel-input .tel-prefix { width: 76px }` con especificidad suficiente por la doble clase).

### Crear lead desde perfil
El botón "+ Crear lead" vive en `AppHeader` (visible en toda la sección `/leads`). Usa `auth.showCrearLead` del store. Ver sección AppHeader.

---

## Leads view (`src/views/LeadsView.vue`)

- El bloque `.leads-header` (tabs Personal/Mi equipo + selector de país) se renderiza con `v-if="tabs.length"` — para el rol `agente` no hay tabs y el espacio desaparece
- El botón "+ Crear lead" usa `auth.showCrearLead` del store (no `showCrear` local)

---

## Tarjeta Reto semanal (post-it)

```css
.reto-card { background: #FEF9C3 !important; border-color: #fde68a !important; }
```

---

---

## V1 — Decisiones de scope

Esta rama replica la funcionalidad del CRM de producción con mejoras visuales. Las siguientes features fueron **intencionalmente eliminadas** porque no están disponibles en producción aún. No reintroducirlas sin decisión explícita.

### Features eliminadas de V1

| Feature | Dónde existía | Razón de eliminación |
|---|---|---|
| Override de gramaje por perro | `PerfilLeadView` — InputNumber + botón reset | El gramaje lo da el algoritmo; override no disponible en producción |
| Pago con Bizum | `PerfilLeadView` — botón en presu-actions | No disponible en producción |
| Patologías incompatibles / bloqueo de venta | `PerfilLeadView` — `leadIncompatible`, `PATOLOGIAS_INCOMPATIBLES`, aviso "Venta bloqueada" | No disponible en producción; todas las patologías son informativas |
| Cupón pre-relleno "campaña track" / "pregrabado agente" | `mock.ts` — `cuponesAplicados` | El agente los introduce manualmente cada vez |
| Columna "Fix" con InfoTooltip en ErroresPago | `ErroresPagoView` — columna con resolución Stripe | Feature nueva (guía de resolución) |
| v-tooltip en celdas de agente (tabla leads, errores) | `LeadsView`, `ErroresPagoView` | Tooltips eliminados como patrón general en V1 |
| Indicador de errores de pago en dashboard | `DashboardAgente`, `DashboardTeamLead` | No hay forma de mostrarlo en producción aún |
| Columna icono de error en tabla de leads | `LeadsView` | Idem |

### PerfilLeadView — estado simplificado (V1)

- **Patologías:** texto plano inline (`Patologías: nombre1, nombre2`), sin chips ni InfoTooltip
- **Cupones:** todos eliminables (sin lock), el agente los introduce cada vez
- **Botones de pago:** Enviar presupuesto · Formulario de pago · Pago con tarjeta · (TPV si modo feria) — sin Bizum
- **Presupuesto:** gramaje directo del algoritmo, sin override; toast de confirmación al enviar
- **Venta bloqueada:** eliminada — la venta nunca se bloquea por patologías en V1

### Historial — tipo `errorPago`

El historial del panel derecho (`AppRightPanel.vue`) soporta un nuevo tipo de entrada para errores de pago provenientes de Stripe. Mismo patrón arquitectónico que las llamadas de Ringover (evento automático de sistema externo, no entrada manual del agente).

**Entrada en `mock.ts`:**
```ts
{ tipo: 'errorPago', texto: 'Error de pago · Tarjeta · payment_intent_authentication_failure', fecha: '8/6/2026, 15:28' }
```

**`histIcon` mapping:**
```ts
errorPago: 'pi pi-credit-card'
```

**Visual:** `.hist-item--error` → icono y texto en `var(--color-error)` / `var(--color-error-dark)`.

**Tab filtering** (ahora funcional — antes decorativo):
```ts
const historialFiltrado = computed(() => {
  if (histTab.value === 'Llamadas')    return items.filter(i => i.tipo === 'llamada')
  if (histTab.value === 'Comentarios') return items.filter(i => i.tipo === 'comentario')
  return items  // 'Todo': todos los tipos incluyendo errorPago, whatsapp, recordatorio
})
```

El errorPago **solo aparece en el tab "Todo"** — no tiene tab propio. La arquitectura está preparada para que V2 consuma datos reales de Stripe en el mismo slot.

---

## Terminología unificada
- **Errores de pago** — usar siempre este término (no "Alertas de pago")
- **Agenda** — nombre de la sección en sidebar (no "Calendario")
- Ruta: `/errores-pago`, sección sidebar: "Errores de pago"
- Ruta: `/calendario`, sección sidebar: "Agenda"

---

## Componentes UI clave

### `SectionCard.vue`
- Prop `title` activa el header. Slot `#header` para el lado derecho.

### `KpiCard.vue`
Props: `valor`, `label`, `comparativa`, `tendencia` (`up`|`down`), `progreso`, `objetivo`, `badge`, `tone`.
- Barra de progreso verde success via `:deep(.kpi-progress .p-progressbar-value)`.
- `tone`: `rose` | `amber` | `emerald` | `violet`.

### `AgentAvatar.vue`
Avatar circular con iniciales. Props: `name`, `size`.

### `PasswordGate.vue`
Pantalla de acceso que bloquea el render de la app. Contraseña en `const PASS`. Persiste en `localStorage` con clave `dogfy_crm_auth`.

### Calendario semanal (agente)
- Hoy: fondo `var(--n-200)`. Días con evento: punto `var(--brand)`.
- Fechas en `src/data/mock.ts` → `mockProximasCitas`. **Mantener al mes corriente.**

---

## Ficheros clave

| Fichero | Propósito |
|---|---|
| `src/theme/palette.ts` | Colores de charts, fill de área, patrón hatch Meta |
| `src/theme/dogfy.ts` | Tokens PrimeVue |
| `src/assets/main.css` | Variables CSS globales + overrides PrimeVue + reglas `.is-mob` |
| `src/data/mock.ts` | Todos los datos de muestra |
| `src/stores/auth.ts` | Rol activo, previewWidth, isMobPreview, mobilePanelOpen, showCrearLead |
| `src/stores/reto.ts` | Contenido del reto semanal |
| `src/App.vue` | Raíz — PasswordGate + shell del layout |
| `src/components/layout/PasswordGate.vue` | Pantalla de contraseña (CRM1234) |
| `src/components/layout/AppRightPanel.vue` | Panel derecho — drawer en mobile |
| `src/components/layout/AppSidebar.vue` | Sidebar — oculto en mobile |
| `src/components/layout/AppBottomNav.vue` | Bottom nav — solo visible en mobile (≤480px) |
| `src/components/layout/AppHeader.vue` | Topbar — búsqueda expandible ≤900px, botón Crear lead en /leads |
| `src/components/layout/DevToolbar.vue` | Toolbar de QA — solo selector de rol/perfil |
| `src/components/ui/SectionCard.vue` | Card contenedor universal |
| `src/components/ui/KpiCard.vue` | Card de KPI con barra de progreso |
| `src/components/ui/FiltrosPanel.vue` | Panel filtros (Drawer derecho) para Leads / Ventas / Errores de pago |
| `src/components/ui/FiltrosChips.vue` | Chips de filtros activos con × individual por grupo |
| `src/components/ui/FiltrosAgentesPanel.vue` | Panel filtros agentes (País, CR%, Llamadas/día) |
| `src/components/dashboard/DashboardAgente.vue` | Dashboard Agente |
| `src/components/dashboard/DashboardTeamLead.vue` | Dashboard Team Lead |
| `src/components/dashboard/DashboardManager.vue` | Dashboard Manager |
| `src/views/LeadsView.vue` | Lista de leads con tabs por rol |
| `src/views/AgentesView.vue` | Lista de agentes con filtros y ordenación |
| `src/views/VentasView.vue` | Lista de ventas con filtros |
| `src/views/ErroresPagoView.vue` | Lista de errores de pago con filtros |
| `src/views/BuscarView.vue` | Resultados de búsqueda — Leads y Ventas con columnas unificadas |
| `src/views/PerfilLeadView.vue` | Detalle de lead — topbar, presupuesto, perros, códigos |
| `src/views/NotificacionesView.vue` | Notificaciones — filtros, bottom sheet / popup |
| `src/views/CalendarioView.vue` | Calendario — desktop + mobile multi-month/agenda |
| `vercel.json` | Rewrite SPA routing |

---

## Datos mock

Todos en `src/data/mock.ts`. Exports principales:
- `mockAgente` — Juan Camilo Cruz (agente)
- `mockTeamLead` — Michele Carlini (team_lead)
- `mockManager` — Judit Cabrera (manager)
- `mockLeadsActivos` — leads con estados
- `mockAgentes` — lista de agentes del equipo (con `pais`, `cr`, `llamadasDia`, etc.)
- `mockEquipoBarras` — gráfico barras TeamLead
- `mockTopVentas` — ranking vendedores
- `mockObjetivosPaises` — objetivos por país (Manager)
- `mockLeadsPorPais` — distribución leads por país
- `mockProximasCitas` — citas con `date: 'YYYY-MM-DD'` y `leadId: string | null`
- `mockRecordatorios` — to-do list
- `mockKpisTL` — KPIs del Team Lead. **`ventasMes`** es un objeto `{ actual: number, objetivo: number }` usado por el KPI card, la barra del panel derecho y el cómputo del % de progreso mensual. Cambiar aquí actualiza todos los widgets simultáneamente.

### Coherencia de datos Team Lead

Los siguientes valores deben ser consistentes entre sí:

| Widget | Campo | Fuente |
|---|---|---|
| KPI "Ventas del mes" | valor + barra progreso | `mockKpisTL.ventasMes.actual` / `.objetivo` |
| Panel derecho "Objetivo mensual" | `obj-val` + ProgressBar | `mockKpisTL.ventasMes` (importado en `AppRightPanel.vue`) |
| "Ventas por tipo" card | totales + donut center | `ventasTipoItems` (suma dinámica `ventasTipoTotal`) |
| KPI "Ventas de hoy" | valor | debe coincidir con `ventasTipoTotal` (actualmente **122**) |

`ventasTipoItems` en `DashboardTeamLead.vue`: Frescos 55 + Recuperados 42 + Pausados 25 = **122**.  
`ventasTipoTotal` se computa como `ventasTipoItems.reduce(...)` — úsalo en template para "Ventas totales" y centro del donut.

### Widget "Resumen agente" (Team Lead)

Métricas individuales de un agente al seleccionarlo. "Ventas día: 12" y "Ventas mes: 45" son valores de **un solo agente** (no del equipo), coherentes con la distribución: equipo hoy 122 / ~10 agentes activos ≈ 12 por agente.

---

## Grid de países (DashboardManager) — separadores responsive

`.paises-card` contiene `.paises-grid` con 4 columnas de KPIs por país. El separador visual cambia según breakpoint:

| Breakpoint | Layout | Separadores |
|---|---|---|
| > 1100px | 4 cols | `border-right` entre columnas |
| ≤ 1100px | 2×2 | `border-right` en cols impares (izq) + `border-bottom` en fila superior — forma una **cruz central** |
| ≤ 480px / `.is-mob` | 1 col | `border-bottom` entre cada país, sin `border-right` |

**Patrón nth-child para 2×2:**
```css
.pais-col:nth-child(odd)  { padding-right: 16px; border-right: 1px solid var(--n-150); }
.pais-col:nth-child(even) { padding-left: 16px; }
.pais-col:nth-child(-n+2) { padding-bottom: 16px; border-bottom: 1px solid var(--n-150); }
.pais-col:nth-child(n+3)  { padding-top: 16px; }
```

**Reset para 1 col** — seleccionar todos los variants nth-child en un bloque para evitar especificidad:
```css
.pais-col,
.pais-col:nth-child(odd),
.pais-col:nth-child(even),
.pais-col:nth-child(-n+2),
.pais-col:nth-child(n+3) { padding: 0 0 14px; border-right: none; border-bottom: 1px solid var(--n-150); }
.pais-col:last-child { border-bottom: none; padding-bottom: 0; }
```
Las reglas `.is-mob .pais-col[...]` duplican el mismo patrón en `main.css`.

---

## Gráfica "Tu equipo" (DashboardTeamLead) — interactividad x-axis

La gráfica de barras del equipo usa agentes reales de España (`mockAgentes.filter(a => a.pais === 'España').slice(0, 8)`). Las etiquetas del eje X muestran nombres abreviados ("Juan M.") pero son **interactivas**:

- **Tooltip en hover**: al pasar sobre una etiqueta, aparece un tooltip `<div class="label-tip">` con el nombre completo, posicionado sobre el tick del eje X.
- **Click → perfil agente**: navega a `/agentes/:id` del agente correspondiente.
- El cursor cambia a `pointer` al entrar en la zona de etiquetas.

**Implementación**: `onMounted` añade listeners de `mousemove`, `mouseleave` y `click` al `<canvas>`. La detección usa `chart.scales.x.getPixelForTick(i)` con tolerancia `±36px`. Acceso al Chart.js instance: `equipoChartRef.value?.getChart?.()`.

---

## Top ventas (DashboardTeamLead) — ranking y navegación

La card "Top ventas" muestra los 5 mejores agentes de España ordenados por **score combinado**:
```
score = (total / maxTotal) × 50 + (cr / maxCr) × 50
```
Implementado como `topVentasRanked` computed. Cada fila es un `<RouterLink to="/agentes/:id">` — navega al perfil del agente al hacer clic.

---

## MultiSelect agentes (DashboardTeamLead) — lógica de atajos

El selector de agentes en el widget "Resumen agente" tiene lógica inteligente de grupo:

- **Pre-selección por defecto**: "Mi equipo" + todos sus agentes individuales (`mi-0..4`) → el atajo aparece marcado en el dropdown y la etiqueta muestra "Mi equipo".
- **Seleccionar atajo "Mi equipo"**: expande automáticamente la selección añadiendo todos los `mi-*` agentes individuales.
- **Quitar un agente individual**: desactiva el atajo "Mi equipo" (selección ya no es el equipo completo).
- **Deseleccionar "Mi equipo"**: elimina también todos los `mi-*` individuales.
- La etiqueta del selector usa `:maxSelectedLabels="hasMiEquipo ? 0 : 1"` + `:selectedItemsLabel="hasMiEquipo ? 'Mi equipo' : '{0} agentes'"` para siempre mostrar el texto correcto.

---

## Notas de desarrollo

- `InputNumber` de PrimeVue: `inputStyle` debe ser **objeto**.
  ```html
  <InputNumber :inputStyle="{ width: '56px', textAlign: 'center' }" />
  ```
- Selects con tipo unión: tipificar explícitamente el array de opciones.
- `auth.ts`: no importar `onMounted`/`onUnmounted`.
- Diálogos PrimeVue: quitar focus ring del botón cerrar con:
  ```css
  .p-dialog-close-button:focus,
  .p-dialog-close-button:focus-visible { outline: none !important; box-shadow: none !important; }
  ```
- Border-bottom en header de Dialog: aplicar vía `:pt` en el propio `.p-dialog-header`, no en el slot content — así cubre también el botón X nativo de PrimeVue.
- Inputs con CTA adyacente: usar `align-items: stretch` en el contenedor flex para que el botón iguale la altura del input sin fijar px.
- DevToolbar: `max-width: calc(100vw - 24px); overflow-x: auto; scrollbar-width: none` para evitar desbordamiento.
- **Interactividad en eje X de Chart.js**: como los ticks del eje X son canvas (no DOM), los tooltips y clicks se implementan con listeners nativos sobre `<canvas>` + `chart.scales.x.getPixelForTick(i)`. Acceder al Chart.js instance: `chartRef.value?.getChart?.()`. Posicionar tooltip `<div>` con `position: absolute` dentro de un wrapper `position: relative`.
- **Responsive con nth-child y múltiples breakpoints**: al hacer reset de estilos nth-child, agrupar todos los selectores en un bloque (`selector, selector:nth-child(odd), ...`) para evitar problemas de especificidad sin usar `!important`.
