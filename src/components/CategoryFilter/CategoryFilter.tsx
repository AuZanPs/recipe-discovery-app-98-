import type { Category } from '../../types/recipe';

interface Props {
  categories: Category[] | undefined;
  value?: string;
  onChange: (value: string | undefined) => void;
}

export const CategoryFilter = ({ categories, value, onChange }: Props) => {
  return (
    <div style={{ minWidth: '160px' }}>
      <label htmlFor="categorySelect" style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Category</label>
      <select
        id="categorySelect"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        style={{ width: '100%' }}
      >
        <option value="">-- All / None --</option>
        {categories?.map(c => (
          <option key={c.idCategory} value={c.strCategory}>{c.strCategory}</option>
        ))}
      </select>
    </div>
  );
};
