import { z } from "zod";

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
  kakaoId: z.string().nullish(),
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
