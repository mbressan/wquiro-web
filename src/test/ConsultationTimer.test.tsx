import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConsultationTimer } from '@/components/agenda/ConsultationTimer';

describe('ConsultationTimer', () => {
  it('renders fallback when startedAt is null and fallback is provided', () => {
    render(<ConsultationTimer startedAt={null} fallback="00:00:00" />);
    expect(screen.getByText('00:00:00')).toBeDefined();
  });

  it('renders null when startedAt is null and no fallback', () => {
    const { container } = render(<ConsultationTimer startedAt={null} />);
    expect(container.firstChild).toBeNull();
  });
});
