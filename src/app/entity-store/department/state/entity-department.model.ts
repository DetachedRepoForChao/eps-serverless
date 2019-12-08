import { ID, guid } from '@datorama/akita';


export type EntityDepartmentModel = {
  id: ID;
  departmentId: number;
  name: string;
  dateAdded: any;
};

export function createEntityDepartmentModel({ departmentId, name }: Partial<EntityDepartmentModel>) {
  return {
    id: guid(),
    departmentId,
    name,
    dateAdded: Date.now(),
  } as EntityDepartmentModel;
}
