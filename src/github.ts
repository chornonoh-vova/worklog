const contributionsQuery = `
query($from: DateTime!, $to: DateTime!) {
  viewer {
    contributionsCollection(
      from: $from
      to: $to
    ) {
      pullRequestContributionsByRepository {
        repository {
          name
        }
        contributions(first: 100) {
          nodes {
            pullRequest {
              title
              isDraft
              merged
              closed
            }
          }
        }
      }
      pullRequestReviewContributionsByRepository {
        repository {
          name
        }
        contributions(first: 100) {
          nodes {
            pullRequest {
              title
            }
            pullRequestReview {
              state
            }
          }
        }
      }
    }
  }
}
`;

export type PullRequestContribution = {
        pullRequest: {
                title: string;
                isDraft: boolean;
                merged: boolean;
                closed: boolean;
        };
};

export type PullRequestReviewContribution = {
        pullRequest: { title: string };
        pullRequestReview: { state: string };
};

export type ContributionsByRepository<T> = {
        repository: { name: string };
        contributions: { nodes: T[] };
};

export type ContributionsResponse = {
        data: {
                viewer: {
                        contributionsCollection: {
                                pullRequestContributionsByRepository: ContributionsByRepository<PullRequestContribution>[];
                                pullRequestReviewContributionsByRepository: ContributionsByRepository<PullRequestReviewContribution>[];
                        };
                };
        };
};

type GraphQLError = { message: string; type?: string; path?: (string | number)[] };

export async function getContributions(token: string, date: string): Promise<ContributionsResponse> {
        const from = new Date(date);
        from.setUTCHours(0, 0, 0, 0);

        const to = new Date(date);
        to.setUTCHours(23, 59, 59, 999);

        let response: Response;
        try {
                response = await fetch("https://api.github.com/graphql", {
                        method: "POST",
                        headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                                query: contributionsQuery,
                                variables: {
                                        from: from.toISOString(),
                                        to: to.toISOString()
                                }
                        })
                });
        } catch (err) {
                throw new Error(`GitHub request failed: ${(err as Error).message}`);
        }

        if (!response.ok) {
                const body = await response.text();
                throw new Error(`GitHub API ${response.status} ${response.statusText}: ${body.slice(0, 500)}`);
        }

        const result = await response.json() as { data?: ContributionsResponse["data"]; errors?: GraphQLError[] };

        if (result.errors?.length) {
                const messages = result.errors.map(e => e.message).join("; ");
                throw new Error(`GitHub GraphQL error: ${messages}`);
        }

        if (!result.data) {
                throw new Error("GitHub GraphQL response missing data");
        }

        return { data: result.data };
}
