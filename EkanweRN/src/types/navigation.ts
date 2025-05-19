export type RootStackParamList = {
  // Pages de connexion
  Splash: undefined;
  Connection: undefined;
  WelcomeInfluenceur: undefined;
  WelcomeCommercant: undefined;
  CreatorTypeInfluenceur: undefined;
  ConceptInfluenceur: undefined;
  LoginOrConnect: undefined;
  Login: undefined;
  Register: undefined;
  ValidateInscription: undefined;
  RegistrationStepOne: undefined;
  InterestStep: undefined;
  SocialConnect: undefined;
  PortfolioStep: undefined;
  RegistrationComplete: undefined;
  DealsInfluenceur: undefined;
  SuivisDealsInfluenceur: undefined;
  DiscussionInfluenceur: undefined;
  SaveDealsInfluenceur: undefined;
  ProfileInfluenceur: undefined;
  ChatInfluenceur: {
    chatId: string;
    pseudonyme?: string;
    photoURL?: string;
    role: string;
  };
  DealDetailsInfluenceur: { dealId: string };
  DealsSeeMoreInfluenceur: { dealId: string };
  ReviewCommercant: {dealId: string}
  ReviewScreen: { dealId: string };
  ConceptCommercant: undefined;
  CreatorCommercant: undefined;
  DealsCommercant: undefined;
  ForgotPassword: undefined;
  DealsCreation: undefined;
  MerchantDetailCommercant: undefined;
  DealCandidatesCommercant: { dealId: string };
  DealsCreationCommercant: undefined;
  ProfileCommercant: undefined;
  DealsDetailsCommercant: { dealId: string; influenceurId: string };
  SuiviDealsCommercant: undefined;
  DiscussionCommercant: undefined;
  DashboardCommercant: undefined;
  NotificationInfluenceur: undefined;
  NotificationsCommercant: undefined;
  //ProfilPublicCommercant: { userId: string };
  BottomNavbar: undefined;
  Chat: {
    chatId: string;
    pseudonyme?: string;
    photoURL?: string;
  };
  ProfilPublic: { userId: string }
}; 