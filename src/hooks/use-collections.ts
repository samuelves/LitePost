import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { CollectionItem } from "../types";

const generateId = () =>
  `id-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

export function useCollections() {
  const [data, setData] = useState<CollectionItem[]>([]);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    invoke<string>("load_data")
      .then((json) => setData(JSON.parse(json)))
      .catch(console.error);
  }, []);

  const saveToDisk = async (newData: CollectionItem[]) => {
    try {
      setSaveStatus("Saving...");
      await invoke("save_data", { data: JSON.stringify(newData) });
      setSaveStatus("Saved!");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus("Error");
    }
  };

  const createItem = (
    parentId: string | null,
    type: "folder" | "request",
    name: string,
  ) => {
    const newItem: CollectionItem =
      type === "folder"
        ? { id: generateId(), type, name, isOpen: true, children: [] }
        : {
            id: generateId(),
            type,
            name,
            method: "GET",
            url: "",
            body: "",
            queryParams: [],
            headers: [],
            auth: { type: "none" },
          };

    const addRecursive = (items: CollectionItem[]): CollectionItem[] => {
      if (!parentId) return [...items, newItem];
      return items.map((item) => {
        if (item.id === parentId && item.type === "folder") {
          return {
            ...item,
            isOpen: true,
            children: [...(item.children || []), newItem],
          };
        }
        if (item.children)
          return { ...item, children: addRecursive(item.children) };
        return item;
      });
    };

    const newData = addRecursive(data);
    setData(newData);
    saveToDisk(newData);
    return newItem;
  };

  const renameItem = (id: string, newName: string) => {
    const renameRecursive = (items: CollectionItem[]): CollectionItem[] =>
      items.map((item) => {
        if (item.id === id) return { ...item, name: newName };
        if (item.children)
          return { ...item, children: renameRecursive(item.children) };
        return item;
      });
    const newData = renameRecursive(data);
    setData(newData);
    saveToDisk(newData);
  };

  const deleteItem = (id: string) => {
    const deleteRecursive = (items: CollectionItem[]): CollectionItem[] =>
      items
        .filter((i) => i.id !== id)
        .map((i) => {
          if (i.children)
            return { ...i, children: deleteRecursive(i.children) };
          return i;
        });
    const newData = deleteRecursive(data);
    setData(newData);
    saveToDisk(newData);
  };

  const updateRequest = (id: string, requestData: Partial<CollectionItem>) => {
    const updateRecursive = (items: CollectionItem[]): CollectionItem[] =>
      items.map((item) => {
        if (item.id === id) return { ...item, ...requestData };
        if (item.children)
          return { ...item, children: updateRecursive(item.children) };
        return item;
      });
    const newData = updateRecursive(data);
    setData(newData);
    saveToDisk(newData);
  };

  const toggleFolder = (id: string) => {
    const toggleRecursive = (items: CollectionItem[]): CollectionItem[] =>
      items.map((item) => {
        if (item.id === id) return { ...item, isOpen: !item.isOpen };
        if (item.children)
          return { ...item, children: toggleRecursive(item.children) };
        return item;
      });
    setData(toggleRecursive(data));
  };

  return {
    data,
    saveStatus,
    createItem,
    renameItem,
    deleteItem,
    updateRequest,
    toggleFolder,
  };
}
