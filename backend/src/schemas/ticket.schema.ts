import { z } from 'zod';

const statusEnum = z.enum(['Open', 'In-Progress', 'On-Hold', 'Resolved', 'Closed']);
const priorityEnum = z.enum(['Low', 'Medium', 'High', 'Critical']);
const categoryEnum = z.enum([
  'Technical Support',
  'Billing',
  'General Enquiry',
  'Bug Report',
  'Feature Request',
]);

export const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  category: categoryEnum,
  priority: priorityEnum.optional(),
});

export const updateTicketSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    category: categoryEnum.optional(),
    priority: priorityEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });

export const updateStatusSchema = z.object({
  status: statusEnum,
});

export const updatePrioritySchema = z.object({
  priority: priorityEnum,
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type UpdatePriorityInput = z.infer<typeof updatePrioritySchema>;
