import { z } from "zod";

import { PROVIDERS } from "../types/providers";
import { API_ERROR_CODES } from "../types/errors";

export const providerIdSchema = z.enum(PROVIDERS);

export const NonEmptyString = z.string().trim().min(1);

export const apiErrorSchema = z.object({
  code: z.enum(API_ERROR_CODES),
  message: NonEmptyString,
});
