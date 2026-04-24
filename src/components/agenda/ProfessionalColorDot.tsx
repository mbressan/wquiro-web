interface ProfessionalColorDotProps {
  color: string;
  size?: 'sm' | 'md';
}

export function ProfessionalColorDot({ color, size = 'md' }: ProfessionalColorDotProps) {
  return (
    <span
      className={`inline-block rounded-full ${size === 'sm' ? 'h-2 w-2' : 'h-3 w-3'}`}
      style={{ backgroundColor: color }}
    />
  );
}
