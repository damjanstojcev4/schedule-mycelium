interface CategoryPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function CategoryPill({ label, active, onClick }: CategoryPillProps) {
  return (
    <button
      type="button"
      id={`category-pill-${label.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={[
        'whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
        active
          ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
