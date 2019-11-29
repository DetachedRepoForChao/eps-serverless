import { ID, guid } from '@datorama/akita';

export type FeedcardModel = {
  id: ID;
  feedcardId: number;
  createdAt: any;
  createUser: string;
  description: string;
};

export function createFeedcardModel({ feedcardId, createdAt, createUser, description }: Partial<FeedcardModel>) {

  return {
    id: guid(),
    feedcardId,
    description,
    createdAt,
    createUser,
  } as FeedcardModel;
}
