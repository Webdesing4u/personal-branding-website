import { z } from 'zod';

// Shared Zod schemas — imported by BOTH client forms and API routes,
// so frontend & backend validation can never drift apart.

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().email('Valid email required').max(150),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  recaptchaToken: z.string().min(1, 'reCAPTCHA token missing'),
});
export type ContactInput = z.infer<typeof contactSchema>;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const blogPostSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().regex(slugRegex, 'Lowercase letters, numbers and hyphens only').max(220),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  featuredImage: z.string().url().optional().or(z.literal('')),
  status: z.enum(['draft', 'published']),
  // Locked decision: category is REQUIRED for posts (enforced both sides)
  categoryId: z.string({ required_error: 'Category is required' }).uuid('Category is required'),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(160, 'Max 160 characters for meta description').optional(),
  tagIds: z.array(z.string().uuid()).default([]),
});
export type BlogPostInput = z.infer<typeof blogPostSchema>;

export const projectSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().regex(slugRegex).max(220),
  shortDescription: z.string().max(500).optional(),
  fullDescription: z.string().optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  projectUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  techStack: z.array(z.string().max(50)).max(20).default([]),
  categoryId: z.string().uuid().optional().nullable(),
  isFeatured: z.boolean().default(false),
  status: z.enum(['draft', 'published']),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const ventureSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z.string().regex(slugRegex).max(220),
  industry: z.string().max(150).optional(),
  description: z.string().optional(),
  role: z.string().max(150).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  status: z.enum(['active', 'growing', 'acquired', 'exited']),
  categoryId: z.string().uuid().optional().nullable(),
  isFeatured: z.boolean().default(false),
  // ISO dates from <input type="date"> — empty string means "not set"
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
});
export type VentureInput = z.infer<typeof ventureSchema>;

export const gallerySchema = z.object({
  title: z.string().trim().max(150).optional(),
  imageUrl: z.string().url('Must be a valid image URL'),
  category: z.string().trim().max(100).optional(),
  displayOrder: z.number().int().min(0).default(0),
});
export type GalleryInput = z.infer<typeof gallerySchema>;

export const messageUpdateSchema = z.object({
  isRead: z.boolean(),
});

