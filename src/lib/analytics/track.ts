import type { ObrasRdAnalyticsEventName, ObrasRdAnalyticsPayload } from "@/lib/analytics/events";

type GenericPayload = Record<string, unknown>;

type AnalyticsWindow = Window & {
  plausible?: (eventName: string, options?: { props?: GenericPayload }) => void;
  analytics?: { track?: (eventName: string, payload?: GenericPayload) => void };
};

const compactPayload = <TPayload extends GenericPayload>(payload: TPayload): GenericPayload =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );

export const trackObrasRdEvent = <TEventName extends ObrasRdAnalyticsEventName>(
  eventName: TEventName,
  payload: ObrasRdAnalyticsPayload<TEventName>,
) => {
  if (typeof window === "undefined") return;

  const analyticsWindow = window as AnalyticsWindow;
  const compacted = compactPayload(payload as GenericPayload);

  if (typeof analyticsWindow.plausible === "function") {
    analyticsWindow.plausible(eventName, { props: compacted });
    return;
  }

  if (typeof analyticsWindow.analytics?.track === "function") {
    analyticsWindow.analytics.track(eventName, compacted);
  }
};
