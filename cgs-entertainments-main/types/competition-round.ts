// types/competition-round.ts

export type RoundStatus = 'draft' | 'active' | 'upcoming' | 'completed';

export type ParticipantRoundStatus =
  | 'pending'
  | 'qualified'
  | 'eliminated'
  | 'withdrawn'
  | 'winner'
  | 'runner_up'
  | 'finalist';

export interface CompetitionRound {
  id: string;
  event_id: string;
  name: string;
  round_number: number;
  status: RoundStatus;
  round_date?: string | null;
  fee?: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  participant_count?: number;
}

export interface CompetitionRoundParticipant {
  id: string;
  round_id: string;
  registration_id: string;
  status: ParticipantRoundStatus;
  result_notes?: string | null;
  promoted_at?: string;
  created_at?: string;
  updated_at?: string;

  // Joined registration & participant info
  registration_number?: string;
  participant_number?: string;
  participant_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  participation_type?: string;
  team_name?: string | null;
  team_leader?: string | null;
  team_contact?: string | null;
  participant_count?: number;
  additional_participants?: any[];
  video_url?: string | null;
}

export interface ParticipantRoundProgression {
  round_id: string;
  round_number: number;
  round_name: string;
  round_status: RoundStatus;
  round_date?: string | null;
  participant_status: ParticipantRoundStatus;
  result_notes?: string | null;
  promoted_at?: string | null;
}

export interface PromoteParticipantsPayload {
  registration_ids: string[];
  target_round_id?: string; // Optional if targeting next round by sequence
}
