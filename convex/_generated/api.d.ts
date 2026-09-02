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
import type * as blog from "../blog.js";
import type * as campaigns from "../campaigns.js";
import type * as cms from "../cms.js";
import type * as contactForm from "../contactForm.js";
import type * as contactFormAction from "../contactFormAction.js";
import type * as crons from "../crons.js";
import type * as donations from "../donations.js";
import type * as ecommerce_activity from "../ecommerce/activity.js";
import type * as ecommerce_connectorActions from "../ecommerce/connectorActions.js";
import type * as ecommerce_connectors from "../ecommerce/connectors.js";
import type * as ecommerce_lib_ai from "../ecommerce/lib/ai.js";
import type * as ecommerce_lib_auth from "../ecommerce/lib/auth.js";
import type * as ecommerce_lib_fallbacks from "../ecommerce/lib/fallbacks.js";
import type * as ecommerce_lib_images from "../ecommerce/lib/images.js";
import type * as ecommerce_lib_integrations_ads from "../ecommerce/lib/integrations/ads.js";
import type * as ecommerce_lib_integrations_fulfillment from "../ecommerce/lib/integrations/fulfillment.js";
import type * as ecommerce_lib_integrations_messaging from "../ecommerce/lib/integrations/messaging.js";
import type * as ecommerce_lib_integrations_shopify from "../ecommerce/lib/integrations/shopify.js";
import type * as ecommerce_lib_integrations_tracking from "../ecommerce/lib/integrations/tracking.js";
import type * as ecommerce_lib_notify from "../ecommerce/lib/notify.js";
import type * as ecommerce_lib_pricing from "../ecommerce/lib/pricing.js";
import type * as ecommerce_lib_text from "../ecommerce/lib/text.js";
import type * as ecommerce_marketing from "../ecommerce/marketing.js";
import type * as ecommerce_marketingActions from "../ecommerce/marketingActions.js";
import type * as ecommerce_orderActions from "../ecommerce/orderActions.js";
import type * as ecommerce_orders from "../ecommerce/orders.js";
import type * as ecommerce_productActions from "../ecommerce/productActions.js";
import type * as ecommerce_products from "../ecommerce/products.js";
import type * as ecommerce_research from "../ecommerce/research.js";
import type * as ecommerce_researchActions from "../ecommerce/researchActions.js";
import type * as ecommerce_storefront from "../ecommerce/storefront.js";
import type * as ecommerce_stores from "../ecommerce/stores.js";
import type * as http from "../http.js";
import type * as payments from "../payments.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  blog: typeof blog;
  campaigns: typeof campaigns;
  cms: typeof cms;
  contactForm: typeof contactForm;
  contactFormAction: typeof contactFormAction;
  crons: typeof crons;
  donations: typeof donations;
  "ecommerce/activity": typeof ecommerce_activity;
  "ecommerce/connectorActions": typeof ecommerce_connectorActions;
  "ecommerce/connectors": typeof ecommerce_connectors;
  "ecommerce/lib/ai": typeof ecommerce_lib_ai;
  "ecommerce/lib/auth": typeof ecommerce_lib_auth;
  "ecommerce/lib/fallbacks": typeof ecommerce_lib_fallbacks;
  "ecommerce/lib/images": typeof ecommerce_lib_images;
  "ecommerce/lib/integrations/ads": typeof ecommerce_lib_integrations_ads;
  "ecommerce/lib/integrations/fulfillment": typeof ecommerce_lib_integrations_fulfillment;
  "ecommerce/lib/integrations/messaging": typeof ecommerce_lib_integrations_messaging;
  "ecommerce/lib/integrations/shopify": typeof ecommerce_lib_integrations_shopify;
  "ecommerce/lib/integrations/tracking": typeof ecommerce_lib_integrations_tracking;
  "ecommerce/lib/notify": typeof ecommerce_lib_notify;
  "ecommerce/lib/pricing": typeof ecommerce_lib_pricing;
  "ecommerce/lib/text": typeof ecommerce_lib_text;
  "ecommerce/marketing": typeof ecommerce_marketing;
  "ecommerce/marketingActions": typeof ecommerce_marketingActions;
  "ecommerce/orderActions": typeof ecommerce_orderActions;
  "ecommerce/orders": typeof ecommerce_orders;
  "ecommerce/productActions": typeof ecommerce_productActions;
  "ecommerce/products": typeof ecommerce_products;
  "ecommerce/research": typeof ecommerce_research;
  "ecommerce/researchActions": typeof ecommerce_researchActions;
  "ecommerce/storefront": typeof ecommerce_storefront;
  "ecommerce/stores": typeof ecommerce_stores;
  http: typeof http;
  payments: typeof payments;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
