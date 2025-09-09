
// COMENTADO: Ya no usamos Google Maps API
// @ts-ignore
// const VITE_GOOGLE_API_KEY = Deno.env.get("VITE_GOOGLE_MAPS_API_KEY") ?? "API_KEY_NO_ENCONTRADA";

// COMENTADO: Función deshabilitada ya que no usamos Google Maps API
// @ts-ignore
/*
Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  let input = "";

  try {
    if (req.method === "POST") {
      const body = await req.json() as { input: string };
      input = body.input;

    } else if (req.method === "GET") {
      const { searchParams } = new URL(req.url);
      input = searchParams.get("input") ?? "";
    } else {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    if (!input || typeof input !== "string") {
      return new Response(JSON.stringify({ error: "Input inválido" }), {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places:autocomplete?key=${VITE_GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text",
        },
        body: JSON.stringify({
          input,
          languageCode: "es",
          regionCode: "ES",
        }),
      }
    );

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
*/

// Función temporal que devuelve error para indicar que el servicio no está disponible
// @ts-ignore
Deno.serve(async (req: Request): Promise<Response> => {
  return new Response(JSON.stringify({ 
    error: "Servicio de autocomplete deshabilitado. Usando OpenStreetMap Nominatim." 
  }), {
    status: 503,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
