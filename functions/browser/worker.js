const HYPERBEAM_API_KEY = "sk_test_Vei3dyN32a3a3txdJgKL9djfb9J4Pu86ayeGzn7b_m0";

export default {
  async fetch(request) {
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

      const responseText = await hbResponse.text();
      
      // If Hyperbeam rejected the request, return the text so we can see why
      if (!hbResponse.ok) {
        return new Response(JSON.stringify({ error: `Hyperbeam error: ${responseText}` }), {
          status: hbResponse.status,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }

      const data = JSON.parse(responseText);
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
