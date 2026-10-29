import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

export const runtime = "nodejs";
export const maxDuration = 60;

const run = promisify(execFile);
import ffmpegPath from "ffmpeg-static";

type ExportFrame = { dataUrl: string; duration: number };
type ExportRequest = { format: "gif" | "mp4"; width: number; height: number; frames: ExportFrame[] };

export async function POST(request: NextRequest) {
  let workDir = "";
  try {
    if (!ffmpegPath) return NextResponse.json({ error: "Animation encoder is unavailable on this server." }, { status: 503 });
    const body = (await request.json()) as ExportRequest;
    if (!body || !["gif", "mp4"].includes(body.format) || !Array.isArray(body.frames) || body.frames.length < 2 || body.frames.length > 120) {
      return NextResponse.json({ error: "Provide between 2 and 120 animation frames." }, { status: 400 });
    }
    if (!Number.isInteger(body.width) || !Number.isInteger(body.height) || body.width < 1 || body.height < 1 || body.width > 8192 || body.height > 8192) {
      return NextResponse.json({ error: "Invalid output dimensions." }, { status: 400 });
    }
    if (body.frames.some((frame) => typeof frame.dataUrl !== "string" || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(frame.dataUrl) || !Number.isFinite(frame.duration) || frame.duration < 20 || frame.duration > 10000)) {
      return NextResponse.json({ error: "One or more animation frames are invalid." }, { status: 400 });
    }

    workDir = await mkdtemp(join(tmpdir(), "panim-pixel-export-"));
    const concatLines: string[] = [];
    for (let i = 0; i < body.frames.length; i++) {
      const fileName = `frame-${String(i).padStart(4, "0")}.png`;
      const base64 = body.frames[i].dataUrl.slice("data:image/png;base64,".length);
      await writeFile(join(workDir, fileName), Buffer.from(base64, "base64"));
      concatLines.push(`file '${fileName}'`, `duration ${(body.frames[i].duration / 1000).toFixed(3)}`);
    }
    // The concat demuxer applies the last duration only when the final image is repeated.
    concatLines.push(`file 'frame-${String(body.frames.length - 1).padStart(4, "0")}.png'`);
    await writeFile(join(workDir, "frames.txt"), concatLines.join("\n") + "\n", "utf8");

    const outputName = body.format === "gif" ? "animation.gif" : "animation.mp4";
    const inputArgs = ["-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", "frames.txt"];
    const outputArgs = body.format === "gif"
      ? ["-filter_complex", "[0:v]fps=100,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer", "-loop", "0", "-f", "gif", outputName]
      : ["-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=neighbor,format=yuv420p", "-r", "30", "-an", "-movflags", "+faststart", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-f", "mp4", outputName];

    await run(ffmpegPath, [...inputArgs, ...outputArgs], { cwd: workDir, timeout: 55000, maxBuffer: 4 * 1024 * 1024 });
    const output = await readFile(join(workDir, outputName));
    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": body.format === "gif" ? "image/gif" : "video/mp4",
        "Content-Disposition": `attachment; filename="panim-animation.${body.format}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const details = error as Error & { stderr?: string; code?: string };
    const message = typeof details?.message === "string" ? details.message : "Unknown animation export error.";
    console.error("[Pixel Studio export]", message, details?.stderr ?? "");
    const publicMessage = message.includes("timed out")
      ? "Animation export took too long. Try fewer frames or a smaller size."
      : message.includes("ENOENT") || details?.code === "ENOENT"
        ? "The FFmpeg encoder is missing from the deployed server bundle. Redeploy after including the FFmpeg binary."
        : details?.stderr?.trim() || message;
    return NextResponse.json({ error: publicMessage }, { status: 500 });
  } finally {
    if (workDir) await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
