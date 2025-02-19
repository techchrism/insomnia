import { LoaderFunction } from 'react-router-dom';

import { database } from '../../common/database';
import { SCRATCHPAD_ORGANIZATION_ID } from '../../models/organization';
import { Project } from '../../models/project';
import { organizationsData } from './organization';

export interface LoaderData {
  untrackedProjects: (Project & { workspacesCount: number })[];
}

export const loader: LoaderFunction = async () => {
  const { organizations } = organizationsData;
  const listOfOrganizationIds = [...organizations.map(o => o.id), SCRATCHPAD_ORGANIZATION_ID];

  const projects = await database.find<Project>('Project', {
    parentId: { $nin: listOfOrganizationIds },
  });

  const untrackedProjects = [];

  for (const project of projects) {
    const workspacesCount = await database.count('Workspace', {
      parentId: project._id,
    });

    untrackedProjects.push({
      ...project,
      workspacesCount,
    });
  }

  return {
    untrackedProjects,
  };
};
