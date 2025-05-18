//export interface Deal {
//  id: string;
//  title: string;
//  description: string;
//  imageUrl: string;
//  locationName: string;
//  locationCoords?: {
//    lat: number;
//    lng: number;
//  };
//  status: 'active' | 'inactive' | 'completed';
//  createdAt: any; // Firestore Timestamp
//  merchantId: string;
//  typeOfContent?: string;
//  validUntil?: string;
//  conditions?: string;
//  interests?: string[];
//  candidatures?: Array<{
//    influenceurId: string;
//    status: 'Envoyé' | 'Accepté' | 'Approbation' | 'Terminé' | 'Refusé';
//    proofs?: Array<{
//      image: string;
//      likes: number;
//      shares: number;
//      isValidated: boolean;
//    }>;
//    review?: {
//      comment: string;
//      rating: number;
//    };
//  }>;
//} 