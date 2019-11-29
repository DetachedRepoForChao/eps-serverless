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
  coreValues: string[];
  createdAt: any;
  dateModified: any;
  likes: any[];
  likedByCurrentUser: boolean;
};

export function createPointItemTransactionModel({ transactionId, type, amount, sourceUserId, targetUserId, pointItemId,
                                     description, coreValues, createdAt, likes, likedByCurrentUser }: Partial<PointItemTransactionModel>) {

  return {
    id: guid(),
    transactionId,
    type,
    amount,
    sourceUserId,
    targetUserId,
    pointItemId,
    description,
    coreValues,
    createdAt,
    likes,
    likedByCurrentUser,
    dateModified: Date.now()
  } as PointItemTransactionModel;
}
