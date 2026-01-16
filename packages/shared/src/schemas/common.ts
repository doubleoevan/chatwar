import { z } from "zod";

import { PROVIDERS } from "../types/providers";

export const providerIdSchema = z.enum(PROVIDERS);

export const NonEmptyString = z.string().trim().min(1);

export const apiErrorSchema = z.object({
  code: NonEmptyString,
  message: NonEmptyString,
});
