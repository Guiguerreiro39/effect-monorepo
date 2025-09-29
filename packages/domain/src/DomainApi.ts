import * as HttpApi from "@effect/platform/HttpApi";
import * as AuthContract from "./api/AuthContract.js";
import * as SseContract from "./api/SseContract.js";
import * as TaskCompletionContract from "./api/TaskCompletionContract.js";
import * as TaskContract from "./api/TaskContract.js";

export class DomainApi extends HttpApi.make("domain")
  .add(AuthContract.Group)
  .add(SseContract.Group)
  .add(TaskCompletionContract.Group)
  .add(TaskContract.Group) {}
