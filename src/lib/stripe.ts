import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { publicEnv } from "@/lib/env";

/**
 * The repo ships with a placeholder key, so check the shape before loading —
 * a bad key makes Elements fail at mount with a console error and nothing on
 * screen, which is much harder to diagnose than an explicit notice.
 */
export const stripeConfigured = /^pk_(test|live)_[A-Za-z0-9]{20,}$/.test(
  publicEnv.stripeKey,
);

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe() {
  if (!stripeConfigured) {
    return null;
  }
  stripePromise ??= loadStripe(publicEnv.stripeKey);
  return stripePromise;
}

/** Elements renders in an iframe and cannot read our CSS variables. */
export function stripeAppearance(dark: boolean) {
  return {
    theme: dark ? ("night" as const) : ("stripe" as const),
    variables: {
      colorPrimary: dark ? "#fb923c" : "#f97316",
      colorBackground: dark ? "#111a2e" : "#ffffff",
      colorText: dark ? "#e2e8f0" : "#0f172a",
      colorDanger: "#ef4444",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: "10px",
    },
  };
}
