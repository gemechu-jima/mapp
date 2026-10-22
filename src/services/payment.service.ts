import { api } from './api';
import type { PaymentProof, SubmitPaymentProofDto, PaymentReviewDto } from '@/types/payment';

export const PaymentService = {
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
    return (await api.post(`/reservations/${id}/restore`)).data;
  },
};
