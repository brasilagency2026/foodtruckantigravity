/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as debug from "../debug.js";
import type * as debugPush from "../debugPush.js";
import type * as emails from "../emails.js";
import type * as foodTrucks from "../foodTrucks.js";
import type * as http from "../http.js";
import type * as index from "../index.js";
import type * as menu from "../menu.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as payments from "../payments.js";
import type * as reviews from "../reviews.js";
import type * as storage from "../storage.js";
import type * as vouchers from "../vouchers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  billing: typeof billing;
  debug: typeof debug;
  debugPush: typeof debugPush;
  emails: typeof emails;
  foodTrucks: typeof foodTrucks;
  http: typeof http;
  index: typeof index;
  menu: typeof menu;
  notifications: typeof notifications;
  orders: typeof orders;
  payments: typeof payments;
  reviews: typeof reviews;
  storage: typeof storage;
  vouchers: typeof vouchers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
