const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

function corsHeaders(origin) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

  return {
    "Access-Control-Allow-Origin":
      allowedOrigin === "*" ? "*" : allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

export async function OPTIONS(request) {
  const origin = request.headers.get("origin") || "";
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

  if (
    allowedOrigin !== "*" &&
    origin &&
    origin !== allowedOrigin
  ) {
    return new Response("Origin not allowed", { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin)
  });
}

export async function POST(request) {
  const origin = request.headers.get("origin") || "";
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

  if (
    allowedOrigin !== "*" &&
    origin &&
    origin !== allowedOrigin
  ) {
    return new Response(
      JSON.stringify({ error: "Origin not allowed" }),
      {
        status: 403,
        headers: {
          ...corsHeaders(origin),
          "Content-Type": "application/json"
        }
      }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "ANTHROPIC_API_KEY is not configured"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders(origin),
          "Content-Type": "application/json"
        }
      }
    );
  }

  try {
    const body = await request.text();

    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body
    });

    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        ...corsHeaders(origin),
        "Content-Type":
          response.headers.get("content-type") ||
          "application/json"
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Proxy request failed",
        message: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders(origin),
          "Content-Type": "application/json"
        }
      }
    );
  }
}
