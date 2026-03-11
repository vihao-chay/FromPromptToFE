
export enum ProjectStatus {
  ACTIVE = 'Active',
  DRAFT = 'Draft',
  COMPLETED = 'Completed',
  ARCHIVED = 'Archived',
  STABLE = 'Stable',
  IN_PROGRESS = 'In Progress'
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  imageUrl: string;
  generatedHtml?: string;
  organizationId?: string;
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  status: ProjectStatus;
}
