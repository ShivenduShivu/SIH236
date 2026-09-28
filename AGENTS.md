# Packora project contract

Read `docs/PROJECT_PLAN.md`, `docs/PROGRESS.md`, and `docs/DECISIONS.md` before continuing work. The user's latest instructions override this file.

- Build and run locally. **Do not deploy** without the user's subsequent approval.
- Work phase by phase. Verify the acceptance criteria, record real evidence, review `.gitignore` and staged files, then commit and push to the supplied origin. Never manufacture test results or silently bypass failed gates.
- Preserve assumptions, unknowns, provenance, units, and test conditions in the scientific engine. A material name alone is not a specification. A model result is not food-safety certification or a validated expiration date.
- AI must not generate scientific constants or overwrite deterministic calculations. Voice/scan are optional input helpers; ordinary manual and structured input must work without any AI key.
- Keep the core dependency-light and reproducible. Amend the plan and downstream criteria when an implementation decision changes.
- Do not put credentials, local environments, dependencies, build outputs, generated research PDFs, browser screenshots, or temporary files in Git. Run `python scripts/repo_audit.py --staged` before every phase commit and again before its push. Review the staged diff separately.
- The requested technical PDF is deferred until real implementation/test results exist. Its complete brief is in `docs/DEFERRED_PDF_BRIEF.md`. Do not generate it automatically.
