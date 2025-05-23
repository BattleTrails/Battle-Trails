//@ts-ignore
const GOOGLE_API_KEY = Deno.env.get("VITE_GOOGLE_MAPS_API_KEY");

interface AutocompleteRequestBody {
  input: string;
}

//@ts-ignore
Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {

    const { input } = await req.json() as AutocompleteRequestBody;

    if (!input || typeof input !== "string") {
      return new Response(JSON.stringify({ error: "Input inválido" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places:autocomplete?key=${GOOGLE_API_KEY}`,
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
        "Access-Control-Allow-Origin": "*", // 👈 aquí está la clave
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
