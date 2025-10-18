import * as HttpApi from "@effect/platform/HttpApi";
import * as ActivityContract from "./api/ActivityContract.js";
import * as AuthContract from "./api/AuthContract.js";
import * as SseContract from "./api/SseContract.js";
import * as TaskContract from "./api/TaskContract.js";
import * as UserMetadataContract from "./api/UserMetadataContract.js";

export class DomainApi extends HttpApi.make("domain")
  .add(AuthContract.Group)
  .add(SseContract.Group)
  .add(ActivityContract.Group)
  .add(TaskContract.Group)
  .add(UserMetadataContract.Group) {}
