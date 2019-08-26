import { ID, guid } from '@datorama/akita';

export type EntityUserModel = {
  id: ID;
  username: string;
  avatarBase64String: string;
  avatarPath: string;
  avatarResolvedUrl: string;
  dateModified: any;
};

export function createEntityUserModel({ username, avatarBase64String, avatarPath, avatarResolvedUrl }: Partial<EntityUserModel>) {
  return {
    id: guid(),
    username,
    avatarBase64String,
    avatarPath,
    avatarResolvedUrl,
    dateModified: Date.now(),
  } as EntityUserModel;
}
