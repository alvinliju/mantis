package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

const mantisVersion = "0.1.0"

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	subcmd := os.Args[1]
	if subcmd != "new" {
		printUsage()
		os.Exit(1)
	}

	var projectName string
	var templatePath string

	args := os.Args[2:]
	for i := 0; i < len(args); i++ {
		if args[i] == "--template-path" {
			if i+1 >= len(args) {
				fmt.Fprintf(os.Stderr, "mantis: --template-path requires a path\n")
				os.Exit(1)
			}
			templatePath = args[i+1]
			i++
		} else if projectName == "" {
			projectName = args[i]
		}
	}

	if projectName == "" {
		fmt.Fprintf(os.Stderr, "mantis: project name required\n")
		printUsage()
		os.Exit(1)
	}

	if err := validateProjectName(projectName); err != nil {
		fmt.Fprintf(os.Stderr, "mantis: %v\n", err)
		os.Exit(1)
	}

	cwd, err := os.Getwd()
	if err != nil {
		fmt.Fprintf(os.Stderr, "mantis: %v\n", err)
		os.Exit(1)
	}

	targetDir := filepath.Join(cwd, projectName)
	if _, err := os.Stat(targetDir); err == nil {
		fmt.Fprintf(os.Stderr, "mantis: directory %q already exists\n", projectName)
		os.Exit(1)
	}

	resolvedTemplate, err := resolveTemplateFromGitHub(templatePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "mantis: %v\n", err)
		os.Exit(1)
	}

	if err := CopyDir(resolvedTemplate, targetDir); err != nil {
		fmt.Fprintf(os.Stderr, "mantis: copy failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("  Copying template...     done")

	if err := ReplaceInFiles(targetDir, "__project_name__", projectName); err != nil {
		fmt.Fprintf(os.Stderr, "mantis: replace failed: %v\n", err)
		os.Exit(1)
	}
	if err := ReplaceInFiles(targetDir, "__project_name_pascal__", toPascalCase(projectName)); err != nil {
		fmt.Fprintf(os.Stderr, "mantis: replace failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("  Replacing placeholders... done")

	if err := Finalize(targetDir, projectName); err != nil {
		fmt.Fprintf(os.Stderr, "mantis: finalize failed: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("  Initializing git...     done")
	fmt.Println()
	fmt.Printf("  cd %s && nix develop\n", projectName)
}

func printUsage() {
	fmt.Fprintf(os.Stderr, "usage: mantis new <project-name> [--template-path <path>]\n")
}

var projectNameRe = regexp.MustCompile(`^[a-zA-Z][a-zA-Z0-9_-]*$`)

func validateProjectName(name string) error {
	if len(name) == 0 {
		return fmt.Errorf("project name cannot be empty")
	}
	if len(name) > 64 {
		return fmt.Errorf("project name too long")
	}
	if !projectNameRe.MatchString(name) {
		return fmt.Errorf("project name must start with a letter and contain only letters, digits, hyphens, and underscores")
	}
	return nil
}

func validateTemplateDir(dir string) error {
	info, err := os.Stat(dir)
	if err != nil {
		return err
	}
	if !info.IsDir() {
		return fmt.Errorf("%s is not a directory", dir)
	}
	rails := filepath.Join(dir, "rails")
	if _, err := os.Stat(rails); err != nil {
		return fmt.Errorf("template must contain rails/: %w", err)
	}
	return nil
}

// toPascalCase converts "my-app" or "my_app" to "MyApp".
func toPascalCase(s string) string {
	parts := strings.FieldsFunc(s, func(r rune) bool {
		return r == '-' || r == '_'
	})
	var b strings.Builder
	for _, p := range parts {
		if len(p) > 0 {
			b.WriteString(strings.ToUpper(p[:1]) + p[1:])
		}
	}
	return b.String()
}
