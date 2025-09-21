import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";

export class Group extends HttpApiGroup.make("auth")
  .add(HttpApiEndpoint.get("get", "/*"))
  .add(HttpApiEndpoint.post("post", "/*"))
  .prefix("/auth") {}
