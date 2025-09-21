import * as Layer from "effect/Layer";
import ManagedRuntime from "effect/ManagedRuntime";
import { Auth } from "./auth.js";

const MainLayer = Layer.mergeAll(Auth.Default);

export const DatabaseRuntime = ManagedRuntime.make(MainLayer);
