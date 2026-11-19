import { api } from './api';
import type { PaymentProof, SubmitPaymentProofDto, PaymentReviewDto } from '@/types/payment';

export const PaymentService = {
  async checkReference(reference: string, options?: { reservationId?: string; gameId?: string }): Promise<{
    isUnique: boolean;
    detectedProvider: string | null;
    message: string;
    isPendingForCurrent?: boolean;
  }> {
    const params = new URLSearchParams();
    params.set('reference', reference);
    if (options?.reservationId) params.set('reservationId', options.reservationId);
    if (options?.gameId) params.set('gameId', options.gameId);
    return (await api.get(`/payments/check-reference?${params.toString()}`)).data;
  },
  async submitProof(data: SubmitPaymentProofDto): Promise<PaymentProof> {
    return (await api.post<PaymentProof>('/payments/proofs', data)).data;
  },
  async getAll(): Promise<PaymentProof[]> {
    return (await api.get<PaymentProof[]>('/payments')).data;
  },
  async getByReservation(id: number): Promise<PaymentProof[]> {
    return (await api.get<PaymentProof[]>(`/payments/reservations/${id}`)).data;
  },
  async verify(id: number, data: PaymentReviewDto = {}): Promise<PaymentProof> {
    return (await api.patch<PaymentProof>(`/payments/${id}/verify`, data)).data;
  },
  async reject(id: number, data: PaymentReviewDto): Promise<PaymentProof> {
    return (await api.patch<PaymentProof>(`/payments/${id}/reject`, data)).data;
  },
  async reportMistake(id: number, data: { reason: string }) {
    return (await api.post(`/payments/${id}/mistake-reports`, data)).data;
  },
  async restoreExpiredReservation(id: number): Promise<unknown> {
    return (await api.post(`/numbers/${id}/restore`)).data;
  },
};
