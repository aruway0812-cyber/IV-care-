
export enum Department {
  ER = '急診室',
  ICU = '加護病房',
  GENERAL = '一般病房',
  OR = '手術室',
  OUTPATIENT = '門診',
}

export type PatientAgeGroup = '新生兒' | '兒童' | '成人' | '高齡者';
export type InjectionSite = '手背' | '前臂' | '肘窩 (ACF)' | '足部' | '其他';
export type NeedleSize = '18G' | '20G' | '22G' | '24G' | 'Safety Needle';

export interface SurveyResponse {
  id: string;
  timestamp: string;
  department: Department;
  experienceYears: number;
  recommender?: string; // 新增推薦人
  patientAgeGroup: PatientAgeGroup;
  injectionSite: InjectionSite;
  needleSize: NeedleSize;
  confidenceLevel: number; // 1-5
  techniqueRating: number; // 1-5
  equipmentQuality: number; // 1-5
  patientCooperation: number; // 1-5
  painManagement: number; // 1-5
  environmentStress: number; // 1-5
  topChallenges: string[];
  feedbackText: string;
}

export interface AIAnalysis {
  summary: string;
  keyIssues: string[];
  recommendations: string[];
}
