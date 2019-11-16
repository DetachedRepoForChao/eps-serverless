import { ID, guid } from '@datorama/akita';

export type PointItemTransactionModel = {
  id: ID;
  transactionId: number;
  type: string;
  amount: number;
  sourceUserId: number;
  targetUserId: number;
  pointItemId: number;
  description: string;
  createdAt: any;
  dateModified: any;
};

export function createPointItemTransactionModel({ transactionId, type, amount, sourceUserId, targetUserId, pointItemId,
                                     description, createdAt }: Partial<PointItemTransactionModel>) {

  return {
    id: guid(),
    transactionId,
    type,
    amount,
    sourceUserId,
    targetUserId,
    pointItemId,
    description,
    createdAt,
    dateModified: Date.now()
  } as PointItemTransactionModel;
}
