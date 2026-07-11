const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4.1-mini";
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_REQUEST_BODY_BYTES = 4 * 1024 * 1024;

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}

function estimateBase64Bytes(base64Value) {
  const clean = base64Value.replace(/\s/g, "");
  const padding = clean.endsWith("==") ? 2 : clean.endsWith("=") ? 1 : 0;
  return Math.floor((clean.length * 3) / 4) - padding;
}

function toImageDataUrl(imageBase64) {
  if (imageBase64.startsWith("data:image/")) return imageBase64;
  return `data:image/jpeg;base64,${imageBase64}`;
}

function safePrice(value) {
  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Number(parsed.toFixed(2));
}

function normalizeExtractedItems(payload) {
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.items)) {
    return [];
  }

  return payload.items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const quantity = Math.max(
        1,
        Number.parseInt(String(item.quantity ?? 1), 10) || 1
      );
      const unitPrice = safePrice(item.unitPrice);
      if (!name || unitPrice === null) return null;
      return { name, quantity, unitPrice };
    })
    .filter(Boolean);
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") {
    try {
      if (Buffer.byteLength(JSON.stringify(req.body), "utf8") > MAX_REQUEST_BODY_BYTES) {
        return Promise.reject(new Error("BODY_TOO_LARGE"));
      }
    } catch {
      return Promise.reject(new Error("INVALID_JSON_BODY"));
    }
    return Promise.resolve(req.body);
  }

  if (typeof req.body === "string" && req.body.trim()) {
    if (Buffer.byteLength(req.body, "utf8") > MAX_REQUEST_BODY_BYTES) {
      return Promise.reject(new Error("BODY_TOO_LARGE"));
    }
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      return Promise.reject(new Error("INVALID_JSON_BODY"));
    }
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;
    req.on("data", (chunk) => {
      chunks.push(chunk);
      totalSize += chunk.length;
      if (totalSize > MAX_REQUEST_BODY_BYTES) {
        reject(new Error("BODY_TOO_LARGE"));
        req.destroy();
      }
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8").trim();
      if (!raw) {
        reject(new Error("EMPTY_BODY"));
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("INVALID_JSON_BODY"));
      }
    });
    req.on("error", () => reject(new Error("READ_BODY_FAILED")));
  });
}

function extractionSchema() {
  return {
    type: "json_schema",
    json_schema: {
      name: "receipt_items",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                name: { type: "string" },
                quantity: { type: "integer", minimum: 1 },
                unitPrice: { type: "number", minimum: 0 },
              },
              required: ["name", "quantity", "unitPrice"],
            },
          },
        },
        required: ["items"],
      },
    },
  };
}

async function extractItemsFromImage({ imageReference, model, apiKey }) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: extractionSchema(),
      messages: [
        {
          role: "system",
          content:
            "You extract ordered food/drink items from a restaurant receipt. " +
            "Return only billable menu items. Exclude tax, tip, fees, discounts, and totals.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Extract receipt line items into JSON. " +
                "If an item appears multiple times, combine with quantity.",
            },
            {
              type: "image_url",
              image_url: { url: imageReference },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OPENAI_ERROR:${response.status}:${errorText}`);
  }

  const completion = await response.json();
  const rawContent = completion?.choices?.[0]?.message?.content;
  if (typeof rawContent !== "string" || !rawContent.trim()) {
    throw new Error("EMPTY_MODEL_RESPONSE");
  }

  let parsedContent;
  try {
    parsedContent = JSON.parse(rawContent);
  } catch {
    throw new Error("INVALID_MODEL_JSON");
  }

  const normalized = normalizeExtractedItems(parsedContent);
  if (!normalized.length) {
    throw new Error("NO_ITEMS_FOUND");
  }

  return normalized;
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, { error: "OPENAI_API_KEY is not configured" });
  }

  let body;
  try {
    body = await parseBody(req);
  } catch (error) {
    if (error instanceof Error && error.message === "BODY_TOO_LARGE") {
      return sendJson(res, 413, {
        error: "Request body is too large. Upload a smaller image.",
      });
    }
    if (error instanceof Error && error.message === "EMPTY_BODY") {
      return sendJson(res, 400, { error: "Request body is required" });
    }
    return sendJson(res, 400, { error: "Request body must be valid JSON" });
  }

  const imageUrl =
    typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "";
  const imageBase64 =
    typeof body?.imageBase64 === "string" ? body.imageBase64.trim() : "";
  const model =
    typeof body?.model === "string" && body.model.trim()
      ? body.model.trim()
      : DEFAULT_MODEL;

  if (!imageUrl && !imageBase64) {
    return sendJson(res, 400, {
      error: "Provide either imageUrl or imageBase64",
    });
  }

  let imageReference = imageUrl;
  if (!imageReference && imageBase64) {
    const encodedPart = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;
    const estimatedBytes = estimateBase64Bytes(encodedPart);
    if (estimatedBytes > MAX_IMAGE_BYTES) {
      return sendJson(res, 413, {
        error: `Image too large. Max supported size is ${MAX_IMAGE_BYTES} bytes`,
      });
    }
    imageReference = toImageDataUrl(imageBase64);
  }

  try {
    const items = await extractItemsFromImage({
      imageReference,
      model,
      apiKey,
    });
    return sendJson(res, 200, { items });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("OPENAI_ERROR:")) {
      const [, statusCode] = error.message.split(":");
      return sendJson(res, 502, {
        error: "Failed to extract items from vision model",
        upstreamStatus: Number(statusCode),
      });
    }

    if (error instanceof Error && error.message === "NO_ITEMS_FOUND") {
      return sendJson(res, 422, {
        error: "No billable items could be extracted from the image",
      });
    }

    return sendJson(res, 500, { error: "Failed to process receipt image" });
  }
}
