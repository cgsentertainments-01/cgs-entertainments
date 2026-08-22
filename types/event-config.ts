// types/event-config.ts

export type CustomFieldType =
  | "text"
  | "number"
  | "date"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "file"
  | "video";

export type DocumentUploadType =
  | "file"
  | "video"
  | "audio"
  | "image"
  | "document";

export interface BasicParticipantFieldConfig {
  id: string; // 'fullName' | 'dob' | 'gender' | 'phone' | 'email' | 'address' | 'photo'
  label: string;
  enabled: boolean;
  required: boolean;
  order: number;
}

export interface CustomFieldConfig {
  id: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[]; // for dropdown & radio types
  order: number;
}

export interface ParticipationTypeConfig {
  id: string;
  name: string; // e.g. "Solo", "Duo", "Trio", "Group", "Solo Vocal", "Band"
  minParticipants: number; // e.g. 1 for Solo, 2 for Duo, 4 for Group
  maxParticipants: number; // e.g. 1 for Solo, 2 for Duo, 10 for Group
  fee: number; // Configurable registration fee in INR
  isActive: boolean;
  order: number;
}

export interface TeamSettingsConfig {
  allowTeamName: boolean;
  teamNameRequired: boolean;
  allowTeamLeader: boolean;
  teamLeaderRequired: boolean;
  allowTeamContact: boolean;
  teamContactRequired: boolean;
}

export interface DocumentConfig {
  id: string;
  name: string; // e.g. "Passport-size Photo", "Aadhaar Card", "Dance Video"
  uploadType: DocumentUploadType;
  required: boolean;
  maxSizeMB: number;
  allowedFileTypes: string; // e.g. ".jpg,.jpeg,.png", ".mp4,.mov", ".pdf,.jpg"
  order: number;
}

export interface EventFormConfig {
  basicFields: BasicParticipantFieldConfig[];
  customFields: CustomFieldConfig[];
  participationTypes: ParticipationTypeConfig[];
  teamSettings: TeamSettingsConfig;
  documents: DocumentConfig[];
}

/**
 * Returns a robust default EventFormConfig tailored to the event category
 * if an event does not have a customized form_config saved.
 */
export function getDefaultFormConfig(category?: string): EventFormConfig {
  const cat = (category || "Dance").toLowerCase();

  let participationTypes: ParticipationTypeConfig[] = [];
  if (cat.includes("dance")) {
    participationTypes = [
      { id: "solo", name: "Solo", minParticipants: 1, maxParticipants: 1, fee: 500, isActive: true, order: 1 },
      { id: "duo", name: "Duo", minParticipants: 2, maxParticipants: 2, fee: 800, isActive: true, order: 2 },
      { id: "trio", name: "Trio", minParticipants: 3, maxParticipants: 3, fee: 1000, isActive: true, order: 3 },
      { id: "group", name: "Group", minParticipants: 4, maxParticipants: 10, fee: 2000, isActive: true, order: 4 },
    ];
  } else if (cat.includes("singing") || cat.includes("music")) {
    participationTypes = [
      { id: "solo", name: "Solo Vocal", minParticipants: 1, maxParticipants: 1, fee: 600, isActive: true, order: 1 },
      { id: "duet", name: "Duet", minParticipants: 2, maxParticipants: 2, fee: 1000, isActive: true, order: 2 },
      { id: "band", name: "Group Band", minParticipants: 3, maxParticipants: 8, fee: 2500, isActive: true, order: 3 },
    ];
  } else {
    participationTypes = [
      { id: "solo", name: "Solo", minParticipants: 1, maxParticipants: 1, fee: 500, isActive: true, order: 1 },
      { id: "group", name: "Group", minParticipants: 2, maxParticipants: 6, fee: 1500, isActive: true, order: 2 },
    ];
  }

  const basicFields: BasicParticipantFieldConfig[] = [
    { id: "fullName", label: "Full Name", enabled: true, required: true, order: 1 },
    { id: "dob", label: "Date of Birth", enabled: true, required: true, order: 2 },
    { id: "gender", label: "Gender", enabled: true, required: true, order: 3 },
    { id: "phone", label: "Phone Number", enabled: true, required: true, order: 4 },
    { id: "email", label: "Email Address", enabled: true, required: true, order: 5 },
    { id: "address", label: "Address", enabled: true, required: true, order: 6 },
    { id: "photo", label: "Passport-size Photo", enabled: true, required: true, order: 7 },
  ];

  let customFields: CustomFieldConfig[] = [];
  if (cat.includes("dance")) {
    customFields = [
      {
        id: "danceStyle",
        label: "Dance Style",
        type: "dropdown",
        required: true,
        options: ["Classical", "Hip Hop", "Western", "Contemporary", "Bollywood", "Folk"],
        order: 1,
      },
      {
        id: "performanceTitle",
        label: "Performance Track Title",
        type: "text",
        required: true,
        order: 2,
      },
    ];
  } else if (cat.includes("singing") || cat.includes("music")) {
    customFields = [
      {
        id: "singingLanguage",
        label: "Singing Language",
        type: "dropdown",
        required: true,
        options: ["Hindi", "Telugu", "Tamil", "English", "Kannada", "Malayalam"],
        order: 1,
      },
      {
        id: "songTitle",
        label: "Song Title",
        type: "text",
        required: true,
        order: 2,
      },
    ];
  } else {
    customFields = [
      {
        id: "performanceType",
        label: "Performance Category",
        type: "text",
        required: false,
        order: 1,
      },
    ];
  }

  let documents: DocumentConfig[] = [];
  if (cat.includes("dance")) {
    documents = [
      {
        id: "photo",
        name: "Passport-size Photo",
        uploadType: "image",
        required: true,
        maxSizeMB: 5,
        allowedFileTypes: ".jpg,.jpeg,.png",
        order: 1,
      },
      {
        id: "idProof",
        name: "Aadhaar Card / ID Proof",
        uploadType: "document",
        required: true,
        maxSizeMB: 10,
        allowedFileTypes: ".pdf,.jpg,.jpeg,.png",
        order: 2,
      },
      {
        id: "danceVideo",
        name: "Dance Audition Video",
        uploadType: "video",
        required: true,
        maxSizeMB: 100,
        allowedFileTypes: ".mp4,.mov,.webm",
        order: 3,
      },
    ];
  } else if (cat.includes("singing") || cat.includes("music")) {
    documents = [
      {
        id: "photo",
        name: "Passport-size Photo",
        uploadType: "image",
        required: true,
        maxSizeMB: 5,
        allowedFileTypes: ".jpg,.jpeg,.png",
        order: 1,
      },
      {
        id: "idProof",
        name: "Aadhaar Card / ID Proof",
        uploadType: "document",
        required: true,
        maxSizeMB: 10,
        allowedFileTypes: ".pdf,.jpg,.jpeg,.png",
        order: 2,
      },
      {
        id: "performanceVideo",
        name: "Performance Video / Audio Track",
        uploadType: "video",
        required: true,
        maxSizeMB: 100,
        allowedFileTypes: ".mp4,.mov,.mp3,.wav",
        order: 3,
      },
    ];
  } else {
    documents = [
      {
        id: "photo",
        name: "Passport-size Photo",
        uploadType: "image",
        required: true,
        maxSizeMB: 5,
        allowedFileTypes: ".jpg,.jpeg,.png",
        order: 1,
      },
      {
        id: "idProof",
        name: "Aadhaar Card / ID Proof",
        uploadType: "document",
        required: true,
        maxSizeMB: 10,
        allowedFileTypes: ".pdf,.jpg,.jpeg,.png",
        order: 2,
      },
    ];
  }

  const teamSettings: TeamSettingsConfig = {
    allowTeamName: true,
    teamNameRequired: true,
    allowTeamLeader: true,
    teamLeaderRequired: true,
    allowTeamContact: true,
    teamContactRequired: true,
  };

  return {
    basicFields,
    customFields,
    participationTypes,
    teamSettings,
    documents,
  };
}
