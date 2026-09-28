const HYPERBEAM_API_KEY = "sk_test_Vei3dyN32a3a3txdJgKL9djfb9J4Pu86ayeGzn7b_m0";

export default {
  async fetch(request) {
    // 1. Handle CORS preflight checks
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    try {
      // 2. Request a new browser VM session from Hyperbeam
      const hbResponse = await fetch("https://engine.hyperbeam.com/v0/vm", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HYPERBEAM_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_url: "https://www.google.com",
        }),
      });

      const data = await hbResponse.json();

      // 3. Return the embed URL back to your frontend
      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
