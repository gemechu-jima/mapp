export type PaymentProvider = 'CBE' | 'TELEBIRR' | 'AWASH' | 'ABSINA' | 'OTHER';
export type PaymentStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'REFUND_PENDING' | 'REFUNDED';
export interface PaymentProof {
  id: number;
  reservationId: number;
  numberId?: number;
  userId: number;
  gameId: number;
  amount: number;
  provider: PaymentProvider | string;
  transactionReference: string | null;
  proofUrl?: string | null;
  status: PaymentStatus;
  submittedAt?: string;
  createdAt?: string;
  reviewedAt?: string | null;
  reviewedBy?: number | null;
  reviewNote?: string | null;
}
export interface SubmitPaymentProofDto {
  reservationId?: number;
  numberId?: number;
  provider: PaymentProvider | string;
  transactionReference: string;
  proofUrl?: string;
  proof?: { uri: string; name: string; type: string } | File;
}
export interface PaymentReviewDto { note?: string; }
