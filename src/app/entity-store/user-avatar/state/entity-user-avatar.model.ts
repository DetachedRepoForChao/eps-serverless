import { ID, guid } from '@datorama/akita';

export type EntityUserAvatarModel = {
  id: ID;
  username: string;
  avatarBase64String: string;
  avatarPath: string;
  avatarResolvedUrl: string;
  dateModified: any;
};

export function createEntityUserAvatarModel({ username, avatarBase64String, avatarPath, avatarResolvedUrl }: Partial<EntityUserAvatarModel>) {
  return {
    id: guid(),
    username,
    avatarBase64String,
    avatarPath,
    avatarResolvedUrl,
    dateModified: Date.now(),
  } as EntityUserAvatarModel;
}
