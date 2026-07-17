const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.argv[2]) || 5501;

const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2"
};

function resolveRequestPath(requestUrl) {
    const pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
    const relative = pathname.replace(/^\/+/, "");
    const candidate = path.resolve(root, relative || "index.html");

    if (candidate !== root && !candidate.startsWith(`${root}${path.sep}`)) {
        return null;
    }

    return candidate;
}

const server = http.createServer((request, response) => {
    let filePath;

    try {
        filePath = resolveRequestPath(request.url || "/");
    } catch {
        response.writeHead(400).end("Requisicao invalida.");
        return;
    }

    if (!filePath) {
        response.writeHead(403).end("Acesso negado.");
        return;
    }

    fs.stat(filePath, (statError, stats) => {
        if (!statError && stats.isDirectory()) {
            filePath = path.join(filePath, "index.html");
        }

        fs.readFile(filePath, (readError, content) => {
            if (readError) {
                response.writeHead(readError.code === "ENOENT" ? 404 : 500, {
                    "Content-Type": "text/plain; charset=utf-8"
                });
                response.end(readError.code === "ENOENT" ? "Pagina nao encontrada." : "Erro interno.");
                return;
            }

            const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
            response.writeHead(200, {
                "Content-Type": contentType,
                "Cache-Control": "no-cache"
            });
            response.end(content);
        });
    });
});

server.listen(port, "127.0.0.1");

