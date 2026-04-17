import type { GitHubIssue } from '../../interfaces/github-issue';
import type { GitHubStar } from '../../interfaces/github-star';

export class GitHubService {

  public onStar(payload: GitHubStar) {
    const { action, sender, repository } = payload;
    return `User ${sender.login} ${action} star on ${repository.name}`;
  }

  public onIssue(payload: GitHubIssue) {
    const { action, issue } = payload;
    if(action === 'opened') return `An issue was openeded: ${issue.title}`;
    if(action === 'closed') return `An issue was closed by ${issue.user.login}`;
    if(action === 'reopened') return `An issue was reopened by ${issue.user.login}`;
    return `Unhandled action for the issue event ${action}`;
  }
}
