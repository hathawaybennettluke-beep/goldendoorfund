import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

/**
 * Background automation loops for the ecommerce platform.
 * Each job iterates over every store and respects that store's automation settings.
 */
const crons = cronJobs();

crons.interval("ecommerce: process incoming orders", { minutes: 15 }, internal.ecommerce.orderActions.processAllStores, {});
crons.interval("ecommerce: refresh shipment tracking", { minutes: 30 }, internal.ecommerce.orderActions.refreshAllTracking, {});
crons.interval("ecommerce: optimise ad campaigns", { hours: 6 }, internal.ecommerce.marketingActions.optimizeAllStores, {});
crons.daily("ecommerce: refresh trend research", { hourUTC: 6, minuteUTC: 0 }, internal.ecommerce.researchActions.refreshTrendsAllStores, {});

export default crons;
