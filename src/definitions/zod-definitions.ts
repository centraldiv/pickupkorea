import { z } from "zod";
import { BuyOrderStatus, BuyOrderStatusArray } from "./statuses";

const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,20}$/;

const fullnameRegex = /^[A-Za-z]+( [A-Za-z]+)+$/;

const usernameRegex = /^[A-Za-z0-9]{4,15}$/;

export const RawSignUpSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .trim()
    .email("Invalid email address"),
  fullName: z
    .string({
      required_error: "English full Name is required",
    })
    .regex(fullnameRegex, {
      message: "Full Name must contain only English letters and spaces",
    })
    .trim(),
  username: z
    .string({
      required_error: "Username is required",
    })
    .min(4, { message: "Username must be at least 4 characters" })
    .max(15, { message: "Username must be less than 15 characters" })
    .regex(usernameRegex, {
      message: "Username must contain only English letters and numbers",
    })
    .trim(),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(20, { message: "Password must be less than 20 characters" })
    .regex(passwordRegex, {
      message:
        "Password must contain at least 8 characters, 1 letter and 1 number",
    })
    .trim(),
  confirmPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(20, { message: "Password must be less than 20 characters" })
    .trim(),
  country: z.string().trim(),
  kakaoId: z.string().trim().nullish(),
});

export const SignUpSchema = RawSignUpSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  }
);

export const LoginSchema = RawSignUpSchema.pick({
  password: true,
}).extend({
  login: z
    .string({
      required_error: "Username / Email is required",
    })
    .trim(),
});

export const AddressSchema = z.object({
  receiverName: z
    .string({ required_error: "Receiver name is required" })
    .trim(),
  phone: z.string({ required_error: "Receiver phone is required" }).trim(),
  email: z
    .string({ required_error: "Receiver email is required" })
    .email("Invalid email address")
    .trim(),
  street: z.string({ required_error: "Street is required" }).trim(),
  city: z.string({ required_error: "City is required" }).trim(),
  state: z.string({ required_error: "State is required" }).trim(),
  zipcode: z.string({ required_error: "Zip code is required" }).trim(),
  country: z.string({ required_error: "Country is required" }).trim(),
});

export const OrderAddressSchema = AddressSchema.extend({
  orderId: z.string({ required_error: "Order ID is required" }),
  id: z.string({ required_error: "Address ID is required" }),
});

export const ClientBuyItemSchema = z.object({
  href: z
    .string({ required_error: "Link to product is required" })
    .min(1, { message: "Link to product is required" })
    .trim(),
  memo: z.string().trim().optional(),
  option: z.string().trim().optional(),
  quantity: z.coerce
    .number({ required_error: "Quantity is required" })
    .min(1, { message: "Quantity must be at least 1" }),

  unboxingVideoRequested: z.boolean().default(false),
  unboxingPhotoRequested: z.boolean().default(false),
  isInclusion: z.boolean().default(false),
});

export const ClientPFItemSchema = ClientBuyItemSchema.extend({
  price: z.coerce
    .number({ required_error: "Price is required" })
    .min(0, { message: "Price must be greater than 0 KRW" })
    .optional(),
});

export const ClientBuyOrderSchema = z.object({
  shipRightAway: z.boolean().default(false),
  items: z.array(ClientBuyItemSchema).nonempty("Items are required"),
  userMemo: z.string().optional(),
  address: AddressSchema.nullish(),
  shippingMethodId: z.string().optional(),
});

export const ClientPFOrderSchema = ClientBuyOrderSchema.extend({
  shipRightAway: z.boolean().default(false),
  items: z.array(ClientPFItemSchema).nonempty("Items are required"),
});

export const CountrySchema = z.object({
  name: z.string().min(1, { message: "Country name is required" }).trim(),
  code: z.string().min(1, { message: "Country code is required" }).trim(),
  id: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const ShippingMethodSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Shipping method name is required" })
    .trim(),
  isActive: z.boolean().default(true),
  id: z.string().optional(),
});

export const AdminBuyOrderInfoSchema = z.object({
  orderId: z.string({ required_error: "Order ID is required" }),
  orderStatus: z.enum(BuyOrderStatusArray as [string, ...string[]]),
  userMemo: z.string().optional(),
  staffMemo: z.string().optional(),
  productInvoiceId: z.string().optional(),
  shipRightAway: z.boolean(),
  shippingMethod: ShippingMethodSchema.nullish(),
});

export const InvoiceSchema = z.object({
  name: z.string({ required_error: "Name is required" }),
  quantity: z.coerce
    .number({ required_error: "Quantity is required" })
    .min(1, { message: "Quantity must be at least 1" }),
  price: z.coerce.number({ required_error: "Price is required" }),
});
