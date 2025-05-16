export type RootStackParamList = {
  // Pages de connexion
  Splash: undefined;
  Connection: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  WelcomeInfluenceur: undefined;
  WelcomeCommercant: undefined;

  // Pages d'inscription
  RegistrationStepOne: undefined;
  InterestStep: undefined;
  SocialConnect: undefined;
  PortfolioStep: undefined;
  RegistrationComplete: undefined;
  ValidateIncription: undefined;

  // Pages des influenceurs
  DealsInfluenceur: undefined;
  DealDetailsInfluenceur: { dealId: string };
  DealsSeeMoreInfluenceur: undefined;
  SaveDealsInfluenceur: undefined;
  SuivisDealsInfluenceur: undefined;
  DiscussionInfluenceur: undefined;
  ChatInfluenceur: { conversationId: string };
  NotificationInfluenceur: undefined;
  ProfileInfluenceur: undefined;
  ReviewInfluenceur: undefined;
  PostDetailsInfluenceur: { postId: string };

  // Pages des commerçants
  DashboardCommercant: undefined;
  DealsCommercant: undefined;
  DealCandidatesCommercant: { dealId: string };
  DealDetailsCommercant: { dealId: string };
  MerchantDetailCommercant: { merchantId: string };
  DiscussionCommercant: undefined;
  ChatCommercant: { conversationId: string };
  NotificationCommercant: undefined;
  ProfileCommercant: undefined;
  ProfilPublicCommercant: { merchantId: string };
  ReviewCommercant: undefined;
}; 