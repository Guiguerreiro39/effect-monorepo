import { Api } from "@/api.js";
import { EnvVars } from "@/common/env-vars.js";
import * as NodeHttpServerRequest from "@effect/platform-node/NodeHttpServerRequest";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import { BetterAuthApiError } from "@org/database/src/lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import * as Effect from "effect/Effect";
import { AuthRepository } from "./auth-repository.js";

const authHandler = Effect.gen(function* () {
  const repository = yield* AuthRepository;
  const envVars = yield* EnvVars;

  const request = yield* HttpServerRequest.HttpServerRequest;
  const nodeRequest = NodeHttpServerRequest.toIncomingMessage(request);
  const nodeResponse = NodeHttpServerRequest.toServerResponse(request);

  const appUrl = envVars.APP_URL;

  nodeResponse.setHeader("Access-Control-Allow-Origin", appUrl);
  nodeResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  nodeResponse.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  nodeResponse.setHeader("Access-Control-Max-Age", "600");
  nodeResponse.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight requests
  if (nodeRequest.method === "OPTIONS") {
    nodeResponse.statusCode = 200;
    nodeResponse.end();
    return nodeResponse;
  }

  yield* Effect.tryPromise({
    try: () => toNodeHandler(repository.handler)(nodeRequest, nodeResponse),
    catch: (error) => {
      return new BetterAuthApiError({ error });
    },
  });

  return nodeResponse;
}).pipe(Effect.provide([AuthRepository.Default]));

export const AuthLive = HttpApiBuilder.group(Api, "auth", (handlers) =>
  handlers
    .handle("get", () => authHandler.pipe(Effect.orDie))
    .handle("post", () => authHandler.pipe(Effect.orDie)),
);
