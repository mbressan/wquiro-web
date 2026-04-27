import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'

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

const Loading = () => <div>Carregando...</div>

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
            element: (
              <Suspense fallback={<Loading />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/pacientes',
            element: (
              <Suspense fallback={<Loading />}>
                <PacientesListPage />
              </Suspense>
            ),
          },
          {
            path: '/pacientes/:id',
            element: (
              <Suspense fallback={<Loading />}>
                <PacienteDetalhePage />
              </Suspense>
            ),
          },
          {
            path: '/agenda',
            element: (
              <Suspense fallback={<Loading />}>
                <AgendaPage />
              </Suspense>
            ),
          },
          {
            path: '/pacientes/:patientId/consultas',
            element: (
              <Suspense fallback={<Loading />}>
                <PatientConsultasPage />
              </Suspense>
            ),
          },
          {
            path: '/pacientes/:patientId/prontuario',
            element: (
              <Suspense fallback={<Loading />}>
                <PatientProntuarioPage />
              </Suspense>
            ),
          },
          {
            path: '/prontuario/:id',
            element: (
              <Suspense fallback={<Loading />}>
                <ProntuarioPage />
              </Suspense>
            ),
          },
          {
            path: '/financeiro/caixa',
            element: (
              <Suspense fallback={<Loading />}>
                <CaixaPage />
              </Suspense>
            ),
          },
          {
            path: '/financeiro/dashboard',
            element: (
              <Suspense fallback={<Loading />}>
                <FinanceiroDashboardPage />
              </Suspense>
            ),
          },
          {
            path: '/profissionais',
            element: (
              <Suspense fallback={<Loading />}>
                <ProfissionaisPage />
              </Suspense>
            ),
          },
          {
            path: '/pacientes/:patientId/postural',
            element: (
              <Suspense fallback={<Loading />}>
                <PosturalHistoricoPage />
              </Suspense>
            ),
          },
          {
            path: '/configuracoes',
            element: (
              <Suspense fallback={<Loading />}>
                <ConfiguracoesPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
])

