import { UserSummary } from '../types';

// Extracts raw ObjectId string and optional populated UserSummary from a ref field
export function extractUserRef(ref: unknown): { id: string; summary?: UserSummary } {
  if (ref && typeof ref === 'object' && '_id' in ref && ('name' in ref || 'email' in ref || 'role' in ref)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const populated = ref as any;
    const id = populated._id.toString();
    return {
      id,
      summary: {
        _id: id,
        name: populated.name,
        ...(populated.email ? { email: populated.email } : {}),
        ...(populated.role ? { role: populated.role } : {}),
      },
    };
  }
  return { id: ref ? ref.toString() : '' };
}
