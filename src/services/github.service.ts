import axios from 'axios';
import Redis from 'ioredis';
import { RepoRepository } from '../repositories/repo.repository';
import { ProjectService } from './project.service';

export class GithubService {
  private redis?: Redis;

  constructor(
    private repos = new RepoRepository(),
    private projects = new ProjectService(),
  ) {
    if (process.env.REDIS_HOST) {
      this.redis = new Redis({ host: process.env.REDIS_HOST, port: +(process.env.REDIS_PORT || 6379) });
    }
  }

  private async getGithubRepos(username: string) {
    console.log('Getting github repos for', username);
    const headers: Record<string, string> = { 'User-Agent': 'projects-tasks-api' };
    console.log('headers before token:', headers);
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const { data } = await axios.get(`https://api.github.com/users/${username}/repos`, 
    );

    console.log('data from github:', data);
    return (data as any[]).slice(0, 5);
  }

  async fetchAndLink(userId: string, projectId: string, username: string) {
    const project = await this.projects.getOwned(projectId, userId);



    const cacheKey = `gh:${username}:last5`;
    let reposData: any[] | null = null;

    console.log('cacheKey:', cacheKey);

    if (this.redis) {
      console.log('checking cache...');
      const cached = await this.redis.get(cacheKey);
      console.log('cached:', cached);
      if (cached) reposData = JSON.parse(cached);
    }


    console.log('testes');

    if (!reposData) {
        console.log('fetching from github...');
        console.log('username:', username);
      reposData = await this.getGithubRepos(username);
      console.log('fetched:', reposData);
      if (this.redis) await this.redis.set(cacheKey, JSON.stringify(reposData), "EX", 300);
    }

    console.log('reposData:', reposData);

    for (const r of reposData) {  
      const payload = {
        projectId: project.id,
        name: r.name,
        htmlUrl: r.html_url,
        description: r.description,
        language: r.language,
        stargazersCount: r.stargazers_count,
        pushedAt: r.pushed_at ? new Date(r.pushed_at) : null,
      };
      console.log('payload:', payload);
      const existing = await this.repos.findByHtmlUrl(payload.htmlUrl);
          console.log('exist:', existing);
      if (existing) await this.repos.updateById(existing.id, payload as any);
      else await this.repos.create(payload);
    }

    return this.repos.findAllByProject(project.id);
  }
}
