export type PaymentProvider = 'CBE' | 'TELEBIRR' | 'OTHER';
export type PaymentStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'REFUND_PENDING' | 'REFUNDED';
export interface PaymentProof {
  id: number;
  reservationId: number;
  userId: number;
  gameId: number;
  amount: number;
  provider: PaymentProvider;
  transactionReference: string;
  proofUrl?: string;
  status: PaymentStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  reviewNote?: string;
}
export interface SubmitPaymentProofDto { reservationId: number; provider: PaymentProvider; transactionReference: string; proofUrl: string; }
export interface PaymentReviewDto { note?: string; }
