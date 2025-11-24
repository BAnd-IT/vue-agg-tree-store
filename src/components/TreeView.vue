<template>
    <div class="tree-view">
        <ag-grid-vue style="width: 100%; height: 100%" :columnDefs="colDefs" :rowData="rowData" :treeData="true"
            :getDataPath="getDataPath">
        </ag-grid-vue>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridVue } from "ag-grid-vue3";
import { TreeDataModule } from "ag-grid-enterprise";
import type { TreeStoreItem } from '@/utils/TreeStore';

ModuleRegistry.registerModules([AllCommunityModule, TreeDataModule]);

const rowData = ref<TreeStoreItem[]>([]);

const colDefs = ref<ColDef<TreeStoreItem>[]>([
    {
        headerName: "№ п/п",
        field: "id",
        valueGetter: (params) => {
            return params.node?.rowIndex != null ? params.node.rowIndex + 1 : '';
        }
    },
    {
        headerName: 'Organization',
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
            suppressCount: false,
            checkbox: false,
            innerRenderer: null
        }
    },
    {
        headerName: "Наименование",
        field: "label"
    },
]);

const getDataPath = (data: TreeStoreItem): string[] => {
    
    const path: string[] = [];

    const buildPath = (itemId: string | number | null): void => {
        if (itemId === null) return;

        const item = rowData.value.find(row => row.id === itemId);
        if (item) {
            buildPath(item.parent);
            path.push(item.label);
        }
    };

    buildPath(data.parent);
    path.push(data.label);
    return path;
};

onMounted(() => {
    rowData.value = [
        { id: 1, parent: null, label: 'Айтем 1' },
        { id: '91064cee', parent: 1, label: 'Айтем 2' },
        { id: 3, parent: 1, label: 'Айтем 3' },
        { id: 4, parent: '91064cee', label: 'Айтем 4' },
        { id: 5, parent: '91064cee', label: 'Айтем 5' },
        { id: 6, parent: '91064cee', label: 'Айтем 6' },
        { id: 7, parent: 4, label: 'Айтем 7' },
        { id: 8, parent: 4, label: 'Айтем 8' }
    ];
});
</script>

<style>
.tree-view {
    width: 100%;
    height: 500px;
}
</style>