const required = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

export const serverEnv = {
  get apiBaseUrl() {
    return required("API_BASE_URL", process.env.API_BASE_URL);
  },
  get authCookieName() {
    return process.env.AUTH_COOKIE_NAME ?? "gearup_token";
  },
};

export const publicEnv = {
  stripeKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
