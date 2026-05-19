const http = require("http");
const { URL } = require("url");

const port = process.env.PORT || 4000;
const host = process.env.HOST || "0.0.0.0";
const triageServiceUrl = process.env.TRIAGE_SERVICE_URL || "http://127.0.0.1:4001";

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function proxyToTriageService(request, response) {
  const targetUrl = new URL(request.url, triageServiceUrl);
  const proxyRequest = http.request(
    targetUrl,
    {
      method: request.method,
      headers: { ...request.headers, host: targetUrl.host }
    },
    (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
      proxyResponse.pipe(response);
    }
  );

  proxyRequest.on("error", () => {
    sendJson(response, 502, {
      error: "bad_gateway",
      message: "Unable to reach the triage service."
    });
  });

  request.pipe(proxyRequest);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (requestUrl.pathname === "/api/triage-chat") {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "method_not_allowed" });
      return;
    }

    proxyToTriageService(request, response);
    return;
  }

  if (requestUrl.pathname === "/health" || requestUrl.pathname === "/api/health") {
    sendJson(response, 200, { status: "ok", service: "api-gateway" });
    return;
  }

  sendJson(response, 404, {
    error: "not_found",
    message: "The requested endpoint is not handled by the API gateway."
  });
});

server.listen(port, host, () => {
  console.log(`API gateway running at http://${host}:${port}`);
  console.log(`Forwarding /api/triage-chat to ${triageServiceUrl}`);
});
