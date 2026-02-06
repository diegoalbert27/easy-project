export type DepositResult = {
  status: string;
  transactionHash: string;
  blockNumber: number;
  amount: number;
  from: string;
  to: string;
};
