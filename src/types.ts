export type ConversionOption = "conservative" | "realistic" | "strong" | "custom";

export interface CalculatorInputs {
  revenueGoal: number;
  averageOrderValue: number;
  emailList: number;
  smsList: number;
  igBroadcast: number;
  waitlistVip: number;
  otherDirect: number;
  followerCount: number;
  daysUntilLaunch: number;
  conversionOption: ConversionOption;
  customConversion: number;
}

export interface CalculatorResults {
  totalWarmReach: number;
  conversionRate: number;
  requiredOrders: number;
  requiredWarmBuyers: number;
  soldOutGap: number;
  projectedOrders: number;
  projectedRevenue: number;
  dailySignupTarget: number;
  coverageRatio: number;
  warmAudienceRatio: number;
  hasFollowers: boolean;
  isValid: boolean;
}

export type ConfidenceLevel = "strong" | "close" | "at-risk" | "high-risk";

export interface ConfidenceBadgeData {
  level: ConfidenceLevel;
  label: string;
  message: string;
}
