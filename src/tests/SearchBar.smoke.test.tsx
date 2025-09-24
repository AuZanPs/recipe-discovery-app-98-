import { render, screen, act, fireEvent } from '@testing-library/react';
import { SearchBar } from '../components/SearchBar/SearchBar';

jest.useFakeTimers();

describe('SearchBar smoke', () => {
  it('debounces and only fires for >=2 chars (or clear)', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText(/search recipes/i);

  fireEvent.change(input, { target: { value: 'a' } });
    act(() => { jest.advanceTimersByTime(299); });
    expect(onSearch).not.toHaveBeenCalled();

    act(() => { jest.advanceTimersByTime(1); }); // reaches 300ms
    expect(onSearch).not.toHaveBeenCalled(); // still single char

  fireEvent.change(input, { target: { value: 'ab' } });
    act(() => { jest.advanceTimersByTime(300); });
    expect(onSearch).toHaveBeenLastCalledWith('ab');

  fireEvent.change(input, { target: { value: '' } });
    act(() => { jest.advanceTimersByTime(300); });
    expect(onSearch).toHaveBeenLastCalledWith('');
  });
});
