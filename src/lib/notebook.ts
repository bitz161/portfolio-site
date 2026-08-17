import { getAdminMinioClient, PROJECT_FILES_BUCKET } from "@/lib/minio";

type NotebookCell = {
  cell_type: "markdown" | "code" | "raw";
  source: string[] | string;
  outputs?: NotebookOutput[];
};

type NotebookOutput = {
  output_type: "stream" | "execute_result" | "display_data" | "error";
  text?: string[] | string;
  data?: Record<string, string[] | string>;
};

type Notebook = {
  cells: NotebookCell[];
};

function joinSource(source: string[] | string): string {
  return Array.isArray(source) ? source.join("") : source;
}

async function uploadOutputImage(
  slug: string,
  cellIdx: number,
  outputIdx: number,
  base64Png: string[] | string,
): Promise<string> {
  const key = `projects/${slug}/out-${cellIdx}-${outputIdx}.png`;
  const buffer = Buffer.from(joinSource(base64Png), "base64");
  await getAdminMinioClient().putObject(PROJECT_FILES_BUCKET, key, buffer, buffer.length, {
    "Content-Type": "image/png",
  });
  return `/api/files/${key}`;
}

/** Converts a parsed .ipynb notebook into the same Markdown format used by
 * hand-written project writeups (details_markdown), so it renders through
 * the existing react-markdown + remark-gfm pipeline with no new frontend
 * rendering code. */
export async function notebookToMarkdown(
  notebook: Notebook,
  slug: string,
): Promise<string> {
  const parts: string[] = [];

  for (let cellIdx = 0; cellIdx < notebook.cells.length; cellIdx++) {
    const cell = notebook.cells[cellIdx];

    if (cell.cell_type === "markdown") {
      parts.push(joinSource(cell.source));
      continue;
    }

    if (cell.cell_type !== "code") continue;

    const code = joinSource(cell.source).trimEnd();
    if (code) parts.push("```python\n" + code + "\n```");

    for (let outputIdx = 0; outputIdx < (cell.outputs?.length ?? 0); outputIdx++) {
      const output = cell.outputs![outputIdx];

      if (output.output_type === "stream" && output.text) {
        const text = joinSource(output.text).trimEnd();
        if (text) parts.push("```text\n" + text + "\n```");
        continue;
      }

      if (output.output_type === "execute_result" || output.output_type === "display_data") {
        const imagePng = output.data?.["image/png"];
        if (imagePng) {
          const url = await uploadOutputImage(slug, cellIdx, outputIdx, imagePng);
          parts.push(`![output](${url})`);
          continue;
        }

        const textPlain = output.data?.["text/plain"];
        if (textPlain) {
          const text = joinSource(textPlain).trimEnd();
          if (text) parts.push("```text\n" + text + "\n```");
        }
      }
    }
  }

  return parts.join("\n\n");
}
