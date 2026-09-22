import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'bg-white text-text-primary border border-border hover:bg-bg-secondary',
  danger: 'bg-white text-danger border border-danger hover:bg-danger-bg',
}

export default function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
