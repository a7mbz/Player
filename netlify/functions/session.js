
exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "Method not allowed" }) 
    };
  }

  const apiKey = process.env.HYPERBEAM_KEY;
  if (!apiKey) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "HYPERBEAM_KEY secret is not set on Netlify" }) 
    };
  }

  try {
    const response = await fetch("https://engine.hyperbeam.com/v0/vm", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok || !data.embed_url || !data.session_id) {
      return { 
        statusCode: 502, 
        body: JSON.stringify({ error: data.error || data.message || "Could not start the session" }) 
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        embed_url: data.embed_url, 
        session_id: data.session_id 
      }),
    };
  } catch (err) {
    return { 
      statusCode: 502, 
      body: JSON.stringify({ error: "Could not reach the session service" }) 
    };
  }
};
