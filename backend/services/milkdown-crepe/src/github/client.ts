import { Octokit } from '@octokit/rest';

export function createOctokit(token?: string){
  return new Octokit({ auth: token || process.env.GITHUB_TOKEN });
}

export default createOctokit;
