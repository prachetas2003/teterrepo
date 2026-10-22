import { PrismaPg } from "@prisma/adapter-pg";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
const databaseUrl = process.env.DATABASE_URL;
const geminiKey = process.env.GEMINI_API_KEY;
const corsOrigin = process.env.CORS_ORIGIN;
if (!databaseUrl || !geminiKey || !corsOrigin)
  throw new Error("DATABASE_URL, GEMINI_API_KEY and CORS_ORIGIN are required");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});
const app = express();
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "16kb" }));
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});
app.get("/pieces", async (_req, res, next) => {
  try {
    res.json(await db.piece.findMany({ orderBy: { id: "asc" } }));
  } catch (e) {
    next(e);
  }
});
app.get("/pieces/:id", async (req, res, next) => {
  try {
    const piece = await db.piece.findUnique({ where: { id: req.params.id } });
    if (!piece) {
      res.status(404).json({ message: "This piece is not in the collection." });
      return;
    }
    res.json(piece);
  } catch (e) {
    next(e);
  }
});
app.post("/pieces/:id/kiln-note", async (req, res, next) => {
  try {
    const piece = await db.piece.findUnique({ where: { id: req.params.id } });
    if (!piece) {
      res.status(404).json({ message: "This piece is not in the collection." });
      return;
    }
    try {
      const upstream = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiKey,
          },
          signal: AbortSignal.timeout(25000),
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Write exactly two short, grounded sentences in the voice of a small Copenhagen pottery studio. Describe this fired piece without inventing technical facts: ${piece.name}, ${piece.clay}, ${piece.glaze}, ${piece.firing}. No headings or sales language.`,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 512,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
        },
      );
      if (!upstream.ok) throw new Error("upstream");
      const body = (await upstream.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const note = body.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("")
        .trim();
      if (!note) throw new Error("empty response");
      res.json({ note, source: "Gemini · generated on the server" });
    } catch {
      res.status(502).json({
        message: "The kiln note could not be written. Please try again.",
      });
    }
  } catch (e) {
    next(e);
  }
});
app.get("/commissions", async (_req, res, next) => {
  try {
    const rows = await db.commission.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { piece: { select: { name: true } } },
    });
    res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name.split(" ")[0],
        piece: row.piece?.name ?? "Something new",
        month: row.month,
      })),
    );
  } catch (e) {
    next(e);
  }
});
app.post("/commissions", async (req, res, next) => {
  if (!req.body || typeof req.body !== "object") {
    res.status(400).json({ message: "Please complete the commission form." });
    return;
  }
  const { name, email, pieceId, story, month } = req.body;
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 100 ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    typeof story !== "string" ||
    !story.trim() ||
    story.length > 2000 ||
    typeof month !== "string" ||
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
    (pieceId !== undefined && pieceId !== null && typeof pieceId !== "string")
  ) {
    res.status(400).json({
      message: "Please complete each field with a valid email and month.",
    });
    return;
  }
  try {
    if (pieceId && !(await db.piece.findUnique({ where: { id: pieceId } }))) {
      res
        .status(400)
        .json({ message: "Please choose a piece from the collection." });
      return;
    }
    const row = await db.commission.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        pieceId: pieceId || null,
        story: story.trim(),
        month,
      },
    });
    res.status(201).json({
      id: row.id,
      message: "Your request is with the studio. We will be in touch soon.",
    });
  } catch (e) {
    next(e);
  }
});
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (
      err &&
      typeof err === "object" &&
      "status" in err &&
      (err.status === 400 || err.status === 413)
    ) {
      res
        .status(err.status)
        .json({
          message:
            err.status === 413
              ? "Please keep your request under 16 KB."
              : "Please send a valid commission form.",
        });
      return;
    }
    res
      .status(500)
      .json({ message: "The studio desk is unavailable. Please try again." });
  },
);
const port = Number(process.env.PORT) || 4000;
app.listen(port, "0.0.0.0");
