import { describe, it, expect, beforeEach } from 'vitest';
import { TreeStore } from '@/utils/TreeStore';
import type { TreeStoreItem } from '@/utils/TreeStore';

const mockItems: TreeStoreItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
];

describe('TreeStore', () => {
  let treeStore: TreeStore;

  beforeEach(() => {
    treeStore = new TreeStore([...mockItems]);
  });

  describe('Constructor', () => {
    it('should initialize with items', () => {
      expect(treeStore.getAll()).toHaveLength(8);
    });

    it('should handle empty array', () => {
      const emptyStore = new TreeStore([]);
      expect(emptyStore.getAll()).toHaveLength(0);
    });
  });

  describe('getAll', () => {
    it('should return all items', () => {
      const allItems = treeStore.getAll();
      expect(allItems).toEqual(mockItems);
      expect(allItems).toHaveLength(8);
    });
  });

  describe('getItem', () => {
    it('should return item by id', () => {
      const item = treeStore.getItem(1);
      expect(item).toEqual({ id: 1, parent: null, label: 'Айтем 1' });
    });

    it('should return item by string id', () => {
      const item = treeStore.getItem('91064cee');
      expect(item).toEqual({ id: '91064cee', parent: 1, label: 'Айтем 2' });
    });

    it('should return undefined for non-existent id', () => {
      const item = treeStore.getItem(999);
      expect(item).toBeUndefined();
    });
  });

  describe('getChildren', () => {
    it('should return direct children for parent', () => {
      const children = treeStore.getChildren(1);
      expect(children).toHaveLength(2);
      expect(children.map((c) => c.id)).toEqual(['91064cee', 3]);
    });

    it('should return direct children for string parent id', () => {
      const children = treeStore.getChildren('91064cee');
      expect(children).toHaveLength(3);
      expect(children.map((c) => c.id)).toEqual([4, 5, 6]);
    });

    it('should return empty array for item without children', () => {
      const children = treeStore.getChildren(3);
      expect(children).toHaveLength(0);
    });

    it('should return empty array for non-existent parent', () => {
      const children = treeStore.getChildren(999);
      expect(children).toHaveLength(0);
    });
  });

  describe('getAllChildren', () => {
    it('should return all nested children for parent', () => {
      const allChildren = treeStore.getAllChildren(1);
      expect(allChildren).toHaveLength(7);
      expect(allChildren.map((c) => c.id)).toEqual(['91064cee', 3, 4, 5, 6, 7, 8]);
    });

    it('should return all nested children for intermediate parent', () => {
      const allChildren = treeStore.getAllChildren('91064cee');
      expect(allChildren).toHaveLength(5);
      expect(allChildren.map((c) => c.id)).toEqual([4, 5, 6, 7, 8]);
    });

    it('should return empty array for leaf node', () => {
      const allChildren = treeStore.getAllChildren(7);
      expect(allChildren).toHaveLength(0);
    });
  });

  describe('getAllParents', () => {
    it('should return all parents including self for leaf node', () => {
      const parents = treeStore.getAllParents(7);
      expect(parents).toHaveLength(4);
      expect(parents.map((p) => p.id)).toEqual([7, 4, '91064cee', 1]);
    });

    it('should return all parents including self for intermediate node', () => {
      const parents = treeStore.getAllParents('91064cee');
      expect(parents).toHaveLength(2);
      expect(parents.map((p) => p.id)).toEqual(['91064cee', 1]);
    });

    it('should return only self for root node', () => {
      const parents = treeStore.getAllParents(1);
      expect(parents).toHaveLength(1);
      expect(parents[0].id).toBe(1);
    });

    it('should return empty array for non-existent item', () => {
      const parents = treeStore.getAllParents(999);
      expect(parents).toHaveLength(0);
    });
  });

  describe('addItem', () => {
    it('should add new root item', () => {
      const newItem: TreeStoreItem = { id: 9, parent: null, label: 'Новый корень' };
      treeStore.addItem(newItem);

      expect(treeStore.getAll()).toHaveLength(9);
      expect(treeStore.getItem(9)).toEqual(newItem);
    });

    it('should add new child item', () => {
      const newItem: TreeStoreItem = { id: 9, parent: 1, label: 'Новый ребенок' };
      treeStore.addItem(newItem);

      expect(treeStore.getAll()).toHaveLength(9);
      expect(treeStore.getChildren(1)).toHaveLength(3);
      expect(treeStore.getItem(9)).toEqual(newItem);
    });

    it('should throw error when adding item with existing id', () => {
      const duplicateItem: TreeStoreItem = { id: 1, parent: null, label: 'Дубликат' };

      expect(() => {
        treeStore.addItem(duplicateItem);
      }).toThrow('Item with id 1 already exists');
    });

    it('should throw error when parent does not exist', () => {
      const orphanItem: TreeStoreItem = { id: 9, parent: 999, label: 'Сирота' };

      expect(() => {
        treeStore.addItem(orphanItem);
      }).toThrow('Parent with id 999 does not exist');
    });
  });

  describe('removeItem', () => {
    it('should remove leaf item', () => {
      treeStore.removeItem(7);

      expect(treeStore.getItem(7)).toBeUndefined();
      expect(treeStore.getAll()).toHaveLength(7);
      expect(treeStore.getChildren(4)).toHaveLength(1);
    });

    it('should remove item with children', () => {
      treeStore.removeItem('91064cee');

      expect(treeStore.getItem('91064cee')).toBeUndefined();
      expect(treeStore.getItem(4)).toBeUndefined();
      expect(treeStore.getItem(5)).toBeUndefined();
      expect(treeStore.getItem(6)).toBeUndefined();
      expect(treeStore.getItem(7)).toBeUndefined();
      expect(treeStore.getItem(8)).toBeUndefined();
      expect(treeStore.getAll()).toHaveLength(2);
    });

    it('should handle removing non-existent item', () => {
      expect(() => {
        treeStore.removeItem(999);
      }).not.toThrow();

      expect(treeStore.getAll()).toHaveLength(8);
    });

    it('should update parent children after removal', () => {
      treeStore.removeItem('91064cee');

      const childrenOf1 = treeStore.getChildren(1);
      expect(childrenOf1).toHaveLength(1);
      expect(childrenOf1[0].id).toBe(3);
    });
  });

  describe('updateItem', () => {
    it('should update item properties', () => {
      const updatedItem: TreeStoreItem = { id: 1, parent: null, label: 'Обновленный Айтем 1' };
      treeStore.updateItem(updatedItem);

      expect(treeStore.getItem(1)).toEqual(updatedItem);
      expect(treeStore.getAll()).toHaveLength(8);
    });

    it('should update parent relationship', () => {
      const updatedItem: TreeStoreItem = { id: 3, parent: '91064cee', label: 'Айтем 3 перемещен' };
      treeStore.updateItem(updatedItem);

      expect(treeStore.getChildren(1)).toHaveLength(1);
      expect(treeStore.getChildren('91064cee')).toHaveLength(4);
      expect(treeStore.getItem(3).parent).toBe('91064cee');
    });

    it('should throw error when updating non-existent item', () => {
      const nonExistentItem: TreeStoreItem = { id: 999, parent: null, label: 'Не существует' };

      expect(() => {
        treeStore.updateItem(nonExistentItem);
      }).toThrow('Item with id 999 does not exist');
    });

    it('should throw error when moving to non-existent parent', () => {
      const itemWithBadParent: TreeStoreItem = { id: 1, parent: 999, label: 'Айтем 10' };

      expect(() => {
        treeStore.updateItem(itemWithBadParent);
      }).toThrow('Parent with id 999 does not exist');
    });
  });

  describe('Edge cases', () => {
    it('should handle mixed string and number ids correctly', () => {
      const mixedItems: TreeStoreItem[] = [
        { id: '1', parent: null, label: 'Строковый ID' },
        { id: 2, parent: '1', label: 'Числовой ID' },
      ];

      const mixedStore = new TreeStore(mixedItems);

      expect(mixedStore.getItem('1')).toBeDefined();
      expect(mixedStore.getItem(2)).toBeDefined();
      expect(mixedStore.getChildren('1')).toHaveLength(1);
    });

    it('should handle circular reference prevention', () => {
      const simpleItems: TreeStoreItem[] = [
        { id: 1, parent: null, label: 'Айтем 1' },
        { id: 2, parent: 1, label: 'Айтем 2' },
        { id: 3, parent: 2, label: 'Айтем 3' },
      ];

      const simpleStore = new TreeStore(simpleItems);

      expect(() => {
        simpleStore.updateItem({ id: 1, parent: 3, label: 'Айтем 1' });
      }).toThrow('Circular reference detected');
    });

    it('should prevent self-reference', () => {
      const items: TreeStoreItem[] = [{ id: 1, parent: null, label: 'Item 1' }];

      const store = new TreeStore(items);

      expect(() => {
        store.updateItem({ id: 1, parent: 1, label: 'Айтем 1' });
      }).toThrow('Circular reference detected');
    });

    it('should prevent direct circular reference', () => {
      const items: TreeStoreItem[] = [
        { id: 1, parent: null, label: 'Item 1' },
        { id: 2, parent: 1, label: 'Item 2' },
      ];

      const store = new TreeStore(items);

      expect(() => {
        store.updateItem({ id: 1, parent: 2, label: 'Айтем 1' });
      }).toThrow('Circular reference detected');
    });
  });
});
