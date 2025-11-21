"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Plus, FolderPlus, Pencil, Trash2 } from "lucide-react";

type DocNode = { id: string; type: "doc" | "folder"; name: string; children?: DocNode[] };

function useDocStore() {
  const [tree, setTree] = React.useState<DocNode[]>([]);
  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem("dms-tree");
      if (raw) setTree(JSON.parse(raw));
    } catch {}
  }, []);
  React.useEffect(() => {
    try {
      window.localStorage.setItem("dms-tree", JSON.stringify(tree));
    } catch {}
  }, [tree]);
  const addDoc = (parentId?: string) => setTree((prev) => insertNode(prev, parentId, { id: crypto.randomUUID(), type: "doc", name: "Untitled" }));
  const addFolder = (parentId?: string) => setTree((prev) => insertNode(prev, parentId, { id: crypto.randomUUID(), type: "folder", name: "New Folder", children: [] }));
  const renameNode = (id: string, name: string) => setTree((prev) => mapTree(prev, (n) => (n.id === id ? { ...n, name } : n)));
  const deleteNode = (id: string) => setTree((prev) => filterTree(prev, (n) => n.id !== id));
  return { tree, addDoc, addFolder, renameNode, deleteNode } as const;
}

function insertNode(tree: DocNode[], parentId: string | undefined, node: DocNode): DocNode[] {
  if (!parentId) return [...tree, node];
  return mapTree(tree, (n) => (n.id === parentId ? { ...n, children: [...(n.children ?? []), node] } : n));
}
function mapTree(tree: DocNode[], fn: (n: DocNode) => DocNode): DocNode[] {
  return tree.map((n) => ({ ...fn(n), children: n.children ? mapTree(n.children, fn) : undefined }));
}
function filterTree(tree: DocNode[], pred: (n: DocNode) => boolean): DocNode[] {
  return tree.map((n) => ({ ...n, children: n.children ? filterTree(n.children, pred) : undefined })).filter(pred);
}

export function DmsLeftNav({ className }: { className?: string }) {
  const { tree, addDoc, addFolder, renameNode, deleteNode } = useDocStore();
  const [selected, setSelected] = React.useState<string | null>(null);
  const [renaming, setRenaming] = React.useState<string | null>(null);

  const onRename = (id: string, name: string) => {
    renameNode(id, name.trim() || "Untitled");
    setRenaming(null);
  };

  const renderNode = (node: DocNode) => (
    <div key={node.id} className="pl-2">
      <div className={cn("group flex items-center justify-between rounded px-2 py-1 cursor-pointer", selected === node.id ? "bg-muted" : "hover:bg-muted/50")} onClick={() => setSelected(node.id)}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {renaming === node.id ? (
              <input autoFocus defaultValue={node.name} onBlur={(e) => onRename(node.id, e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onRename(node.id, (e.target as HTMLInputElement).value); if (e.key === "Escape") setRenaming(null); }} className="rounded border border-border bg-background text-foreground px-2 py-1 text-sm" />
            ) : (
              node.name
            )}
          </span>
        </div>
        <div className="invisible group-hover:visible flex items-center gap-1">
          <button className="p-1 rounded hover:bg-muted" onClick={() => setRenaming(node.id)} aria-label="Rename"><Pencil className="w-4 h-4" /></button>
          <button className="p-1 rounded hover:bg-muted" onClick={() => { if (confirm("Delete?")) deleteNode(node.id); }} aria-label="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
      {node.type === "folder" && node.children && node.children.length > 0 && (<div className="pl-3 border-l border-border/40 ml-2">{node.children.map(renderNode)}</div>)}
    </div>
  );

  return (
    <aside className={cn("flex flex-col w-64 border-r border-border bg-card/50", className)}>
      <div className="p-2 border-b flex items-center gap-2">
        <button className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => addDoc()}><Plus className="w-3 h-3" /> New Document</button>
        <button className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => addFolder()}><FolderPlus className="w-3 h-3" /> New Folder</button>
      </div>
      <div className="p-2 overflow-y-auto">
        {tree.length === 0 ? <p className="text-xs text-muted-foreground">No documents yet</p> : tree.map(renderNode)}
      </div>
    </aside>
  );
}