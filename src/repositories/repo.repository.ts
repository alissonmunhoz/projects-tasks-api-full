import { Repo } from '../models/Repo';

export class RepoRepository {
  findByHtmlUrl(htmlUrl: string) { return Repo.findOne({ where: { htmlUrl } }); }
  create(data: { projectId: string; name: string; htmlUrl: string; description?: string; language?: string; stargazersCount?: number; pushedAt?: Date | null; }) {
    return Repo.create(data as any);
  }
  updateById(id: string, data: Partial<Repo>) { return Repo.update(data, { where: { id } }); }
  findAllByProject(projectId: string) { return Repo.findAll({ where: { projectId } }); }
}
