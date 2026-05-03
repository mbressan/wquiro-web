import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { ProntuarioLayout } from '@/layouts/ProntuarioLayout'
import { SkeletonPage } from '@/components/ui'

const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const PacientesListPage = lazy(() => import('@/pages/pacientes/PacientesListPage'))
const PacienteDetalhePage = lazy(() => import('@/pages/pacientes/PacienteDetalhePage'))
const AgendaPage = lazy(() => import('@/pages/agenda/AgendaPage'))
const ProntuarioPage = lazy(() => import('@/pages/prontuario/ProntuarioPage'))
const PatientProntuarioPage = lazy(() => import('@/pages/prontuario/PatientProntuarioPage'))
const PatientConsultasPage = lazy(() => import('@/pages/pacientes/PatientConsultasPage'))
const CaixaPage = lazy(() => import('@/pages/financeiro/CaixaPage'))
const FinanceiroDashboardPage = lazy(() => import('@/pages/financeiro/FinanceiroDashboardPage'))
const ProfissionaisPage = lazy(() => import('@/pages/profissionais/ProfissionaisPage'))
const PosturalHistoricoPage = lazy(() => import('@/pages/prontuario/PosturalHistoricoPage'))
const ConfiguracoesPage = lazy(() => import('@/pages/configuracoes/ConfiguracoesPage'))
const WhatsAppConfigPage = lazy(() => import('@/pages/configuracoes/WhatsAppConfigPage'))
const RelatoriosPage = lazy(() => import('@/pages/relatorios/RelatoriosPage'))

const Loading = () => <SkeletonPage />

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: (
          <Suspense fallback={<Loading />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: '/register',
        element: (
          <Suspense fallback={<Loading />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <Suspense fallback={<Loading />}>
            <ForgotPasswordPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/',
            handle: { title: 'Dashboard' },
            element: (
              <Suspense fallback={<Loading />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/pacientes',
            handle: { title: 'Pacientes' },
            element: (
              <Suspense fallback={<Loading />}>
                <PacientesListPage />
              </Suspense>
            ),
          },
          {
            path: '/pacientes/:id',
            handle: { title: 'Paciente' },
            element: (
              <Suspense fallback={<Loading />}>
                <PacienteDetalhePage />
              </Suspense>
            ),
          },
          {
            path: '/agenda',
            handle: { title: 'Agenda' },
            element: (
              <Suspense fallback={<Loading />}>
                <AgendaPage />
              </Suspense>
            ),
          },
          {
            path: '/pacientes/:patientId/consultas',
            handle: { title: 'Consultas' },
            element: (
              <Suspense fallback={<Loading />}>
                <PatientConsultasPage />
              </Suspense>
            ),
          },
          {
            path: '/financeiro/caixa',
            handle: { title: 'Caixa' },
            element: (
              <Suspense fallback={<Loading />}>
                <CaixaPage />
              </Suspense>
            ),
          },
          {
            path: '/financeiro/dashboard',
            handle: { title: 'Financeiro' },
            element: (
              <Suspense fallback={<Loading />}>
                <FinanceiroDashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/profissionais',
            handle: { title: 'Profissionais' },
            element: (
              <Suspense fallback={<Loading />}>
                <ProfissionaisPage />
              </Suspense>
            ),
          },
          {
            path: '/pacientes/:patientId/postural',
            handle: { title: 'Histórico Postural' },
            element: (
              <Suspense fallback={<Loading />}>
                <PosturalHistoricoPage />
              </Suspense>
            ),
          },
          {
            path: '/configuracoes',
            handle: { title: 'Configurações' },
            element: (
              <Suspense fallback={<Loading />}>
                <ConfiguracoesPage />
              </Suspense>
            ),
          },
          {
            path: '/configuracoes/whatsapp',
            handle: { title: 'WhatsApp' },
            element: (
              <Suspense fallback={<Loading />}>
                <WhatsAppConfigPage />
              </Suspense>
            ),
          },
          {
            path: '/relatorios',
            handle: { title: 'Relatórios' },
            element: (
              <Suspense fallback={<Loading />}>
                <RelatoriosPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        element: <ProntuarioLayout />,
        children: [
          {
            path: '/prontuario/:id',
            handle: { title: 'Prontuário' },
            element: (
              <Suspense fallback={<Loading />}>
                <ProntuarioPage />
              </Suspense>
            ),
          },
          {
            path: '/pacientes/:patientId/prontuario',
            handle: { title: 'Prontuários' },
            element: (
              <Suspense fallback={<Loading />}>
                <PatientProntuarioPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
])

