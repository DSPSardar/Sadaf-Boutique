import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(2, "Slug is too short")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

const csv = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : v),
    z.array(z.string().min(1).max(max)).default([])
  );

export const colorSchema = z.object({
  name: z.string().trim().min(1, "Colour name").max(40),
  family: z.string().trim().min(1).max(20),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Hex colour like #7A2E2E"),
});

export const productSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(140),
    slug,
    sku: z.string().trim().min(2, "SKU is required").max(40),
    categoryId: z.string().uuid("Pick a category"),
    price: z.coerce.number().int().min(0, "Price must be 0 or more"),
    compareAtPrice: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.number().int().min(0).optional()),
    description: z.string().trim().max(2000).default(""),
    fabric: z.string().trim().max(120).default(""),
    work: z.string().trim().max(200).default(""),
    pieces: csv(60),
    care: z.string().trim().max(300).default(""),
    sizes: csv(20),
    colors: z.preprocess((v) => (typeof v === "string" ? JSON.parse(v || "[]") : v), z.array(colorSchema).default([])),
    occasion: csv(30),
    tags: csv(40),
    isNew: z.preprocess((v) => v === "on" || v === true || v === "true", z.boolean()).default(false),
    featuredRank: z.coerce.number().int().min(0).max(100000).default(1000),
    stock: z.coerce.number().int().min(0).default(0),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
  })
  .refine((p) => p.compareAtPrice === undefined || p.compareAtPrice > p.price, {
    message: "Compare-at price must be higher than the price",
    path: ["compareAtPrice"],
  });

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  label: z.string().trim().min(2).max(60),
  slug,
  description: z.string().trim().max(300).default(""),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;

/** Flattens zod issues into { field: message } for inline form errors. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
