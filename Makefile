.PHONY: setup serve build deploy

setup:
	uv sync

serve:
	uv run mkdocs serve

build:
	uv run mkdocs build

deploy:
	uv run mkdocs gh-deploy
