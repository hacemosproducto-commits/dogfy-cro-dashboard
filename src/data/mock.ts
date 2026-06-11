export type Role = 'agente' | 'team_lead' | 'manager'

export const mockAgente = {
  id: '1',
  nombre: 'Juan Camilo Cruz',
  rol: 'agente' as Role,
  pais: 'España',
  avatar: '',
  disponible: true,
  cupon: 'CATA20',
}

export const mockTeamLead = {
  id: '2',
  nombre: 'Michele Carlini',
  rol: 'team_lead' as Role,
  pais: 'España',
  avatar: '',
  disponible: true,
  cupon: 'TL30',
}

export const mockManager = {
  id: '3',
  nombre: 'Judit Cabrera',
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
  ventasMes: { actual: 749, objetivo: 2430 },
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
  { id: '1', titulo: 'Cita Lead papá de Spike',    fecha: 'Mi, 13 may · 10:00', date: '2026-05-13', leadId: '1' },
  { id: '2', titulo: 'Seguimiento Laura Méndez',    fecha: 'Vi, 15 may · 12:30', date: '2026-05-15', leadId: '2' },
  { id: '3', titulo: 'Demo plan Premium empresa X', fecha: 'Lu, 18 may · 16:00', date: '2026-05-18', leadId: null },
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

// Datos deterministas — sin Math.random() para que los valores sean consistentes entre builds
// score = (total/maxTotal * 50) + (cr/maxCr * 50) — usado en Top ventas
// pais se usa para filtros en AgentesView
export const mockAgentes = [
  { id:'1',  pais:'España',   nombre:'Juan Martín',     ini:'JM', avatar:'', total:32, cr:6.1,  llamadasDia:28, tiempoLlamada:'6m 12s', fresh:8,  freshCr:4.2, recuperados:6,  recuperadosCr:7.8,  pausados:4, pausadosCr:5.1, noGestionados:18, noContesta1:12, noContesta2:5,  enCita:8,  formulario:12, ventasDias:8,  ventasMes:32, pendientes:1,  noContesta:38,  cita:14 },
  { id:'2',  pais:'España',   nombre:'Laura Ruiz',      ini:'LR', avatar:'', total:34, cr:11.3, llamadasDia:22, tiempoLlamada:'8m 45s', fresh:12, freshCr:9.1, recuperados:4,  recuperadosCr:13.2, pausados:3, pausadosCr:9.8, noGestionados:8,  noContesta1:7,  noContesta2:2,  enCita:6,  formulario:9,  ventasDias:11, ventasMes:34, pendientes:1,  noContesta:14,  cita:8  },
  { id:'3',  pais:'España',   nombre:'Carlos Díaz',     ini:'CD', avatar:'', total:52, cr:2.1,  llamadasDia:46, tiempoLlamada:'4m 30s', fresh:6,  freshCr:1.8, recuperados:9,  recuperadosCr:2.4,  pausados:5, pausadosCr:2.0, noGestionados:42, noContesta1:31, noContesta2:14, enCita:4,  formulario:6,  ventasDias:6,  ventasMes:52, pendientes:1, noContesta:68,  cita:5  },
  { id:'4',  pais:'España',   nombre:'Ana Soto',        ini:'AS', avatar:'', total:30, cr:6.1,  llamadasDia:25, tiempoLlamada:'7m 05s', fresh:7,  freshCr:5.2, recuperados:5,  recuperadosCr:6.9,  pausados:3, pausadosCr:4.7, noGestionados:14, noContesta1:11, noContesta2:4,  enCita:7,  formulario:11, ventasDias:7,  ventasMes:30, pendientes:1,  noContesta:22,  cita:11 },
  { id:'5',  pais:'España',   nombre:'María Pérez',     ini:'MP', avatar:'', total:41, cr:4.4,  llamadasDia:35, tiempoLlamada:'5m 22s', fresh:9,  freshCr:3.6, recuperados:7,  recuperadosCr:5.1,  pausados:4, pausadosCr:3.8, noGestionados:25, noContesta1:18, noContesta2:8,  enCita:5,  formulario:8,  ventasDias:9,  ventasMes:41, pendientes:1, noContesta:41,  cita:7  },
  { id:'6',  pais:'España',   nombre:'Pablo García',    ini:'PG', avatar:'', total:45, cr:5.2,  llamadasDia:38, tiempoLlamada:'5m 48s', fresh:10, freshCr:4.4, recuperados:8,  recuperadosCr:6.0,  pausados:5, pausadosCr:4.2, noGestionados:28, noContesta1:20, noContesta2:9,  enCita:6,  formulario:10, ventasDias:10, ventasMes:45, pendientes:1, noContesta:48,  cita:9  },
  { id:'7',  pais:'España',   nombre:'Sara Molina',     ini:'SM', avatar:'', total:38, cr:7.8,  llamadasDia:30, tiempoLlamada:'7m 33s', fresh:11, freshCr:6.8, recuperados:6,  recuperadosCr:9.2,  pausados:3, pausadosCr:6.5, noGestionados:12, noContesta1:9,  noContesta2:3,  enCita:9,  formulario:14, ventasDias:10, ventasMes:38, pendientes:1,  noContesta:18,  cita:13 },
  { id:'8',  pais:'España',   nombre:'David Fernández', ini:'DF', avatar:'', total:55, cr:3.3,  llamadasDia:48, tiempoLlamada:'4m 15s', fresh:7,  freshCr:2.8, recuperados:10, recuperadosCr:3.9,  pausados:6, pausadosCr:2.5, noGestionados:45, noContesta1:34, noContesta2:15, enCita:3,  formulario:5,  ventasDias:7,  ventasMes:55, pendientes:1, noContesta:75,  cita:4  },
  { id:'9',  pais:'España',   nombre:'Elena Torres',    ini:'ET', avatar:'', total:28, cr:8.5,  llamadasDia:20, tiempoLlamada:'9m 10s', fresh:9,  freshCr:7.2, recuperados:4,  recuperadosCr:10.1, pausados:2, pausadosCr:7.9, noGestionados:7,  noContesta1:5,  noContesta2:2,  enCita:8,  formulario:12, ventasDias:9,  ventasMes:28, pendientes:1,  noContesta:11,  cita:11 },
  { id:'10', pais:'España',   nombre:'Roberto Vega',    ini:'RV', avatar:'', total:42, cr:4.9,  llamadasDia:36, tiempoLlamada:'5m 37s', fresh:9,  freshCr:4.1, recuperados:7,  recuperadosCr:5.7,  pausados:4, pausadosCr:4.0, noGestionados:22, noContesta1:16, noContesta2:7,  enCita:5,  formulario:9,  ventasDias:8,  ventasMes:42, pendientes:1,  noContesta:35,  cita:8  },
  { id:'21', pais:'España',   nombre:'Marta Lozano',    ini:'ML', avatar:'', total:36, cr:7.2,  llamadasDia:28, tiempoLlamada:'7m 45s', fresh:9,  freshCr:6.1, recuperados:5,  recuperadosCr:8.3,  pausados:3, pausadosCr:5.9, noGestionados:11, noContesta1:8,  noContesta2:3,  enCita:8,  formulario:12, ventasDias:9,  ventasMes:36, pendientes:1,  noContesta:16,  cita:11 },
  { id:'22', pais:'España',   nombre:'Iñaki Ortega',    ini:'IO', avatar:'', total:47, cr:4.6,  llamadasDia:40, tiempoLlamada:'5m 05s', fresh:8,  freshCr:3.9, recuperados:8,  recuperadosCr:5.3,  pausados:5, pausadosCr:3.7, noGestionados:30, noContesta1:22, noContesta2:10, enCita:4,  formulario:7,  ventasDias:8,  ventasMes:47, pendientes:1,  noContesta:52,  cita:6  },
  { id:'11', pais:'Francia',  nombre:'Nuria López',     ini:'NL', avatar:'', total:35, cr:6.7,  llamadasDia:29, tiempoLlamada:'6m 52s', fresh:8,  freshCr:5.8, recuperados:5,  recuperadosCr:7.8,  pausados:3, pausadosCr:5.4, noGestionados:13, noContesta1:9,  noContesta2:3,  enCita:7,  formulario:11, ventasDias:9,  ventasMes:35, pendientes:1,  noContesta:20,  cita:10 },
  { id:'12', pais:'Francia',  nombre:'Marcos Jiménez',  ini:'MJ', avatar:'', total:29, cr:5.8,  llamadasDia:24, tiempoLlamada:'7m 18s', fresh:6,  freshCr:4.9, recuperados:4,  recuperadosCr:6.8,  pausados:2, pausadosCr:4.5, noGestionados:16, noContesta1:12, noContesta2:5,  enCita:6,  formulario:9,  ventasDias:7,  ventasMes:29, pendientes:1,  noContesta:26,  cita:8  },
  { id:'13', pais:'Francia',  nombre:'Claudia Ramos',   ini:'CR', avatar:'', total:48, cr:3.6,  llamadasDia:41, tiempoLlamada:'4m 55s', fresh:8,  freshCr:3.0, recuperados:9,  recuperadosCr:4.2,  pausados:5, pausadosCr:3.1, noGestionados:36, noContesta1:26, noContesta2:11, enCita:4,  formulario:6,  ventasDias:8,  ventasMes:48, pendientes:1, noContesta:55,  cita:5  },
  { id:'14', pais:'Francia',  nombre:'Iván Serrano',    ini:'IS', avatar:'', total:25, cr:9.2,  llamadasDia:19, tiempoLlamada:'9m 44s', fresh:8,  freshCr:8.1, recuperados:3,  recuperadosCr:11.0, pausados:2, pausadosCr:8.6, noGestionados:5,  noContesta1:4,  noContesta2:1,  enCita:9,  formulario:13, ventasDias:10, ventasMes:25, pendientes:1,  noContesta:8,   cita:12 },
  { id:'15', pais:'Italia',   nombre:'Patricia Moya',   ini:'PM', avatar:'', total:39, cr:4.1,  llamadasDia:33, tiempoLlamada:'5m 59s', fresh:7,  freshCr:3.4, recuperados:6,  recuperadosCr:4.8,  pausados:4, pausadosCr:3.5, noGestionados:26, noContesta1:19, noContesta2:8,  enCita:4,  formulario:7,  ventasDias:7,  ventasMes:39, pendientes:1, noContesta:44,  cita:6  },
  { id:'16', pais:'Italia',   nombre:'Alejandro Gil',   ini:'AG', avatar:'', total:44, cr:5.6,  llamadasDia:37, tiempoLlamada:'5m 14s', fresh:10, freshCr:4.8, recuperados:8,  recuperadosCr:6.4,  pausados:5, pausadosCr:4.5, noGestionados:24, noContesta1:17, noContesta2:7,  enCita:5,  formulario:9,  ventasDias:9,  ventasMes:44, pendientes:1, noContesta:38,  cita:8  },
  { id:'17', pais:'Italia',   nombre:'Sofía Navarro',   ini:'SN', avatar:'', total:31, cr:7.2,  llamadasDia:26, tiempoLlamada:'7m 28s', fresh:7,  freshCr:6.1, recuperados:5,  recuperadosCr:8.4,  pausados:3, pausadosCr:6.0, noGestionados:10, noContesta1:8,  noContesta2:3,  enCita:7,  formulario:11, ventasDias:8,  ventasMes:31, pendientes:1,  noContesta:16,  cita:10 },
  { id:'18', pais:'Alemania', nombre:'Tomás Blanco',    ini:'TB', avatar:'', total:37, cr:5.0,  llamadasDia:31, tiempoLlamada:'6m 02s', fresh:8,  freshCr:4.2, recuperados:6,  recuperadosCr:5.8,  pausados:3, pausadosCr:4.1, noGestionados:20, noContesta1:14, noContesta2:6,  enCita:5,  formulario:8,  ventasDias:8,  ventasMes:37, pendientes:1,  noContesta:30,  cita:7  },
  { id:'19', pais:'Alemania', nombre:'Raquel Moreno',   ini:'RM', avatar:'', total:33, cr:6.8,  llamadasDia:27, tiempoLlamada:'7m 05s', fresh:7,  freshCr:5.8, recuperados:5,  recuperadosCr:7.9,  pausados:3, pausadosCr:5.5, noGestionados:11, noContesta1:8,  noContesta2:3,  enCita:7,  formulario:10, ventasDias:9,  ventasMes:33, pendientes:1,  noContesta:18,  cita:9  },
  { id:'20', pais:'Alemania', nombre:'Hugo Castillo',   ini:'HC', avatar:'', total:27, cr:8.1,  llamadasDia:21, tiempoLlamada:'8m 52s', fresh:8,  freshCr:7.0, recuperados:3,  recuperadosCr:9.6,  pausados:2, pausadosCr:7.3, noGestionados:6,  noContesta1:5,  noContesta2:2,  enCita:8,  formulario:12, ventasDias:8,  ventasMes:27, pendientes:1,  noContesta:10,  cita:11 },
]

export const mockEquipoBarras = {
  labels: ['Juan M.','Laura R.','Carlos D.','Ana S.','María P.','Pablo G.','Sara M.','David F.','Elena T.','Roberto V.','Marta L.','Iñaki O.'],
  ventas: [12000,18000,8000,22000,5000,15000,10000,19000,11000,14000,9500,17500],
  meta:   [15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000],
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

// ventas    = hoy (suma agentes en mockRankingPaises)
// ventasMes  = este mes, coincide con mockObjetivosPaises.actual
// leadsActivos = pendientes + noContesta + cita + formulario, coincide con mockLeadsPaises
// ventasTipo = [frescos, recuperados, pausados], suma = ventas hoy
export const mockKpisPaises = [
  {
    pais: 'España', flag: '🇪🇸',
    ventas: 87, ventasMes: 2149,
    cr: 8, crGeneral: 5.8,
    pucr: '42s', tiempo: '6m 12s', mediaFresh: '6,7',
    leadsActivos: 3085,   // 618+856+368+1243
    pendientes: 618, noContesta: 856, cita: 368, formulario: 1243,
    ventasTipo: [38, 28, 21],   // 38+28+21 = 87
    // Jun25→May26 (último mes parcial)
    barVentas: [4200, 4500, 4750, 5100, 4700, 3900, 4600, 4900, 4850, 5210, 4920, 2149], barMeta: 5430,
  },
  {
    pais: 'Francia', flag: '🇫🇷',
    ventas: 32, ventasMes: 749,
    cr: 7, crGeneral: 4.2,
    pucr: '38s', tiempo: '5m 45s', mediaFresh: '5,2',
    leadsActivos: 656,    // 134+192+62+268
    pendientes: 134, noContesta: 192, cita: 62, formulario: 268,
    ventasTipo: [14, 11, 7],    // 14+11+7 = 32
    barVentas: [850, 920, 980, 1050, 980, 800, 960, 1010, 1050, 1120, 980, 749], barMeta: 1245,
  },
  {
    pais: 'Italia', flag: '🇮🇹',
    ventas: 45, ventasMes: 1249,
    cr: 7, crGeneral: 4.9,
    pucr: '35s', tiempo: '5m 58s', mediaFresh: '4,8',
    leadsActivos: 456,    // 96+142+34+184
    pendientes: 96, noContesta: 142, cita: 34, formulario: 184,
    ventasTipo: [20, 15, 10],   // 20+15+10 = 45
    barVentas: [1600, 1700, 1820, 1950, 1800, 1520, 1750, 1880, 1850, 2100, 1920, 1249], barMeta: 2430,
  },
  {
    pais: 'Alemania', flag: '🇩🇪',
    ventas: 3, ventasMes: 119,
    cr: 5, crGeneral: 2.1,
    pucr: '28s', tiempo: '4m 33s', mediaFresh: '3,1',
    leadsActivos: 112,    // 22+32+10+48
    pendientes: 22, noContesta: 32, cita: 10, formulario: 48,
    ventasTipo: [1, 1, 1],      // 1+1+1 = 3
    barVentas: [220, 240, 255, 280, 270, 215, 255, 275, 280, 310, 265, 119], barMeta: 400,
  },
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
      apetito: 'Gourmet',
      esterilizado: 'Si',
      cumplMes: 'Septiembre',
      cumplAno: '2024',
      patologias: [
        { nombre: 'Alergias alimentarias', incompatible: false },
        { nombre: 'Diabetes',            incompatible: false },
        { nombre: 'Insuficiencia renal', incompatible: false },
      ],
    },
    {
      nombre: 'Toby',
      kcalDia: '320 kcal/día',
      gDia: '200g/día',
      plan: 'Plan completo',
      menus: ['Pollo', 'Pavo'],
      sexo: 'Macho',
      raza: 'Chihuahua',
      etapa: 'Adulto',
      edad: '3 años',
      peso: '3kg',
      forma: 'Figurín',
      tipoComida: 'Gourmet',
      nivelActividad: 'normal',
      apetito: 'Glotón',
      esterilizado: 'No',
      cumplMes: 'Mayo',
      cumplAno: '2023',
      patologias: [],
    },
  ],
  fechaEntrega: '27 / 07 / 2022',
  empresaEnvio: 'GLS',
  cuponesAplicados: [],
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
    facturacion: 'María García López',
    direccion: 'Calle de Fuencarral, 43, 2ºA, 28004 Madrid',
    notas: 'Dejar con el portero si no hay nadie',
  },
  historial: [
    { tipo: 'errorPago',    texto: 'Error de pago · Tarjeta · payment_intent_authentication_failure', fecha: '8/6/2026, 15:28' },
    { tipo: 'llamada',      texto: 'Llamada saliente · 4 min 32 s',  fecha: '8/6/2026, 11:05' },
    { tipo: 'comentario',   texto: 'Cliente interesado, pide llamar la semana que viene', fecha: '7/6/2026, 17:42' },
    { tipo: 'whatsapp',     texto: '[mensaje de whatsapp...]',        fecha: '7/6/2026, 10:00', entrante: true  },
    { tipo: 'llamada',      texto: 'Llamada saliente · Sin respuesta', fecha: '6/6/2026, 09:30' },
    { tipo: 'whatsapp',     texto: '[mensaje de whatsapp...]',        fecha: '5/6/2026, 16:20', entrante: false },
    { tipo: 'recordatorio', texto: 'Avisar renovación para lorem ip…', fecha: '4/6/2026, 10:00' },
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
    facturacion: 'María García López',
    direccion: 'Calle de Fuencarral, 43, 2ºA, 28004 Madrid',
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
  { pais: 'España', flag: '🇪🇸', total: 87, agentes: [
    { nombre: 'Carlos Ruiz Martín',      hoy: 10, mes: 58 },
    { nombre: 'Ana García López',         hoy: 9,  mes: 52 },
    { nombre: 'Miguel Fernández Cano',    hoy: 8,  mes: 48 },
    { nombre: 'Laura Sánchez Gil',        hoy: 7,  mes: 45 },
    { nombre: 'Javier Moreno Díaz',       hoy: 7,  mes: 43 },
    { nombre: 'María Torres Vega',        hoy: 7,  mes: 41 },
    { nombre: 'Alejandro Gómez Parra',    hoy: 6,  mes: 38 },
    { nombre: 'Cristina López Herrera',   hoy: 6,  mes: 36 },
    { nombre: 'Pablo Jiménez Reyes',      hoy: 6,  mes: 35 },
    { nombre: 'Elena Castillo Novo',      hoy: 5,  mes: 33 },
    { nombre: 'David Rodríguez Pons',     hoy: 5,  mes: 31 },
    { nombre: 'Sandra Navarro Blanco',    hoy: 4,  mes: 28 },
    { nombre: 'Iván Molina Soto',         hoy: 4,  mes: 24 },
    { nombre: 'Beatriz Serrano Rueda',    hoy: 3,  mes: 18 },
  ]},
  { pais: 'Francia', flag: '🇫🇷', total: 32, agentes: [
    { nombre: 'Pierre Dupont',    hoy: 8, mes: 45 },
    { nombre: 'Camille Martin',   hoy: 6, mes: 38 },
    { nombre: 'Lucas Lefebvre',   hoy: 5, mes: 32 },
    { nombre: 'Sophie Bernard',   hoy: 4, mes: 28 },
    { nombre: 'Antoine Petit',    hoy: 4, mes: 25 },
    { nombre: 'Chloé Dubois',     hoy: 3, mes: 21 },
    { nombre: 'Thomas Moreau',    hoy: 2, mes: 16 },
    { nombre: 'Julie Simon',      hoy: 0, mes:  8 },
  ]},
  { pais: 'Italia', flag: '🇮🇹', total: 45, agentes: [
    { nombre: 'Marco Rossi',          hoy: 7, mes: 52 },
    { nombre: 'Giulia Bianchi',       hoy: 6, mes: 44 },
    { nombre: 'Luca Esposito',        hoy: 6, mes: 38 },
    { nombre: 'Sara Romano',          hoy: 5, mes: 34 },
    { nombre: 'Alessandro Ferrari',   hoy: 5, mes: 30 },
    { nombre: 'Chiara Ricci',         hoy: 5, mes: 27 },
    { nombre: 'Matteo Conti',         hoy: 4, mes: 22 },
    { nombre: 'Francesca Marino',     hoy: 3, mes: 18 },
    { nombre: 'Davide Greco',         hoy: 2, mes: 12 },
    { nombre: 'Valentina Gallo',      hoy: 2, mes:  8 },
  ]},
  { pais: 'Alemania', flag: '🇩🇪', total: 3, agentes: [
    { nombre: 'Thomas Müller',   hoy: 1, mes: 12 },
    { nombre: 'Anna Schmidt',    hoy: 1, mes:  9 },
    { nombre: 'Felix Wagner',    hoy: 1, mes:  7 },
    { nombre: 'Laura Becker',    hoy: 0, mes:  5 },
    { nombre: 'Markus Fischer',  hoy: 0, mes:  3 },
  ]},
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

// ── Búsqueda global — datos realistas ───────────────
export const mockSearchLeads = [
  { id: '1',  nombre: 'María',    apellido: 'García López',     email: 'tumejorcorreo@gmail.com',     telefono: '+34 000 000 000', estado: 'Pendiente',    campana: 'Black Friday 2025', cupon: 'BIENVENIDA10',  codigoAmigo: '' },
  { id: '2',  nombre: 'Carlos',   apellido: 'Martínez Ruiz',    email: 'carlos.martinez@gmail.com',    telefono: '+34 611 234 567', estado: 'En cita',      campana: 'Halloween 2025',    cupon: '',              codigoAmigo: 'AMIGO-CARLOS' },
  { id: '3',  nombre: 'Laura',    apellido: 'Sánchez Pérez',    email: 'laura.sanchez@hotmail.com',    telefono: '+34 622 345 678', estado: 'No contesta',  campana: 'Verano 2025',       cupon: 'AMIGO15',       codigoAmigo: '' },
  { id: '4',  nombre: 'Pablo',    apellido: 'López García',      email: 'pablo.lopez@gmail.com',        telefono: '+34 633 456 789', estado: 'No interesa',  campana: 'Black Friday 2025', cupon: '',              codigoAmigo: '' },
  { id: '5',  nombre: 'Ana',      apellido: 'Torres Vega',      email: 'ana.torres@yahoo.es',          telefono: '+34 644 567 890', estado: 'Formulario',   campana: 'Navidad 2025',      cupon: 'REF-CARLOS',    codigoAmigo: '' },
  { id: '6',  nombre: 'Javier',   apellido: 'Romero Blanco',    email: 'javier.romero@gmail.com',      telefono: '+34 655 678 901', estado: 'Pendiente',    campana: 'Halloween 2025',    cupon: '',              codigoAmigo: 'AMIGO-MARIA' },
  { id: '7',  nombre: 'Sofía',    apellido: 'Navarro Castillo', email: 'sofia.navarro@icloud.com',     telefono: '+34 666 789 012', estado: 'En cita',      campana: 'Black Friday 2025', cupon: 'DESCUENTO20',   codigoAmigo: '' },
  { id: '8',  nombre: 'Miguel',   apellido: 'Jiménez Mora',     email: 'miguel.jimenez@outlook.com',   telefono: '+34 677 890 123', estado: 'No contesta',  campana: 'Verano 2025',       cupon: '',              codigoAmigo: '' },
  { id: '9',  nombre: 'Carmen',   apellido: 'Flores Delgado',   email: 'carmen.flores@gmail.com',      telefono: '+34 688 901 234', estado: 'Venta',        campana: 'Navidad 2025',      cupon: 'NAVIDAD15',     codigoAmigo: 'AMIGO-PABLO' },
  { id: '10', nombre: 'Roberto',  apellido: 'Vega Serrano',     email: 'roberto.vega@hotmail.com',     telefono: '+34 699 012 345', estado: 'Pendiente',    campana: 'Halloween 2025',    cupon: '',              codigoAmigo: '' },
]

export const mockSearchVentas = [
  { id: '1', ventaCode: '7VTA-9281Z', nombre: 'María',   apellido: 'García López',     email: 'tumejorcorreo@gmail.com',   telefono: '+34 000 000 000', campana: 'Black Friday 2025', cupon: 'BIENVENIDA10',  codigoAmigo: '',            fecha: '16/02/2025', importe: '14,78€', plan: 'Prueba' },
  { id: '2', ventaCode: '3VTA-1234A', nombre: 'Carlos',  apellido: 'Martínez Ruiz',    email: 'carlos.martinez@gmail.com', telefono: '+34 611 234 567', campana: 'Halloween 2025',    cupon: '',              codigoAmigo: 'AMIGO-CARLOS', fecha: '05/03/2025', importe: '39,90€', plan: 'Mensualidad' },
  { id: '3', ventaCode: '9VTA-5678B', nombre: 'Laura',   apellido: 'Sánchez Pérez',    email: 'laura.sanchez@hotmail.com', telefono: '+34 622 345 678', campana: 'Verano 2025',       cupon: 'AMIGO15',       codigoAmigo: '',            fecha: '12/03/2025', importe: '49,25€', plan: 'Mensualidad' },
  { id: '4', ventaCode: '5VTA-2345C', nombre: 'Carmen',  apellido: 'Flores Delgado',   email: 'carmen.flores@gmail.com',   telefono: '+34 688 901 234', campana: 'Navidad 2025',      cupon: 'NAVIDAD15',     codigoAmigo: 'AMIGO-PABLO', fecha: '18/03/2025', importe: '14,78€', plan: 'Prueba' },
  { id: '5', ventaCode: '2VTA-6789D', nombre: 'Sofía',   apellido: 'Navarro Castillo', email: 'sofia.navarro@icloud.com',  telefono: '+34 666 789 012', campana: 'Black Friday 2025', cupon: 'DESCUENTO20',   codigoAmigo: '',            fecha: '22/03/2025', importe: '43,72€', plan: 'Mensualidad' },
]
