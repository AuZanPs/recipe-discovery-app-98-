import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeDetailModal } from '../components/RecipeDetailModal/RecipeDetailModal';
import { ProcessedMeal } from '../types/recipe';

const baseMeal: ProcessedMeal = {
  id: '1',
  name: 'Test Meal',
  category: 'Cat',
  area: 'Area',
  thumbnail: 'http://example.com/img.jpg',
  instructions: 'Line 1\nLine 2',
  tags: [],
  youtube: undefined,
  source: undefined,
  ingredients: [
    { name: 'Sugar', measure: '1 tsp' },
    { name: 'Flour', measure: '2 cups' },
  ],
};

describe('RecipeDetailModal smoke', () => {
  it('closes on Escape', async () => {
    const onClose = jest.fn();
    render(<RecipeDetailModal meal={baseMeal} onClose={onClose} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders ingredient rows', () => {
    const onClose = jest.fn();
    render(<RecipeDetailModal meal={baseMeal} onClose={onClose} />);
    expect(screen.getByText('Sugar')).toBeInTheDocument();
    expect(screen.getByText('Flour')).toBeInTheDocument();
  });
});
