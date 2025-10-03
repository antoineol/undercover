/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as game from "../game.js";
import type * as game_management from "../game_management.js";
import type * as game_queries from "../game_queries.js";
import type * as game_start from "../game_start.js";
import type * as game_voting from "../game_voting.js";
import type * as game_word_sharing from "../game_word_sharing.js";
import type * as room_config from "../room_config.js";
import type * as rooms from "../rooms.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  game: typeof game;
  game_management: typeof game_management;
  game_queries: typeof game_queries;
  game_start: typeof game_start;
  game_voting: typeof game_voting;
  game_word_sharing: typeof game_word_sharing;
  room_config: typeof room_config;
  rooms: typeof rooms;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
