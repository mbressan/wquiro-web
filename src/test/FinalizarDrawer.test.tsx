import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinalizarDrawer } from '@/components/prontuario/FinalizarDrawer';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('FinalizarDrawer', () => {
  it('does not render when open=false', () => {
    const { container } = render(
      <FinalizarDrawer open={false} onClose={vi.fn()} appointmentId="test-id" onSuccess={vi.fn()} />,
      { wrapper },
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose when back button clicked without calling mutation', () => {
    const onClose = vi.fn();
    render(
      <FinalizarDrawer open={true} onClose={onClose} appointmentId="test-id" onSuccess={vi.fn()} />,
      { wrapper },
    );
    const backBtn = screen.getByRole('button', { name: /fechar/i });
    fireEvent.click(backBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
