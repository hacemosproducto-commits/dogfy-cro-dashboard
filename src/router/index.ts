import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: () => import('@/views/DashboardView.vue'), name: 'dashboard' },
    { path: '/leads', component: () => import('@/views/LeadsView.vue'), name: 'leads' },
    { path: '/leads/:id', component: () => import('@/views/PerfilLeadView.vue'), name: 'perfil-lead' },
    { path: '/ventas', component: () => import('@/views/VentasView.vue'), name: 'ventas' },
    { path: '/ventas/:id', component: () => import('@/views/PerfilVentaView.vue'), name: 'perfil-venta' },
    { path: '/calendario', component: () => import('@/views/CalendarioView.vue'), name: 'calendario' },
    { path: '/errores-pago', component: () => import('@/views/ErroresPagoView.vue'), name: 'errores-pago' },
    { path: '/agentes', component: () => import('@/views/AgentesView.vue'), name: 'agentes' },
    { path: '/agentes/:id', component: () => import('@/views/DetalleAgenteView.vue'), name: 'detalle-agente' },
    { path: '/exportaciones', component: () => import('@/views/ExportacionesView.vue'), name: 'exportaciones' },
    { path: '/notificaciones', component: () => import('@/views/NotificacionesView.vue'), name: 'notificaciones' },
    { path: '/configuracion', component: () => import('@/views/ConfiguracionView.vue'), name: 'configuracion' },
    { path: '/buscar', component: () => import('@/views/BuscarView.vue'), name: 'buscar' },
  ]
})

export default router
