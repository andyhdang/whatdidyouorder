import assert from "node:assert/strict";
import test from "node:test";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

test("returns extracted receipt tax as a dollar amount", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "dummy-key";
  globalThis.fetch = async (url, options) => {
    assert.equal(url, OPENAI_API_URL);
    const request = JSON.parse(options.body);
    const schema = request.response_format.json_schema.schema;

    assert.deepEqual(schema.properties.taxAmount.type, ["number", "null"]);
    assert.match(
      request.messages[0].content,
      /taxAmount when it is explicitly shown/,
    );

    return {
      ok: true,
      async json() {
        return {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  items: [{ name: "Burger", quantity: 2, unitPrice: 12.5 }],
                  taxAmount: 2.437,
                }),
              },
            },
          ],
        };
      },
    };
  };

  const { default: handler } = await import("./extract-items.js");
  let response;
  try {
    response = await new Promise((resolve) => {
      const res = {
        status(statusCode) {
          this.statusCode = statusCode;
          return this;
        },
        json(payload) {
          resolve({ statusCode: this.statusCode, payload });
        },
        setHeader() {},
      };
      handler(
        {
          method: "POST",
          body: { imageBase64: "dGVzdA==" },
        },
        res,
      );
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  }

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.payload, {
    items: [{ name: "Burger", quantity: 2, unitPrice: 12.5 }],
    taxAmount: 2.44,
  });
});
