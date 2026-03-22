the scaffold tool. written in go.

builds a mantis project from the template directory.
copies files, substitutes project name, prints next steps.

	go run . new my-project
	mantis new my-project

Template source (in order):
  1. --template-path <path>  (local override)
  2. ~/.mantis/cache/       (cached from GitHub)
  3. GitHub latest release  (alvinliju/mantis)

Env vars:
  MANTIS_TEMPLATE_REPO  owner/repo  (default: alvinliju/mantis)
  MANTIS_GITHUB_TOKEN   token       (optional, for higher rate limits)

Requires a GitHub release on the template repo. Create one first.
