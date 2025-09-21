import * as HttpApi from "@effect/platform/HttpApi";
import * as AuthContract from "./api/AuthContract.js";
import * as ChoresContract from "./api/ChoresContract.js";
import * as SseContract from "./api/SseContract.js";
import * as TodosContract from "./api/TodosContract.js";

export class DomainApi extends HttpApi.make("domain")
  .add(TodosContract.Group)
  .add(AuthContract.Group)
  .add(SseContract.Group)
  .add(ChoresContract.Group) {}
