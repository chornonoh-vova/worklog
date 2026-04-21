import type { ContributionsResponse } from "./github";

export type RepoSummary = { prs: string[]; reviews: string[] };
export type TransformedContributions = Record<string, RepoSummary>;

export function transform(input: ContributionsResponse): TransformedContributions {
        const result: TransformedContributions = {};
        const contributions = input.data.viewer.contributionsCollection;

        for (const repo of contributions.pullRequestContributionsByRepository) {
                const name = repo.repository.name;
                result[name] ??= { prs: [], reviews: [] };

                for (const node of repo.contributions.nodes) {
                        result[name].prs.push(`${node.pullRequest.title}${node.pullRequest.isDraft ? " [DRAFT]" : ""}`);
                }
        }

        for (const repo of contributions.pullRequestReviewContributionsByRepository) {
                const name = repo.repository.name;
                result[name] ??= { prs: [], reviews: [] };

                for (const node of repo.contributions.nodes) {
                        result[name].reviews.push(`${node.pullRequest.title} [${node.pullRequestReview.state}]`);
                }
        }

        return Object.fromEntries(
                Object.entries(result).sort(([a], [b]) => a.localeCompare(b))
        );
}
