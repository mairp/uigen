import { test, expect, describe, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallLabel, getToolCallLabel } from "../ToolCallLabel";

afterEach(() => {
  cleanup();
});

describe("getToolCallLabel", () => {
  describe("str_replace_editor", () => {
    test("create with path", () => {
      expect(
        getToolCallLabel("str_replace_editor", {
          command: "create",
          path: "/App.jsx",
        })
      ).toBe("Creating App.jsx");
    });

    test("create without path", () => {
      expect(
        getToolCallLabel("str_replace_editor", { command: "create" })
      ).toBe("Creating file");
    });

    test("str_replace with path", () => {
      expect(
        getToolCallLabel("str_replace_editor", {
          command: "str_replace",
          path: "/src/utils.ts",
        })
      ).toBe("Editing utils.ts");
    });

    test("insert with path", () => {
      expect(
        getToolCallLabel("str_replace_editor", {
          command: "insert",
          path: "/index.js",
        })
      ).toBe("Editing index.js");
    });

    test("view with path", () => {
      expect(
        getToolCallLabel("str_replace_editor", {
          command: "view",
          path: "/components/Header.tsx",
        })
      ).toBe("Viewing Header.tsx");
    });

    test("undo_edit with path", () => {
      expect(
        getToolCallLabel("str_replace_editor", {
          command: "undo_edit",
          path: "/App.jsx",
        })
      ).toBe("Undoing edit to App.jsx");
    });

    test("unknown command with path falls back to Editing", () => {
      expect(
        getToolCallLabel("str_replace_editor", {
          command: "unknown_cmd",
          path: "/file.ts",
        })
      ).toBe("Editing file.ts");
    });

    test("no command but has path falls back to Editing", () => {
      expect(
        getToolCallLabel("str_replace_editor", { path: "/file.ts" })
      ).toBe("Editing file.ts");
    });

    test("empty args falls back to raw tool name", () => {
      expect(getToolCallLabel("str_replace_editor", {})).toBe(
        "str_replace_editor"
      );
    });

    test("nested path extracts just the filename", () => {
      expect(
        getToolCallLabel("str_replace_editor", {
          command: "create",
          path: "/src/components/ui/Button.tsx",
        })
      ).toBe("Creating Button.tsx");
    });

    test("path without leading slash", () => {
      expect(
        getToolCallLabel("str_replace_editor", {
          command: "view",
          path: "index.ts",
        })
      ).toBe("Viewing index.ts");
    });
  });

  describe("file_manager", () => {
    test("rename with path and new_path", () => {
      expect(
        getToolCallLabel("file_manager", {
          command: "rename",
          path: "/utils.js",
          new_path: "/helpers.js",
        })
      ).toBe("Renaming utils.js → helpers.js");
    });

    test("rename without new_path", () => {
      expect(
        getToolCallLabel("file_manager", {
          command: "rename",
          path: "/utils.js",
        })
      ).toBe("Renaming utils.js");
    });

    test("rename without any path", () => {
      expect(
        getToolCallLabel("file_manager", { command: "rename" })
      ).toBe("Renaming file");
    });

    test("delete with path", () => {
      expect(
        getToolCallLabel("file_manager", {
          command: "delete",
          path: "/old-file.js",
        })
      ).toBe("Deleting old-file.js");
    });

    test("delete without path", () => {
      expect(
        getToolCallLabel("file_manager", { command: "delete" })
      ).toBe("Deleting file");
    });

    test("unknown command with path falls back to Managing", () => {
      expect(
        getToolCallLabel("file_manager", {
          command: "unknown",
          path: "/file.ts",
        })
      ).toBe("Managing file.ts");
    });

    test("empty args falls back to raw tool name", () => {
      expect(getToolCallLabel("file_manager", {})).toBe("file_manager");
    });
  });

  describe("unknown tool", () => {
    test("returns raw tool name", () => {
      expect(getToolCallLabel("some_other_tool", { foo: "bar" })).toBe(
        "some_other_tool"
      );
    });
  });
});

describe("ToolCallLabel component", () => {
  test("shows green dot and label when completed", () => {
    const { container } = render(
      <ToolCallLabel
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="result"
        result="Success"
      />
    );

    expect(screen.getByText("Creating App.jsx")).toBeDefined();
    expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
    expect(container.querySelector(".animate-spin")).toBeNull();
  });

  test("shows spinner when in call state", () => {
    const { container } = render(
      <ToolCallLabel
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="call"
      />
    );

    expect(screen.getByText("Creating App.jsx")).toBeDefined();
    expect(container.querySelector(".animate-spin")).not.toBeNull();
    expect(container.querySelector(".bg-emerald-500")).toBeNull();
  });

  test("shows spinner when in partial-call state", () => {
    const { container } = render(
      <ToolCallLabel
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="partial-call"
      />
    );

    expect(container.querySelector(".animate-spin")).not.toBeNull();
    expect(container.querySelector(".bg-emerald-500")).toBeNull();
  });

  test("shows spinner when result state but no result value", () => {
    const { container } = render(
      <ToolCallLabel
        toolName="str_replace_editor"
        args={{ command: "create", path: "/App.jsx" }}
        state="result"
      />
    );

    expect(container.querySelector(".animate-spin")).not.toBeNull();
    expect(container.querySelector(".bg-emerald-500")).toBeNull();
  });

  test("renders rename label with arrow", () => {
    render(
      <ToolCallLabel
        toolName="file_manager"
        args={{ command: "rename", path: "/old.js", new_path: "/new.js" }}
        state="result"
        result={{ success: true }}
      />
    );

    expect(screen.getByText("Renaming old.js → new.js")).toBeDefined();
  });

  test("renders delete label", () => {
    render(
      <ToolCallLabel
        toolName="file_manager"
        args={{ command: "delete", path: "/temp.js" }}
        state="result"
        result={{ success: true }}
      />
    );

    expect(screen.getByText("Deleting temp.js")).toBeDefined();
  });
});
