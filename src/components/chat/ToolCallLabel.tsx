"use client";

import { Loader2 } from "lucide-react";

function getFileName(filePath: string): string {
  const parts = filePath.split("/");
  return parts[parts.length - 1] || filePath;
}

export function getToolCallLabel(
  toolName: string,
  args: Record<string, unknown>
): string {
  const path =
    typeof args?.path === "string" ? getFileName(args.path) : "";

  if (toolName === "str_replace_editor") {
    const command = args?.command as string | undefined;
    switch (command) {
      case "create":
        return path ? `Creating ${path}` : "Creating file";
      case "str_replace":
      case "insert":
        return path ? `Editing ${path}` : "Editing file";
      case "view":
        return path ? `Viewing ${path}` : "Viewing file";
      case "undo_edit":
        return path ? `Undoing edit to ${path}` : "Undoing edit";
      default:
        if (path) return `Editing ${path}`;
        return "str_replace_editor";
    }
  }

  if (toolName === "file_manager") {
    const command = args?.command as string | undefined;
    switch (command) {
      case "rename": {
        const newPath =
          typeof args?.new_path === "string"
            ? getFileName(args.new_path)
            : "";
        if (path && newPath) return `Renaming ${path} → ${newPath}`;
        return path ? `Renaming ${path}` : "Renaming file";
      }
      case "delete":
        return path ? `Deleting ${path}` : "Deleting file";
      default:
        if (path) return `Managing ${path}`;
        return "file_manager";
    }
  }

  return toolName;
}

interface ToolCallLabelProps {
  toolName: string;
  args: Record<string, unknown>;
  state: string;
  result?: unknown;
}

export function ToolCallLabel({
  toolName,
  args,
  state,
  result,
}: ToolCallLabelProps) {
  const label = getToolCallLabel(toolName, args);
  const isComplete = state === "result" && result != null;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
