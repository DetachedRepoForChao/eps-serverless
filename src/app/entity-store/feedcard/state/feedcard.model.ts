import { ID, guid } from '@datorama/akita';

export type FeedcardModel={
  id : ID;
  feedcardId : number;
  createAt:any;
  createUser:string;
  description:string;
}

export function CreateFeedcardModel({ feedcardId, createAt, createUser, description }: Partial<FeedcardModel>) {

  return {
    id: guid(),
    feedcardId,
    description,
    createAt,
    createUser,
  } as FeedcardModel;
}
