import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { X } from 'lucide-react';
import { useEffect } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  const base = 'btn';
  const variants: Record<Variant, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn bg-success-500 text-white hover:bg-success-600',
  };
  const sizes: Record<Size, string> = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-3.5 py-2',
    lg: 'text-base px-5 py-2.5',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Card({ children, className = '', hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>{children}</div>;
}

export function Badge({ children, color = 'slate', className = '' }: { children: ReactNode; color?: 'slate' | 'blue' | 'green' | 'amber' | 'red' | 'navy'; className?: string }) {
  const colors = {
    slate: 'bg-cloud-100 text-cloud-700',
    blue: 'bg-brand-50 text-brand-700',
    green: 'bg-success-50 text-success-700',
    amber: 'bg-warning-50 text-warning-700',
    red: 'bg-danger-50 text-danger-700',
    navy: 'bg-navy-100 text-navy-700',
  };
  return <span className={`chip ${colors[color]} ${className}`}>{children}</span>;
}

export function Modal({
  open, onClose, title, children, footer, size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-900/50 backdrop-blur-sm p-4 sm:p-6 animate-fadeIn">
      <div className={`card w-full ${sizes[size]} my-8 animate-slideUp`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-cloud-200 px-5 py-4">
          <h2 className="text-base font-semibold text-navy-800">{title}</h2>
          <button onClick={onClose} className="text-cloud-500 hover:text-navy-700 rounded-lg p-1 hover:bg-cloud-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-cloud-200 px-5 py-4 bg-cloud-50/50 rounded-b-xl">{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-3 text-cloud-400">{icon}</div>}
      <p className="text-sm font-medium text-navy-700">{title}</p>
      {description && <p className="mt-1 text-sm text-cloud-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-cloud-300 border-t-brand-500 ${className}`} style={{ width: '1em', height: '1em' }} />
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-cloud-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
