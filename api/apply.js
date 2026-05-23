function sendJson(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.send(JSON.stringify(payload));
}

function cleanValue(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function parseRequestBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;

  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, {
      ok: false,
      message: "Method not allowed."
    });
  }

  const upstreamUrl = process.env.BRAVEHEART_APPS_SCRIPT_URL;

  if (!upstreamUrl) {
    return sendJson(res, 500, {
      ok: false,
      message: "Application backend is not configured."
    });
  }

  const payload = parseRequestBody(req.body);

  if (!payload) {
    return sendJson(res, 400, {
      ok: false,
      message: "Invalid JSON payload."
    });
  }

  const normalizedPayload = {
    source: "braveheart_application",
    application_type: cleanValue(payload.application_type),
    name: cleanValue(payload.name),
    email: cleanValue(payload.email),
    referral_code: cleanValue(payload.referral_code),
    work_description: cleanValue(payload.work_description),
    links: cleanValue(payload.links),
    proudest_work: cleanValue(payload.proudest_work)
  };

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(normalizedPayload)
    });

    const responseText = await upstreamResponse.text();
    let responseBody;

    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = {
        ok: false,
        message: "Application backend returned an invalid response."
      };
    }

    return sendJson(res, upstreamResponse.status, responseBody);
  } catch {
    return sendJson(res, 502, {
      ok: false,
      message: "Could not reach application backend."
    });
  }
};
