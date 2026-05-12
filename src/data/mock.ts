export type Role = 'agente' | 'team_lead' | 'manager'

export const mockAgente = {
  id: '1',
  nombre: 'Catalina D\'Amato',
  rol: 'agente' as Role,
  pais: 'España',
  avatar: '',
  disponible: true,
  cupon: 'CATA20',
}

export const mockTeamLead = {
  id: '2',
  nombre: 'Catalina D\'Amato',
  rol: 'team_lead' as Role,
  pais: 'España',
  avatar: '',
  disponible: true,
  cupon: 'TL30',
}

export const mockManager = {
  id: '3',
  nombre: 'Catalina D\'Amato',
  rol: 'manager' as Role,
  pais: 'Global',
  avatar: '',
  disponible: true,
  cupon: '',
}

export const mockKpisAgente = {
  ventasHoy: 12,
  ventasMes: 30,
  diasTrabajados: 16,
  crFrescos: 3.0,
  paraComision: { actual: 2, objetivo: 120 },
  ventasTotales: 33,
  bracketComision: 1.2,
}

export const mockKpisTL = {
  ventasHoy: 122,
  ventasMes: 3045,
  agentesDisponibles: { disponibles: 24, total: 80 },
  cr: 3.0,
}

export const mockKpisManager = {
  ventasTotalesHoy: 3449,
  ventasTotalesMes: 6830,
  crFrescos: 8.4,
  crGeneral: 3.2,
}

export const mockBolsaLeads = {
  total: 4599,
  noGestionados: 3085,
  noContesta: 456,
  frescos: 985,
}

export const mockLeadsActivosAgente = {
  total: 115,
  pendientes: 1,
  noContesta: 25,
  cita: 16,
  formulario: 32,
  errorPago: 3,
}

export const mockActividadDia = {
  llamadas: 33,
  tiempoTotal: '3h 43m 21s',
  tiempoMedio: '12m 14s',
  pucr: '5m 19s',
}

export const mockVentasTipo = {
  frescos:    { cantidad: 10, multiplicador: 1 },
  recuperados:{ cantidad: 10, multiplicador: 1.5 },
  pausados:   { cantidad: 10, multiplicador: 1.5 },
  total: 30,
}

export const mockHistoricoVentas = {
  labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
  esteAno:  [8000,10000,14000,18000,22000,19000,24000,21000,18000,20000,23000,26000],
  anoAnterior: [6000,8000,11000,15000,17000,14000,19000,17000,15000,17000,20000,22000],
}

export const mockProximasCitas = [
  { id: '1', titulo: 'Cita Lead papá de Spike',    fecha: 'Mi, 13 may · 10:00', date: '2026-05-13' },
  { id: '2', titulo: 'Seguimiento Laura Méndez',    fecha: 'Vi, 15 may · 12:30', date: '2026-05-15' },
  { id: '3', titulo: 'Demo plan Premium empresa X', fecha: 'Lu, 18 may · 16:00', date: '2026-05-18' },
]

export const mockRecordatorios = [
  { id: '1', texto: 'Avisar renovación para lorem ip...', fecha: 'Lunes, 16 de feb. 10:00 am' },
  { id: '2', texto: 'Avisar renovación para lorem ip...', fecha: 'Lunes, 16 de feb. 10:00 am' },
  { id: '3', texto: 'Avisar renovación para lorem ip...', fecha: 'Lunes, 16 de feb. 10:00 am' },
  { id: '4', texto: 'Avisar renovación para lorem ip...', fecha: 'Lunes, 16 de feb. 10:00 am' },
]

export const mockRetoSemanal = {
  titulo: 'Ruleta 🎰',
  descripcion: 'Cada 3 ventas hechas por el agente, puede tirar la ruleta. Cuantas más ventas, más premios.',
  linkReglas: '#',
}

const _agentesData = [
  { nombre: 'Juan Martín',     ini: 'JM' },
  { nombre: 'Laura Ruiz',      ini: 'LR' },
  { nombre: 'Carlos Díaz',     ini: 'CD' },
  { nombre: 'Ana Soto',        ini: 'AS' },
  { nombre: 'María Pérez',     ini: 'MP' },
  { nombre: 'Pablo García',    ini: 'PG' },
  { nombre: 'Sara Molina',     ini: 'SM' },
  { nombre: 'David Fernández', ini: 'DF' },
  { nombre: 'Elena Torres',    ini: 'ET' },
  { nombre: 'Roberto Vega',    ini: 'RV' },
  { nombre: 'Nuria López',     ini: 'NL' },
  { nombre: 'Marcos Jiménez',  ini: 'MJ' },
  { nombre: 'Claudia Ramos',   ini: 'CR' },
  { nombre: 'Iván Serrano',    ini: 'IS' },
  { nombre: 'Patricia Moya',   ini: 'PM' },
  { nombre: 'Alejandro Gil',   ini: 'AG' },
  { nombre: 'Sofía Navarro',   ini: 'SN' },
  { nombre: 'Tomás Blanco',    ini: 'TB' },
  { nombre: 'Raquel Moreno',   ini: 'RM' },
  { nombre: 'Hugo Castillo',   ini: 'HC' },
]

export const mockAgentes = _agentesData.map((a, i) => ({
  id: String(i + 1),
  nombre: a.nombre,
  ini: a.ini,
  avatar: '',
  total: 30 + Math.floor(Math.random() * 30),
  cr: parseFloat((2 + Math.random() * 10).toFixed(1)),
  llamadasDia: 20 + Math.floor(Math.random() * 30),
  tiempoLlamada: `${3 + Math.floor(Math.random() * 9)}m ${Math.floor(Math.random() * 59)}s`,
  fresh: Math.floor(Math.random() * 20),
  freshCr: parseFloat((1 + Math.random() * 8).toFixed(1)),
  recuperados: Math.floor(Math.random() * 15),
  recuperadosCr: parseFloat((2 + Math.random() * 10).toFixed(1)),
  pausados: Math.floor(Math.random() * 10),
  pausadosCr: parseFloat((1 + Math.random() * 7).toFixed(1)),
  noGestionados: Math.floor(Math.random() * 60),
  noContesta1: Math.floor(Math.random() * 40),
  noContesta2: Math.floor(Math.random() * 20),
  enCita: Math.floor(Math.random() * 25),
  formulario: Math.floor(Math.random() * 35),
  // legacy fields kept for other uses
  ventasDias: 5 + Math.floor(Math.random() * 10),
  ventasMes: 30 + Math.floor(Math.random() * 30),
  pendientes: Math.floor(Math.random() * 50),
  noContesta: Math.floor(Math.random() * 200),
  cita: Math.floor(Math.random() * 100),
}))

export const mockEquipoBarras = {
  labels: ['Juan M.','Laura R.','Carlos D.','Ana S.','María P.','Pablo G.','Sara M.','David F.'],
  ventas: [12000,18000,8000,22000,5000,15000,10000,19000],
  meta:   [15000,15000,15000,15000,15000,15000,15000,15000],
}

export const mockObjetivoMensual = { actual: 749, objetivo: 2430 }

// Per Figma 2025:18195 — 1 lead "Pendiente" (drip-feed), then mix of estados
const _estadosLeads = ['No contesta','No contesta','No interesa','En cita','En cita','Formulario','No contesta(1)','No contesta(1)']
const _agentesIni = ['JM','LR','CD','AS','MP','PG']
const _agentesNombres = ['Juan Martín','Laura Ruiz','Carlos Díaz','Ana Soto','María Pérez','Pablo García']

export const mockLeads = Array.from({ length: 80 }, (_, i) => {
  const ai = i % _agentesIni.length
  return {
    id: String(i + 1),
    nombre: `Lead Ejemplo ${i + 1}`,
    telefono: '699652338',
    email: `autotest+yanezceballosvirginia+es9304@test.com`,
    estado: i === 0 ? 'Pendiente' : _estadosLeads[(i - 1) % _estadosLeads.length],
    pais: ['España','Francia','Italia','Alemania'][i % 4],
    agente: _agentesNombres[ai],
    agenteIni: _agentesIni[ai],
    cupon: 'CALABAZA20S',
    campana: 'Halloween 2025',
    grDia: '600',
    importe: '26,22 €',
    fechaCreacion: '16/02/2026',
    ultimaActividad: '16/02/2026',
    errorPago: i % 7 === 0,
  }
})

export const mockKpisPaises = [
  { pais: 'España', flag: '🇪🇸', ventas: 1234, cr: 7, pucr: '38s', tiempo: '5m 19s', leadsActivos: 1234, pendientes: 45, noContesta: 453, cita: 203, formulario: 507 },
  { pais: 'Francia', flag: '🇫🇷', ventas: 1234, cr: 7, pucr: '38s', tiempo: '5m 19s', leadsActivos: 1234, pendientes: 45, noContesta: 453, cita: 203, formulario: 507 },
  { pais: 'Italia',  flag: '🇮🇹', ventas: 1234, cr: 7, pucr: '38s', tiempo: '5m 19s', leadsActivos: 1234, pendientes: 45, noContesta: 453, cita: 203, formulario: 507 },
  { pais: 'Alemania',flag: '🇩🇪', ventas: 1234, cr: 7, pucr: '38s', tiempo: '5m 19s', leadsActivos: 1234, pendientes: 45, noContesta: 453, cita: 203, formulario: 507 },
]

export const mockObjetivosPaises = [
  { pais: 'España',  flag: '🇪🇸', actual: 2149, objetivo: 5430 },
  { pais: 'Italia',  flag: '🇮🇹', actual: 1249, objetivo: 2430 },
  { pais: 'Francia', flag: '🇫🇷', actual: 749,  objetivo: 1245 },
  { pais: 'Alemania',flag: '🇩🇪', actual: 119,  objetivo: 400  },
]

export const mockLeadsPaises = [
  { pais: 'España',  flag: '🇪🇸', leads: 3085 },
  { pais: 'Francia', flag: '🇫🇷', leads: 656  },
  { pais: 'Italia',  flag: '🇮🇹', leads: 456  },
  { pais: 'Alemania',flag: '🇩🇪', leads: 112  },
]

export type LeadEstado = 'Pendiente' | 'No contesta' | 'No interesa' | 'En cita' | 'Cita' | 'Formulario' | 'Venta'

export const ESTADOS_LEAD: LeadEstado[] = ['Pendiente', 'No contesta', 'No interesa', 'En cita', 'Formulario', 'Venta']

export const mockPerfilLead = {
  id: '1',
  leadCode: '3NF753H0NV',
  nombre: 'María',
  apellido: 'García López',
  telefono: '+34 000 000 000',
  email: 'tumejorcorreo@gmail.com',
  pais: 'España',
  ciudad: 'Madrid',
  estado: 'Pendiente' as LeadEstado,
  agente: 'Juan Camilo Martinez',
  agenteIni: 'JM',
  campana: 'Black Friday 2025',
  fuenteAdquisicion: ['Web', 'Whatsapp', 'Sales'],
  cupon: 'CATA20',
  errorPago: false,
  perros: [
    {
      nombre: 'Spike',
      kcalDia: '960-1000 kcal/día',
      gDia: '600g/día',
      plan: 'Plan completo',
      menus: ['Pollo', 'Pavo', 'Buey', 'Salmón'],
      sexo: 'Macho',
      raza: 'Poodle',
      etapa: 'Adulto',
      edad: '1 año y 8 meses',
      peso: '8kg',
      forma: 'Figurín',
      tipoComida: 'Gourmet',
      nivelActividad: 'alto',
      esterilizado: 'Si',
      patologias: [
        { nombre: 'Alergia alimentaria', incompatible: false },
        { nombre: 'Diabetes',            incompatible: false },
        { nombre: 'Insuficiencia renal', incompatible: true  },
      ],
    },
  ],
  fechaEntrega: '27 / 07 / 2022',
  empresaEnvio: 'GLS',
  cuponesAplicados: ['campaña track', 'cupón pregrabado de agente'],
  referidos: ['AMIGO-202'],
  presupuesto: {
    plan: 'Mensualidad' as 'Prueba' | 'Mensualidad',
    prueba:      { dto: '-50%', precioOriginal: '24,63€', precio: '14,78 €' },
    mensualidad: { dto: '-20%', precioOriginal: '49,25€', precio: '43,72 €' },
    items: [
      { perro: 'Spike', grDia: '600g', cantidad: '28u', tamano: '2x300g', base: '14,78€' },
      { perro: 'Toby',  grDia: '200g', cantidad: '28u', tamano: '2x300g', base: '14,78€' },
    ],
    total: { grDia: '800g', cantidad: '28u', tamano: '4x300g', base: '43,72€' },
  },
  datosEnvio: {
    facturacion: '[Nombre] [Apellido]',
    direccion: '[Calle, 00], [Localidad], [Código Postal], [Provincia]',
    notas: '---',
  },
  historial: [
    { tipo: 'whatsapp',   texto: '[mensaje de whatsapp...]',         fecha: 'Lunes, 16 de feb. 10:00 am', entrante: true  },
    { tipo: 'whatsapp',   texto: '[mensaje de whatsapp...]',         fecha: 'Lunes, 16 de feb. 10:00 am', entrante: false },
    { tipo: 'recordatorio', texto: 'Avisar renovación para lorem ip…', fecha: 'Lunes, 16 de feb. 10:00 am', entrante: false },
    { tipo: 'whatsapp',   texto: '[mensaje de whatsapp...]',         fecha: 'Lunes, 16 de feb. 10:00 am', entrante: true  },
    { tipo: 'recordatorio', texto: 'Avisar renovación para lorem ip…', fecha: 'Lunes, 16 de feb. 10:00 am', entrante: false },
    { tipo: 'recordatorio', texto: 'Avisar renovación para lorem ip…', fecha: 'Lunes, 16 de feb. 10:00 am', entrante: false },
  ],
}

// ── Detalle de venta (Figma 932:62922) ───────────────
export const mockPerfilVenta = {
  id: '1',
  ventaCode: '7VTA-9281Z',
  agente: 'Juan Camilo Martinez',
  agenteAsignado: true, // false → muestra "-- Venta no asignada"
  // Mismo perro / lead / envío que en perfil lead
  perro: {
    nombre: 'Spike',
    kcalDia: '1000 kcal/día',
    gDia: '600g/día',
    plan: 'Plan completo',
    menus: ['Pollo', 'Pavo', 'Buey', 'Salmón'],
    sexo: 'Macho',
    raza: 'Poodle',
    etapa: 'Adulto',
    edad: '1 año y 8 meses',
    peso: '8kg',
    forma: 'Figurín',
    tipoComida: 'Gourmet',
    nivelActividad: 'alto',
    esterilizado: 'Si',
    patologias: [
      { nombre: 'Alergia alimentaria', incompatible: false },
      { nombre: 'Artritis', incompatible: false },
    ],
  },
  lead: {
    leadCode: '3NF753H0NV',
    nombre: 'María',
    apellido: 'García López',
    telefono: '+34 000 000 000',
    email: 'tumejorcorreo@gmail.com',
    campana: 'Black Friday 2025',
    fuenteAdquisicion: ['Web', 'Whatsapp', 'Sales'],
  },
  datosEnvio: {
    facturacion: '[Nombre] [Apellido]',
    direccion: '[Calle, 00], [Localidad], [Código Postal], [Provincia]',
    notas: '---',
  },
  // Datos de la compra
  compra: {
    cuponesAplicados: ['cupón de agente', 'código referido'],
    plan: 'Mensualidad' as 'Prueba' | 'Mensualidad',
    prueba:              { dto: '-50%', precioOriginal: '24,63€', precio: '14,78 €' },
    mensualidad:         { dto: '-20%', precioOriginal: '49,25€', precio: '43,72 €' },
    fechaCompra:         '16 / 02 / 2025',
    fechaEntregaPrueba:  '20 / 02 / 2025',
  },
  historial: [
    { tipo: 'recordatorio', texto: 'Compra efectuada', fecha: 'Lunes, 16 de feb. 10:00 am' },
    { tipo: 'recordatorio', texto: 'Error en el pago: [PayPal] · Código: [action_required] · Fecha de intento: [30/10/2025, 13:29] · Fecha de fallo: [30/10/2025, 13:29]', fecha: 'Lunes, 16 de feb. 10:00 am' },
    { tipo: 'whatsapp',     texto: '[mensaje de whatsapp...]',          fecha: 'Lunes, 16 de feb. 10:00 am' },
    { tipo: 'whatsapp',     texto: '[mensaje de whatsapp...]',          fecha: 'Lunes, 16 de feb. 10:00 am' },
    { tipo: 'recordatorio', texto: 'Avisar renovación para lorem ipsum dolor', fecha: 'Lunes, 16 de feb. 10:00 am' },
    { tipo: 'whatsapp',     texto: '[mensaje de whatsapp...]',          fecha: 'Lunes, 16 de feb. 10:00 am' },
    { tipo: 'recordatorio', texto: 'Avisar renovación para lorem ipsum dolor', fecha: 'Lunes, 16 de feb. 10:00 am' },
    { tipo: 'recordatorio', texto: 'Avisar renovación para lorem ipsum dolor', fecha: 'Lunes, 16 de feb. 10:00 am' },
  ],
}

// ── Ventas (Figma 2039:18709) ────────────────────────
const _ventaAgentesIni = ['JM','LR','CD','AS','MP','PG']
const _ventaAgentesNombres = ['Juan Martín','Laura Ruiz','Carlos Díaz','Ana Soto','María Pérez','Pablo García']
export const mockVentas = Array.from({ length: 80 }, (_, i) => {
  const ai = i % _ventaAgentesIni.length
  return {
    id: String(i + 1),
    fecha: '25/10/2025 12:21',
    agente: _ventaAgentesNombres[ai],
    agenteIni: _ventaAgentesIni[ai],
    telefono: '699652338',
    email: 'autotest+yanezceballosvirginia+es9304@test.com',
    cupon: 'WANDA20S',
    score: i % 2 === 0 ? 1 : 1.5,
    importe: '26,22 €',
    pais: ['España','Francia','Italia','Alemania'][i % 4],
  }
})

export const mockKpisVentasAgente = {
  hoy:    { valor: 12,    delta: '+8% from yesterday' },
  ayer:   { valor: 16,    delta: '+8% from the day before' },
  semana: { valor: 54,    delta: '+8% from last week' },
  comision: { valor: '2/120', delta: '+8% from last month' },
}

export const mockKpisVentasTL = {
  hoy:    { valor: 49,  delta: '+8% from yesterday' },
  ayer:   { valor: 30,  delta: '+8% from the day before' },
  semana: { valor: 199, delta: '+8% from last week' },
  mes:    { valor: 24, objetivo: 80 }, // con progress bar
}

export const mockRankingPaises = [
  { pais: 'España',   flag: '🇪🇸', total: 87, agentes: Array.from({ length: 14 }, () => ({ nombre: 'José Manuel Sala...', hoy: 6, mes: 34 })) },
  { pais: 'Francia',  flag: '🇫🇷', total: 32, agentes: Array.from({ length: 8  }, () => ({ nombre: 'José Manuel Sala...', hoy: 6, mes: 34 })) },
  { pais: 'Italia',   flag: '🇮🇹', total: 45, agentes: Array.from({ length: 10 }, () => ({ nombre: 'José Manuel Sala...', hoy: 6, mes: 34 })) },
  { pais: 'Alemania', flag: '🇩🇪', total: 3,  agentes: Array.from({ length: 5  }, () => ({ nombre: 'José Manuel Sala...', hoy: 6, mes: 34 })) },
]

// ── Errores de pago ──────────────────────────────
// Códigos típicos de Stripe + cómo se solucionan en el flujo de Dogfy
export type EstadoError = 'Pendiente' | 'Recuperable' | 'No recuperable' | 'Gestionado'
export const ESTADOS_ERROR: EstadoError[] = ['Pendiente','Recuperable','No recuperable','Gestionado']

export interface StripeError {
  code: string
  motivo: string
  resumen: string         // copy corto que aparece en el tooltip
  docUrl: string          // hyperlink a la doc detallada de Stripe
}

export const STRIPE_ERRORS: StripeError[] = [
  {
    code: 'card_declined',
    motivo: 'Tarjeta rechazada',
    resumen: 'El banco emisor rechazó el cargo. Pídele al cliente otra tarjeta o que contacte a su banco.',
    docUrl: 'https://stripe.com/docs/declines/codes',
  },
  {
    code: 'insufficient_funds',
    motivo: 'Fondos insuficientes',
    resumen: 'La cuenta no tiene saldo. Reintenta en 24-48 h o pide otra forma de pago.',
    docUrl: 'https://stripe.com/docs/declines/codes#insufficient_funds',
  },
  {
    code: 'expired_card',
    motivo: 'Tarjeta caducada',
    resumen: 'Solicita al cliente que actualice los datos de la tarjeta.',
    docUrl: 'https://stripe.com/docs/declines/codes#expired_card',
  },
  {
    code: 'incorrect_cvc',
    motivo: 'CVC incorrecto',
    resumen: 'El código de seguridad no coincide. Pide al cliente que vuelva a introducirlo.',
    docUrl: 'https://stripe.com/docs/declines/codes#incorrect_cvc',
  },
  {
    code: 'processing_error',
    motivo: 'Error de procesamiento',
    resumen: 'Fallo temporal del banco emisor. Reintenta el cobro pasados unos minutos.',
    docUrl: 'https://stripe.com/docs/declines/codes#processing_error',
  },
  {
    code: 'action_required',
    motivo: 'Autenticación 3DS pendiente',
    resumen: 'El cliente debe completar 3D-Secure. Reenvía el link de pago para que confirme la operación.',
    docUrl: 'https://stripe.com/docs/strong-customer-authentication',
  },
]

const _formasPago = ['Visa', 'Mastercard', 'PayPal', 'Apple Pay']

export const mockErroresPago = Array.from({ length: 50 }, (_, i) => {
  const ai = i % _agentesIni.length
  const err = STRIPE_ERRORS[i % STRIPE_ERRORS.length]
  const tipo: EstadoError = i % 2 === 0 ? 'Recuperable' : 'No recuperable'
  return {
    id: String(i + 1),
    nombre: `Lead Ejemplo ${i + 1}`,
    telefono: `+34 6${String(Math.floor(Math.random()*99999999)).padStart(8,'0')}`,
    email: `lead${i + 1}@test.com`,
    forma: _formasPago[i % _formasPago.length],
    importe: `${(Math.random() * 100 + 30).toFixed(2)}€`,
    codigoStripe: err.code,
    motivoError:  err.motivo,
    solucionResumen: err.resumen,
    solucionDocUrl:  err.docUrl,
    ultimoIntento: '30/10/2025 13:29',
    intentos: Math.floor(Math.random() * 4) + 1,
    tipo,
    estado: tipo,
    fechaFallo: '16/02/2026',
    agente: _agentesNombres[ai],
    agenteIni: _agentesIni[ai],
  }
})
