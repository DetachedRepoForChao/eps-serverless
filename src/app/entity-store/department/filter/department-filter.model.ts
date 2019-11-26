export enum VISIBILITY_FILTER {
  SHOW_COMPLETED = 'SHOW_COMPLETED',
  SHOW_ACTIVE = 'SHOW_ACTIVE',
  SHOW_ALL = 'SHOW_ALL'
}

// tslint:disable-next-line: interface-over-type-literal
export type DepartmentFilterModel = {
  label: string;
  value: VISIBILITY_FILTER;
};

export const initialFilters: DepartmentFilterModel[] = [
  { label: 'All', value: VISIBILITY_FILTER.SHOW_ALL },
  { label: 'Completed', value: VISIBILITY_FILTER.SHOW_COMPLETED },
  { label: 'Active', value: VISIBILITY_FILTER.SHOW_ACTIVE }
];