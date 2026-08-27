import { describe, expect, it } from 'vitest';
import { cycleTableSort } from '@/lib/table/sort';

describe('cycleTableSort', () => {
  it('starts at descending when a column is first selected', () => {
    expect(cycleTableSort(null, 'price')).toEqual({
      column: 'price',
      direction: 'desc',
    });
  });

  it('switches to ascending on the second click of the same column', () => {
    expect(
      cycleTableSort({ column: 'price', direction: 'desc' }, 'price'),
    ).toEqual({
      column: 'price',
      direction: 'asc',
    });
  });

  it('clears sort on the third click of the same column', () => {
    expect(
      cycleTableSort({ column: 'price', direction: 'asc' }, 'price'),
    ).toBeNull();
  });

  it('starts descending when switching to another column', () => {
    expect(
      cycleTableSort({ column: 'price', direction: 'asc' }, 'stock'),
    ).toEqual({
      column: 'stock',
      direction: 'desc',
    });
  });
});
