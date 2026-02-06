export type TransactionLog = {
  address: string;
  blockHash: string;
  blockNumber: number;
  data: string;
  logIndex: number;
  topics: string[];
  transactionHash: string;
  transactionIndex: number;
};

export type TransactionHash = {
  blockHash: string;
  blockNumber: number;
  byzantium: boolean;
  confirmations: number;
  contractAddress?: string | null;
  cumulativeGasUsed: { BigNumber: string };
  effectiveGasPrice: { BigNumber: string };
  from: string;
  gasUsed: { BigNumber: string };
  logs: TransactionLog[];
  logsBloom: string;
  status: number;
  to?: string | null;
  transactionHash: string;
  transactionIndex: number;
  type: number;
};