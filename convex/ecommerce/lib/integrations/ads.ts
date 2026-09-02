/**
 * Paid media adapters: Meta (Facebook/Instagram), TikTok and Google Ads.
 * Each `createCampaign` creates a PAUSED campaign shell on the platform so a
 * human can review budgets/creatives in the native ads manager before spend
 * starts. `simulated: true` results mean the channel is not connected yet.
 */
export interface CampaignSpec {
  name: string;
  objective: string;
  dailyBudget: number; // in account currency units
  startDate?: number;
  endDate?: number;
}

export interface CampaignPushResult {
  externalId: string;
  externalStatus: string;
  simulated: boolean;
  adminUrl?: string;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
}

// ---------------------------------------------------------------- Meta -----
export interface MetaCredentials {
  adAccountId: string; // without act_
  accessToken: string;
  pageId?: string;
  pixelId?: string;
}
const META_GRAPH = "https://graph.facebook.com/v21.0";

export async function metaTest(creds: MetaCredentials): Promise<string> {
  const res = await fetch(`${META_GRAPH}/act_${creds.adAccountId}?fields=name,currency&access_token=${encodeURIComponent(creds.accessToken)}`);
  if (!res.ok) throw new Error(`Meta API error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { name: string; currency: string };
  return `${json.name} (${json.currency})`;
}

export async function metaCreateCampaign(creds: MetaCredentials, spec: CampaignSpec): Promise<CampaignPushResult> {
  const body = new URLSearchParams({
    name: spec.name,
    objective: "OUTCOME_SALES",
    status: "PAUSED",
    special_ad_categories: "[]",
    daily_budget: String(Math.round(spec.dailyBudget * 100)),
    access_token: creds.accessToken,
  });
  const res = await fetch(`${META_GRAPH}/act_${creds.adAccountId}/campaigns`, { method: "POST", body });
  if (!res.ok) throw new Error(`Meta API error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { id: string };
  return {
    externalId: json.id,
    externalStatus: "PAUSED",
    simulated: false,
    adminUrl: `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${creds.adAccountId}&selected_campaign_ids=${json.id}`,
  };
}

export async function metaSetStatus(creds: MetaCredentials, campaignId: string, status: "ACTIVE" | "PAUSED"): Promise<void> {
  const body = new URLSearchParams({ status, access_token: creds.accessToken });
  const res = await fetch(`${META_GRAPH}/${campaignId}`, { method: "POST", body });
  if (!res.ok) throw new Error(`Meta API error ${res.status}: ${await res.text()}`);
}

export async function metaSetBudget(creds: MetaCredentials, campaignId: string, dailyBudget: number): Promise<void> {
  const body = new URLSearchParams({ daily_budget: String(Math.round(dailyBudget * 100)), access_token: creds.accessToken });
  const res = await fetch(`${META_GRAPH}/${campaignId}`, { method: "POST", body });
  if (!res.ok) throw new Error(`Meta API error ${res.status}: ${await res.text()}`);
}

export async function metaInsights(creds: MetaCredentials, campaignId: string): Promise<CampaignMetrics> {
  const fields = "impressions,clicks,spend,actions,action_values";
  const res = await fetch(`${META_GRAPH}/${campaignId}/insights?fields=${fields}&date_preset=maximum&access_token=${encodeURIComponent(creds.accessToken)}`);
  if (!res.ok) throw new Error(`Meta API error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data: Array<{ impressions: string; clicks: string; spend: string; actions?: Array<{ action_type: string; value: string }>; action_values?: Array<{ action_type: string; value: string }> }> };
  const row = json.data?.[0];
  if (!row) return { impressions: 0, clicks: 0, spend: 0, conversions: 0, revenue: 0 };
  const purchases = row.actions?.find((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase");
  const value = row.action_values?.find((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase");
  return {
    impressions: Number(row.impressions),
    clicks: Number(row.clicks),
    spend: Number(row.spend),
    conversions: Number(purchases?.value ?? 0),
    revenue: Number(value?.value ?? 0),
  };
}

// -------------------------------------------------------------- TikTok -----
export interface TikTokCredentials {
  advertiserId: string;
  accessToken: string;
}
const TIKTOK_API = "https://business-api.tiktok.com/open_api/v1.3";

async function tiktokRequest<T>(creds: TikTokCredentials, path: string, method: "GET" | "POST", body?: unknown): Promise<T> {
  const res = await fetch(`${TIKTOK_API}${path}`, {
    method,
    headers: { "Access-Token": creds.accessToken, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json()) as { code: number; message: string; data: T };
  if (!res.ok || json.code !== 0) throw new Error(`TikTok API error: ${json.message ?? res.status}`);
  return json.data;
}

export async function tiktokTest(creds: TikTokCredentials): Promise<string> {
  const data = await tiktokRequest<{ list: Array<{ name: string }> }>(creds, `/advertiser/info/?advertiser_ids=${encodeURIComponent(JSON.stringify([creds.advertiserId]))}`, "GET");
  return data.list?.[0]?.name ?? creds.advertiserId;
}

export async function tiktokCreateCampaign(creds: TikTokCredentials, spec: CampaignSpec): Promise<CampaignPushResult> {
  const data = await tiktokRequest<{ campaign_id: string }>(creds, "/campaign/create/", "POST", {
    advertiser_id: creds.advertiserId,
    campaign_name: spec.name,
    objective_type: "WEB_CONVERSIONS",
    budget_mode: "BUDGET_MODE_DAY",
    budget: Math.max(spec.dailyBudget, 20),
    operation_status: "DISABLE",
  });
  return {
    externalId: data.campaign_id,
    externalStatus: "DISABLE",
    simulated: false,
    adminUrl: `https://ads.tiktok.com/i18n/perf/campaign?aadvid=${creds.advertiserId}`,
  };
}

export async function tiktokSetStatus(creds: TikTokCredentials, campaignId: string, enable: boolean): Promise<void> {
  await tiktokRequest(creds, "/campaign/status/update/", "POST", {
    advertiser_id: creds.advertiserId,
    campaign_ids: [campaignId],
    operation_status: enable ? "ENABLE" : "DISABLE",
  });
}

export async function tiktokInsights(creds: TikTokCredentials, campaignId: string): Promise<CampaignMetrics> {
  const params = new URLSearchParams({
    advertiser_id: creds.advertiserId,
    report_type: "BASIC",
    data_level: "AUCTION_CAMPAIGN",
    dimensions: JSON.stringify(["campaign_id"]),
    metrics: JSON.stringify(["spend", "impressions", "clicks", "conversion", "total_complete_payment_rate"]),
    filters: JSON.stringify([{ field_name: "campaign_ids", filter_type: "IN", filter_value: JSON.stringify([campaignId]) }]),
    lifetime: "true",
  });
  const data = await tiktokRequest<{ list: Array<{ metrics: Record<string, string> }> }>(creds, `/report/integrated/get/?${params}`, "GET");
  const m = data.list?.[0]?.metrics;
  if (!m) return { impressions: 0, clicks: 0, spend: 0, conversions: 0, revenue: 0 };
  return {
    impressions: Number(m.impressions ?? 0),
    clicks: Number(m.clicks ?? 0),
    spend: Number(m.spend ?? 0),
    conversions: Number(m.conversion ?? 0),
    revenue: Number(m.total_complete_payment_rate ?? 0),
  };
}

// -------------------------------------------------------------- Google -----
export interface GoogleAdsCredentials {
  customerId: string; // digits only
  developerToken: string;
  accessToken: string; // OAuth2 access token
  loginCustomerId?: string;
}
const GOOGLE_ADS_API = "https://googleads.googleapis.com/v18";

async function googleRequest<T>(creds: GoogleAdsCredentials, path: string, method: "GET" | "POST", body?: unknown): Promise<T> {
  const res = await fetch(`${GOOGLE_ADS_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${creds.accessToken}`,
      "developer-token": creds.developerToken,
      ...(creds.loginCustomerId ? { "login-customer-id": creds.loginCustomerId } : {}),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Google Ads API error ${res.status}: ${await res.text()}`);
  return (await res.json()) as T;
}

export async function googleTest(creds: GoogleAdsCredentials): Promise<string> {
  const data = await googleRequest<{ results: Array<{ customer: { descriptiveName: string } }> }>(creds, `/customers/${creds.customerId}/googleAds:search`, "POST", {
    query: "SELECT customer.descriptive_name FROM customer LIMIT 1",
  });
  return data.results?.[0]?.customer?.descriptiveName ?? creds.customerId;
}

export async function googleCreateCampaign(creds: GoogleAdsCredentials, spec: CampaignSpec): Promise<CampaignPushResult> {
  const budget = await googleRequest<{ results: Array<{ resourceName: string }> }>(creds, `/customers/${creds.customerId}/campaignBudgets:mutate`, "POST", {
    operations: [{ create: { name: `${spec.name} budget`, amountMicros: String(Math.round(spec.dailyBudget * 1_000_000)), deliveryMethod: "STANDARD" } }],
  });
  const budgetResource = budget.results[0].resourceName;
  const campaign = await googleRequest<{ results: Array<{ resourceName: string }> }>(creds, `/customers/${creds.customerId}/campaigns:mutate`, "POST", {
    operations: [
      {
        create: {
          name: spec.name,
          status: "PAUSED",
          advertisingChannelType: "PERFORMANCE_MAX",
          campaignBudget: budgetResource,
          maximizeConversionValue: {},
        },
      },
    ],
  });
  const resource = campaign.results[0].resourceName;
  return {
    externalId: resource,
    externalStatus: "PAUSED",
    simulated: false,
    adminUrl: `https://ads.google.com/aw/campaigns?ocid=${creds.customerId}`,
  };
}

export async function googleSetStatus(creds: GoogleAdsCredentials, resourceName: string, status: "ENABLED" | "PAUSED"): Promise<void> {
  await googleRequest(creds, `/customers/${creds.customerId}/campaigns:mutate`, "POST", {
    operations: [{ update: { resourceName, status }, updateMask: "status" }],
  });
}

export async function googleInsights(creds: GoogleAdsCredentials, resourceName: string): Promise<CampaignMetrics> {
  const data = await googleRequest<{ results: Array<{ metrics: { impressions: string; clicks: string; costMicros: string; conversions: number; conversionsValue: number } }> }>(creds, `/customers/${creds.customerId}/googleAds:search`, "POST", {
    query: `SELECT metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.conversions_value FROM campaign WHERE campaign.resource_name = '${resourceName}'`,
  });
  const m = data.results?.[0]?.metrics;
  if (!m) return { impressions: 0, clicks: 0, spend: 0, conversions: 0, revenue: 0 };
  return {
    impressions: Number(m.impressions),
    clicks: Number(m.clicks),
    spend: Number(m.costMicros) / 1_000_000,
    conversions: Number(m.conversions),
    revenue: Number(m.conversionsValue),
  };
}
