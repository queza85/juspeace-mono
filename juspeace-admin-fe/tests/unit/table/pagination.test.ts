import { describe, expect, it } from 'vitest';
import {
  getPaginationMeta,
  paginateItems,
  toApiOffset,
} from '@/lib/table/pagination';

describe('getPaginationMeta', () => {
  it('returns empty range when total is zero', () => {
    expect(getPaginationMeta({ total: 0, page: 1, pageSize: 8 })).toMatchObject({
      showingFrom: 0,
      showingTo: 0,
      totalPages: 1,
      currentPage: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
  });

  it('clamps page when it exceeds total pages', () => {
    expect(getPaginationMeta({ total: 3, page: 5, pageSize: 8 })).toMatchObject({
      currentPage: 1,
      showingFrom: 1,
      showingTo: 3,
    });
  });

  it('computes middle page range', () => {
    const items = Array.from({ length: 25 }, (_, index) => index + 1);

    expect(getPaginationMeta({ total: items.length, page: 2, pageSize: 8 })).toMatchObject({
      showingFrom: 9,
      showingTo: 16,
      hasPreviousPage: true,
      hasNextPage: true,
    });
  });
});

describe('paginateItems', () => {
  it('slices items for the requested page', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];

    expect(paginateItems(items, 2, 2)).toEqual(['c', 'd']);
  });
});

describe('toApiOffset', () => {
  it('returns zero-based offset for API queries', () => {
    expect(toApiOffset(1, 8)).toBe(0);
    expect(toApiOffset(3, 8)).toBe(16);
  });
});
