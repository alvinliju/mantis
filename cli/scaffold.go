package main

import (
	"bytes"
	"fmt"
	"io"
	"io/fs"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

var (
	skipDirs = map[string]bool{
		"node_modules": true,
		".next":        true,
		"__pycache__":  true,
		".git":         true,
	}
	skipFiles = map[string]bool{
		"package-lock.json": true,
	}
	binaryExts = map[string]bool{
		".svg": true, ".png": true, ".jpg": true, ".jpeg": true,
		".ico": true, ".woff": true, ".woff2": true, ".ttf": true, ".eot": true,
	}
)

func CopyDir(src, dst string) error {
	return filepath.WalkDir(src, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		rel, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}

		if rel == "." {
			if err := os.MkdirAll(dst, 0755); err != nil {
				return err
			}
			return nil
		}

		if d.IsDir() {
			if skipDirs[d.Name()] {
				return filepath.SkipDir
			}
			target := filepath.Join(dst, rel)
			return os.MkdirAll(target, 0755)
		}

		if skipFiles[d.Name()] {
			return nil
		}

		target := filepath.Join(dst, rel)
		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		if err := os.MkdirAll(filepath.Dir(target), 0755); err != nil {
			return err
		}

		info, err := d.Info()
		if err != nil {
			return err
		}
		return os.WriteFile(target, data, info.Mode())
	})
}

func ReplaceInFiles(dir, placeholder, replacement string) error {
	return filepath.WalkDir(dir, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}

		ext := strings.ToLower(filepath.Ext(d.Name()))
		if binaryExts[ext] {
			return nil
		}

		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		if !bytes.Contains(data, []byte(placeholder)) {
			return nil
		}

		newData := bytes.ReplaceAll(data, []byte(placeholder), []byte(replacement))
		return os.WriteFile(path, newData, 0644)
	})
}

func Finalize(dir, projectName string) error {
	tomlContent := fmt.Sprintf(`[project]
name = %q
mantis_version = %q
created_at = %q
`, projectName, mantisVersion, time.Now().UTC().Format(time.RFC3339))

	tomlPath := filepath.Join(dir, "mantis.toml")
	if err := os.WriteFile(tomlPath, []byte(tomlContent), 0644); err != nil {
		return fmt.Errorf("write mantis.toml: %w", err)
	}

	cmd := exec.Command("git", "init")
	cmd.Dir = dir
	cmd.Stdout = io.Discard
	cmd.Stderr = io.Discard
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("git init: %w", err)
	}

	return nil
}
