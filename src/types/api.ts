import type { PaymentStatus, RentalStatus } from "@/constants/status";

export type { PaymentStatus, RentalStatus };

export type Meta = {
  page: number;
  limit: number;
  total: number;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  meta?: Meta;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  errorDetails?: unknown;
};

export type ZodIssue = {
  path: (string | number)[];
  message: string;
  code?: string;
};

export type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PersonSummary = {
  id: string;
  name: string;
  email?: string;
};

export type CategorySummary = {
  id: string;
  name: string;
};

/** `pricePerDay` is a Prisma Decimal and arrives as a string — use `money()`. */
export type GearItem = {
  id: string;
  name: string;
  description: string | null;
  brand: string | null;
  pricePerDay: string;
  stock: number;
  images: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  providerId: string;
  category?: CategorySummary;
  provider?: PersonSummary;
};

export type GearSummary = {
  id: string;
  name: string;
  brand?: string | null;
};

export type RentalItem = {
  id: string;
  quantity: number;
  days: number;
  pricePerDay: string;
  subtotal: string;
  createdAt: string;
  rentalOrderId: string;
  gearItemId: string;
  gearItem?: GearSummary;
};

export type RentalOrder = {
  id: string;
  status: RentalStatus;
  startDate: string;
  endDate: string;
  totalPrice: string;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  customer?: PersonSummary;
  items: RentalItem[];
  /** One-to-one in Prisma, so this is a single record and not a list. */
  payment?: Payment | null;
};

export type OrderSummary = {
  id: string;
  status: RentalStatus;
  startDate: string;
  endDate: string;
  totalPrice: string;
};

export type Payment = {
  id: string;
  amount: string;
  provider: "STRIPE";
  transactionId: string | null;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  rentalOrderId: string;
  customerId: string;
  rentalOrder?: OrderSummary;
};

export type PaymentIntentPayload = {
  clientSecret: string | null;
  payment: Payment;
};

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  gearItemId: string;
  customerId: string;
  rentalOrderId: string;
  customer?: PersonSummary;
};

export type GearReviews = {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
};
