import { z } from 'zod'

export const emailSchema = z.string().email()

export const phoneSchema = z.string()
