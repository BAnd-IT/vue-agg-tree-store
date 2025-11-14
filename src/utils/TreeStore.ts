export interface TreeStoreItem {
  id: string | number;
  parent: string | number | null;
  label: string;
  [key: string]: unknown;
}

export class TreeStore {
  private items: Map<string | number, TreeStoreItem>;
  private childrenMap: Map<string | number, TreeStoreItem[]>;

  constructor(items: TreeStoreItem[]) {
    this.items = new Map();
    this.childrenMap = new Map();

    this.initialize(items);
  }

  private initialize(items: TreeStoreItem[]): void {
    items.forEach((item) => {
      this.items.set(item.id, item);
    });

    this.childrenMap.clear();
    items.forEach((item) => {
      if (item.parent !== null) {
        const parentId = item.parent;
        if (!this.childrenMap.has(parentId)) {
          this.childrenMap.set(parentId, []);
        }
        this.childrenMap.get(parentId)!.push(item);
      }
    });
  }

  getAll(): TreeStoreItem[] {
    return Array.from(this.items.values());
  }

  getItem(id: string | number): TreeStoreItem | undefined {
    return this.items.get(id);
  }

  getChildren(id: string | number): TreeStoreItem[] {
    return this.childrenMap.get(id) || [];
  }

  getAllChildren(id: string | number): TreeStoreItem[] {
    const items: TreeStoreItem[] = [];
    const queue: TreeStoreItem[] = [...this.getChildren(id)];

    while (queue.length > 0) {
      const current = queue.shift()!;
      items.push(current);

      const children = this.getChildren(current.id);
      queue.push(...children);
    }

    return items;
  }

  getAllParents(id: string | number): TreeStoreItem[] {
    const parents: TreeStoreItem[] = [];
    let current = this.getItem(id);

    if (!current) {
      return parents;
    }

    parents.push(current);

    while (current.parent !== null) {
      const parent = this.getItem(current.parent);

      if (!parent) {
        break;
      }

      parents.push(parent);
      current = parent;
    }

    return parents;
  }

  private wouldCreateCircularReference(
    itemId: string | number,
    newParentId: string | number,
  ): boolean {
    if (itemId === newParentId) {
      return true;
    }

    const allChildren = this.getAllChildren(itemId);
    return allChildren.some((child) => child.id === newParentId);
  }

  addItem(item: TreeStoreItem): void {
    if (this.items.has(item.id)) {
      throw new Error(`Item with id ${item.id} already exists`);
    }

    if (item.parent !== null && !this.items.has(item.parent)) {
      throw new Error(`Parent with id ${item.parent} does not exist`);
    }

    if (item.parent !== null && this.wouldCreateCircularReference(item.id, item.parent)) {
      throw new Error('Circular reference detected');
    }

    this.items.set(item.id, { ...item });

    if (item.parent !== null) {
      const parentId = item.parent;
      if (!this.childrenMap.has(parentId)) {
        this.childrenMap.set(parentId, []);
      }
      this.childrenMap.get(parentId)!.push(item);
    }
  }

  removeItem(id: string | number): void {
    const item = this.getItem(id);
    if (!item) {
      return;
    }

    const allChildren = this.getAllChildren(id);

    allChildren.forEach((child) => {
      this.items.delete(child.id);
      this.childrenMap.delete(child.id);
    });

    this.items.delete(id);
    this.childrenMap.delete(id);

    if (item.parent !== null) {
      const parentChildren = this.childrenMap.get(item.parent);
      if (parentChildren) {
        const index = parentChildren.findIndex((child) => child.id === id);
        if (index !== -1) {
          parentChildren.splice(index, 1);
        }
      }
    }
  }

  updateItem(updatedItem: TreeStoreItem): void {
    const existingItem = this.getItem(updatedItem.id);
    if (!existingItem) {
      throw new Error(`Item with id ${updatedItem.id} does not exist`);
    }

    if (updatedItem.parent !== null && !this.items.has(updatedItem.parent)) {
      throw new Error(`Parent with id ${updatedItem.parent} does not exist`);
    }

    if (
      updatedItem.parent !== null &&
      this.wouldCreateCircularReference(updatedItem.id, updatedItem.parent)
    ) {
      throw new Error('Circular reference detected');
    }

    if (existingItem.parent !== updatedItem.parent) {
      if (existingItem.parent !== null) {
        const oldParentChildren = this.childrenMap.get(existingItem.parent);
        if (oldParentChildren) {
          const index = oldParentChildren.findIndex((child) => child.id === updatedItem.id);
          if (index !== -1) {
            oldParentChildren.splice(index, 1);
          }
        }
      }

      if (updatedItem.parent !== null) {
        if (!this.childrenMap.has(updatedItem.parent)) {
          this.childrenMap.set(updatedItem.parent, []);
        }
        this.childrenMap.get(updatedItem.parent)!.push(updatedItem);
      }
    }

    this.items.set(updatedItem.id, updatedItem);
  }
}
