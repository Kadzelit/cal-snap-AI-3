import { z } from "zod";

export const BodyAnalysisSchema = z.object({
  body_fat_pct: z.number().min(1).max(70),
  lean_mass_pct: z.number().min(30).max(99),
  category: z.string().min(1),
  description: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export type BodyAnalysisInput = z.infer<typeof BodyAnalysisSchema>;
