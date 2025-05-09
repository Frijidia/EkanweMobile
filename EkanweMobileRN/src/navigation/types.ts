export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  InterestStep: undefined;
  PortfolioStep: undefined;
  RegistrationComplete: undefined;
  RegistrationStepOne: undefined;
  SocialConnect: undefined;
  ValidateInscription: undefined;
};

export type MerchantStackParamList = {
  Dashboard: undefined;
  Deals: undefined;
  DealDetails: { dealId: string };
  DealCandidates: { dealId: string };
  Profile: undefined;
  MerchantDetail: { merchantId: string };
  Discussion: { chatId: string };
  Notifications: undefined;
  Reviews: undefined;
  FollowingDeals: undefined;
};

export type InfluencerStackParamList = {
  Dashboard: undefined;
  Profile: undefined;
  PublicProfile: { influencerId: string };
  Deals: undefined;
  DealDetails: { dealId: string };
  Messages: undefined;
  Notifications: undefined;
};

export type EkanweStackParamList = {
  Dashboard: undefined;
  Users: undefined;
  Deals: undefined;
  Reports: undefined;
  Settings: undefined;
}; 