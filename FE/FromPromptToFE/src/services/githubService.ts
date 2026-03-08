import api from "./api";

export interface PushToGitHubPayload {
  projectId: string;
  repoName: string;
  branch: string;
  commitMessage: string;
}

export interface PushResultDto {
  repoUrl: string;
  branch: string;
  filesCommitted: number;
  ownerLogin: string;
}

const githubService = {
  push: (payload: PushToGitHubPayload) => {
    return api.post<{ content: PushResultDto }>("/api/github/push", payload);
  },
};

export default githubService;
