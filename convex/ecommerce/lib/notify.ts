/**
 * Customer notification helper shared by the order and marketing actions.
 * Resolves messaging connectors, renders flow templates and records logs.
 */
import type { ActionCtx } from "../../_generated/server";
import { internal } from "../../_generated/api";
import type { Doc, Id } from "../../_generated/dataModel";
import { renderTemplate, sendEmail, sendSms, type EmailCredentials, type SmsCredentials } from "./integrations/messaging";
import { formatMoney } from "./text";

export async function getMessagingCreds(ctx: ActionCtx, storeId: Id<"ecStores">): Promise<{ email: EmailCredentials | null; sms: SmsCredentials | null }> {
  const [emailConn, smsConn] = await Promise.all([
    ctx.runQuery(internal.ecommerce.connectors.getByProvider, { storeId, provider: "email" }),
    ctx.runQuery(internal.ecommerce.connectors.getByProvider, { storeId, provider: "sms" }),
  ]);
  const emailCreds = emailConn?.credentials as Partial<EmailCredentials> | undefined;
  const smsCreds = smsConn?.credentials as Partial<SmsCredentials> | undefined;
  return {
    email: emailCreds?.from && (emailCreds.apiKey || emailCreds.smtpHost) ? ({ provider: emailCreds.apiKey ? "resend" : "smtp", ...emailCreds } as EmailCredentials) : null,
    sms: smsCreds?.accountSid && smsCreds.authToken && smsCreds.from ? ({ provider: "twilio", ...smsCreds } as SmsCredentials) : null,
  };
}

export function orderVars(store: Doc<"ecStores">, order: Doc<"ecOrders"> | null, extra: Record<string, string | number | undefined> = {}): Record<string, string | number | undefined> {
  return {
    storeName: store.name,
    customerName: order?.customer.name.split(" ")[0] ?? "there",
    customerFullName: order?.customer.name,
    orderNumber: order?.orderNumber,
    total: order ? formatMoney(order.total, order.currency) : undefined,
    items: order?.items.map((i) => `${i.quantity} × ${i.title}`).join(", "),
    ...extra,
  };
}

export async function deliverStep(
  ctx: ActionCtx,
  store: Doc<"ecStores">,
  flow: Doc<"ecMessagingFlows">,
  stepIndex: number,
  to: { email: string; phone?: string },
  vars: Record<string, string | number | undefined>,
  orderId?: Id<"ecOrders">
): Promise<"sent" | "simulated" | "failed" | "skipped"> {
  const step = flow.steps[stepIndex];
  if (!step) return "skipped";
  const creds = await getMessagingCreds(ctx, store._id);
  const body = renderTemplate(step.body, vars);
  const subject = step.subject ? renderTemplate(step.subject, vars) : undefined;
  let result;
  let target: string;
  if (flow.channel === "email") {
    target = to.email;
    result = await sendEmail(creds.email, { to: target, subject: subject ?? `${store.name} update`, text: body });
  } else {
    if (!to.phone) return "skipped";
    target = to.phone;
    result = await sendSms(creds.sms, { to: target, body });
  }
  await ctx.runMutation(internal.ecommerce.marketing.insertMessageLog, {
    storeId: store._id,
    orderId,
    flowId: flow._id,
    channel: flow.channel,
    to: target,
    subject,
    body,
    status: result.status,
    provider: result.provider,
    providerMessageId: result.providerMessageId,
    error: result.error,
  });
  if (result.status !== "failed") await ctx.runMutation(internal.ecommerce.marketing.bumpFlowStats, { flowId: flow._id });
  return result.status;
}

/**
 * Fire every active flow for a trigger. Step 0 is delivered immediately;
 * later steps are scheduled with Convex's scheduler.
 */
export async function triggerFlows(
  ctx: ActionCtx,
  store: Doc<"ecStores">,
  trigger: Doc<"ecMessagingFlows">["trigger"],
  order: Doc<"ecOrders">,
  extra: Record<string, string | number | undefined> = {}
): Promise<{ delivered: number; simulated: boolean }> {
  const flows = await ctx.runQuery(internal.ecommerce.marketing.getFlowsByTrigger, { storeId: store._id, trigger });
  const vars = orderVars(store, order, extra);
  let delivered = 0;
  let simulated = false;
  for (const flow of flows) {
    const status = await deliverStep(ctx, store, flow, 0, order.customer, vars, order._id);
    if (status === "sent" || status === "simulated") delivered += 1;
    if (status === "simulated") simulated = true;
    for (let i = 1; i < flow.steps.length; i++) {
      await ctx.scheduler.runAfter(flow.steps[i].delayHours * 60 * 60 * 1000, internal.ecommerce.orderActions.deliverScheduledStep, {
        storeId: store._id,
        flowId: flow._id,
        stepIndex: i,
        orderId: order._id,
      });
    }
  }
  return { delivered, simulated };
}
