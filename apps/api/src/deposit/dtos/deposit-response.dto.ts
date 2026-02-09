export class DepositResponseDto {
  status: number;
  message: string;
  data?: {
    depositId: string;
  };
  error?: string;
}
