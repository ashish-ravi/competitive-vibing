import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string | null | undefined;
  image: string | null | undefined;
  size?: number;
  className?: string;
}

export function initialsOf(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase() || '?';
}

/** Google avatar when present; otherwise a branded initials tile. */
export function UserAvatar({ name, image, size = 32, className }: UserAvatarProps) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? 'Your avatar'}
        width={size}
        height={size}
        className={cn('rounded-full', className)}
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.38)) }}
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-glow font-mono font-semibold text-white',
        className
      )}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  );
}
