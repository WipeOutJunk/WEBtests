export class CreateAttemptDto {
    readonly answers: Record<string, number>;
    readonly participantName?: string;
  }