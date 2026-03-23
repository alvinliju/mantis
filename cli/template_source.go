package main

import (
	"archive/zip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	githubAPIBase     = "https://api.github.com"
	defaultRepoOwner  = "alvinliju"
	defaultRepoName   = "mantis"
	cacheMetadataFile = "metadata.json"
	templateSubdir    = "template"
)

type releaseResponse struct {
	TagName    string `json:"tag_name"`
	ZipballURL string `json:"zipball_url"`
}

type cacheMetadata struct {
	Tag        string `json:"tag"`
	ResolvedAt string `json:"resolved_at"`
	TemplatePath string `json:"template_path"`
}

func cacheDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("cannot determine home directory: %w", err)
	}
	cache := filepath.Join(home, ".mantis", "cache")
	if err := os.MkdirAll(cache, 0755); err != nil {
		return "", fmt.Errorf("cannot create cache directory: %w", err)
	}
	return cache, nil
}

func resolveTemplateFromGitHub(flagPath string) (string, error) {
	if flagPath != "" {
		abs, err := filepath.Abs(flagPath)
		if err != nil {
			return "", fmt.Errorf("invalid --template-path: %w", err)
		}
		if err := validateTemplateDir(abs); err != nil {
			return "", err
		}
		return abs, nil
	}

	owner := defaultRepoOwner
	repo := defaultRepoName
	if v := os.Getenv("MANTIS_TEMPLATE_REPO"); v != "" {
		parts := strings.SplitN(v, "/", 2)
		if len(parts) == 2 {
			owner, repo = parts[0], parts[1]
		}
	}

	cacheRoot, err := cacheDir()
	if err != nil {
		return "", err
	}

	metaPath := filepath.Join(cacheRoot, cacheMetadataFile)

	if meta, err := os.ReadFile(metaPath); err == nil {
		var m cacheMetadata
		if json.Unmarshal(meta, &m) == nil && m.TemplatePath != "" {
			if _, err := os.Stat(m.TemplatePath); err == nil {
				tag, _, err := fetchLatestRelease(owner, repo)
				if err != nil {
					return m.TemplatePath, nil
				}
				if tag == m.Tag {
					return m.TemplatePath, nil
				}
			}
		}
	}

	fmt.Println("  Resolving template (github)...")
	tag, zipURL, err := fetchLatestRelease(owner, repo)
	if err != nil {
		return "", err
	}
	fmt.Printf("  Downloading template %s...\n", tag)

	zipPath, err := downloadZip(zipURL, cacheRoot)
	if err != nil {
		return "", err
	}
	defer os.Remove(zipPath)

	extractRoot := filepath.Join(cacheRoot, "extract-"+tag)
	if err := os.MkdirAll(extractRoot, 0755); err != nil {
		return "", fmt.Errorf("cannot create extract directory: %w", err)
	}

	templatePath, err := extractZipSafely(zipPath, extractRoot)
	if err != nil {
		os.RemoveAll(extractRoot)
		return "", err
	}

	if err := validateTemplateDir(templatePath); err != nil {
		os.RemoveAll(extractRoot)
		return "", err
	}

	oldLatest := filepath.Join(cacheRoot, "latest")
	os.RemoveAll(oldLatest)
	latestPath := filepath.Join(cacheRoot, "latest")
	if err := os.Rename(extractRoot, latestPath); err != nil {
		os.RemoveAll(extractRoot)
		return "", fmt.Errorf("cannot update cache: %w", err)
	}
	rel, _ := filepath.Rel(extractRoot, templatePath)
	templatePath = filepath.Join(latestPath, rel)

	meta := cacheMetadata{
		Tag:         tag,
		ResolvedAt:  time.Now().UTC().Format(time.RFC3339),
		TemplatePath: templatePath,
	}
	metaJSON, _ := json.MarshalIndent(meta, "", "  ")
	os.WriteFile(metaPath, metaJSON, 0644)

	return templatePath, nil
}

func fetchLatestRelease(owner, repo string) (tag, zipURL string, err error) {
	url := fmt.Sprintf("%s/repos/%s/%s/releases/latest", githubAPIBase, owner, repo)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", "", fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "mantis-cli/1.0")
	if tok := os.Getenv("MANTIS_GITHUB_TOKEN"); tok != "" {
		req.Header.Set("Authorization", "Bearer "+tok)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", "", fmt.Errorf("network error fetching release: %w (check connectivity)", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		return "", "", fmt.Errorf("no releases found for %s/%s (create a release first)", owner, repo)
	}
	if resp.StatusCode == 403 {
		return "", "", fmt.Errorf("GitHub API rate limit exceeded (set MANTIS_GITHUB_TOKEN for higher limits)")
	}
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return "", "", fmt.Errorf("GitHub API error %d: %s", resp.StatusCode, string(body))
	}

	var r releaseResponse
	if err := json.NewDecoder(resp.Body).Decode(&r); err != nil {
		return "", "", fmt.Errorf("invalid GitHub response: %w", err)
	}
	if r.ZipballURL == "" {
		return "", "", fmt.Errorf("release has no zipball_url")
	}
	return r.TagName, r.ZipballURL, nil
}

func downloadZip(url, cacheRoot string) (string, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("User-Agent", "mantis-cli/1.0")
	if tok := os.Getenv("MANTIS_GITHUB_TOKEN"); tok != "" {
		req.Header.Set("Authorization", "Bearer "+tok)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("download failed: %w (check connectivity)", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("download failed with status %d", resp.StatusCode)
	}

	outPath := filepath.Join(cacheRoot, "source.zip")
	out, err := os.Create(outPath)
	if err != nil {
		return "", fmt.Errorf("cannot write cache file: %w", err)
	}
	defer out.Close()

	if _, err := io.Copy(out, resp.Body); err != nil {
		os.Remove(outPath)
		return "", fmt.Errorf("download failed: %w", err)
	}
	return outPath, nil
}

func extractZipSafely(zipPath, extractDir string) (templatePath string, err error) {
	r, err := zip.OpenReader(zipPath)
	if err != nil {
		return "", fmt.Errorf("invalid zip archive: %w", err)
	}
	defer r.Close()

	extractDir, err = filepath.Abs(extractDir)
	if err != nil {
		return "", err
	}

	var topLevel string
	for _, f := range r.File {
		clean := filepath.ToSlash(f.Name)
		clean = strings.TrimSuffix(clean, "/")
		if clean == "" {
			continue
		}
		if strings.Contains(clean, "..") {
			continue
		}
		target := filepath.Join(extractDir, filepath.FromSlash(clean))
		rel, err := filepath.Rel(extractDir, target)
		if err != nil || strings.HasPrefix(rel, "..") || filepath.IsAbs(rel) {
			continue
		}

		parts := strings.Split(clean, "/")
		if topLevel == "" && len(parts) > 0 {
			topLevel = parts[0]
		}

		if f.FileInfo().IsDir() {
			os.MkdirAll(target, 0755)
			continue
		}

		dir := filepath.Dir(target)
		os.MkdirAll(dir, 0755)

		rc, err := f.Open()
		if err != nil {
			return "", fmt.Errorf("cannot read zip entry %s: %w", f.Name, err)
		}
		w, err := os.Create(target)
		if err != nil {
			rc.Close()
			return "", err
		}
		_, err = io.Copy(w, rc)
		w.Close()
		rc.Close()
		if err != nil {
			return "", err
		}
	}

	if topLevel != "" {
		templatePath = filepath.Join(extractDir, topLevel, templateSubdir)
	} else {
		templatePath = filepath.Join(extractDir, templateSubdir)
	}

	if _, err := os.Stat(templatePath); err != nil {
		entries, _ := os.ReadDir(extractDir)
		for _, e := range entries {
			if e.IsDir() {
				p := filepath.Join(extractDir, e.Name(), templateSubdir)
				if _, err := os.Stat(p); err == nil {
					return p, nil
				}
			}
		}
		return "", fmt.Errorf("zip does not contain template/ directory")
	}
	return templatePath, nil
}
