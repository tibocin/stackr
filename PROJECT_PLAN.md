# Project Plan: AI Agent Orchestration Application

This plan outlines a step-by-step development strategy using Test-Driven Development (TDD), small iterative commits, and feature branching. The project has been successfully migrated to Python with LangGraph for AI agent orchestration. Each feature is developed on its own branch and merged when complete. Every step below is a task (with a checkbox) that includes writing a test first, then implementing the function or feature (with proper documentation and edge-case handling), and finally committing the changes with a descriptive message. The application remains in a working state at each commit, and foundational pieces are built first to support later features.

## Phase 0: Setup and CI/CD

You're right to point this out. While the existing **phased plan** outlines a complete step-by-step architecture, we need to **explicitly include the Docker setup** and containerization strategy as a foundational element. This ensures consistency across development environments, aligns with future deployment targets (Vercel, Start9, Umbrel), and supports the principle of reproducibility for LangGraph agents and services.

---

### ✅ **Docker Integration Plan**

**🔧 Where It Should Go:**
Docker should be included in **Phase 0: Setup & CI/CD** as a **parallel foundational track** that supports:

- Development container setup (with Python, Bitcoin Knots, LangGraph, SQLite, etc.)
- Testnet Bitcoin node startup
- Service container orchestration via `docker-compose`
- Path toward future production containers for Vercel/Start9/Umbrel

---

### 🧱 Addendum to Phase 0: Setup & CI/CD

Update Phase 0 as follows:

---

#### 🐳 0.1 Docker Environment Setup

- [ ] **`Create Dockerfile` for main service**

  - Python + LangGraph + FastAPI setup
  - Define `WORKDIR`, install deps, `CMD ["python", "-m", "uvicorn", "main:app"]`

- [ ] **`Create docker-compose.yml`**

  - Define services:

    - `web`: app
    - `bitcoind`: Bitcoin Knots on testnet
    - `db`: SQLite (optional, dev only)

  - Set volumes, ports, restart policy

- [ ] **`Create docker-compose.override.yml` for dev**

  - Hot reload support, bind mounts, dev env vars

- [ ] **`.dockerignore` file**

  - Ignore `__pycache__`, `.pytest_cache`, etc.

- [ ] **Stub `scripts/dev/start-testnet.sh`**

  - Entrypoint to launch `bitcoind` testnet
  - Tail logs and output wallet info

- [ ] **Commit containers separately**

  - `Initial Dockerfile`
  - `Add docker-compose with bitcoin + db`
  - `Override for dev hot reload`

- [ ] **Add to CI/CD pipeline**

  - Test `docker-compose up --build` runs clean
  - Validate app connects to testnet via Bitcoin RPC

- [ ] **Document local dev Docker usage in README**

  - `python docker:up`
  - `python docker:dev`
  - `python docker:test`

## Phase 1: Foundation Setup

_Objective:_ Establish the base project structure, testing framework, and continuous integration pipeline. This ensures the environment is ready for development and that the app is always in a working state with automated tests and CI from the beginning.

### Feature: Project Initialization

- [ ] **Initialize repository and Python project:** Create a new git repository (if not already initialized). Add a `README.md` with project name and a brief description, and include a LICENSE file (e.g. MIT License). Initialize a Python project with `pyproject.toml` and virtual environment setup. Commit these initial files (commit message: _"Initialize project with README, license, and pyproject.toml"_).
- [ ] **Set up Python configuration:** Install Python dependencies and create a `pyproject.toml` with project metadata, dependencies, and build configuration. Ensure type checking with mypy is configured. Commit the Python config and dependency changes (commit message: _"Add Python configuration and dependency management"_).
- [ ] **Create base application entry point:** In a new `python` directory, create an `__init__.py` file and a main entry point. Implement a minimal **Hello World** functionality to verify the setup (for example, a function `main()` that returns or logs `"Hello, World!"`). Include a TODO comment noting that this is a placeholder to be expanded later. Document the function with a comment. Commit the new file (commit message: _"Add base application entry (Hello World) in python/**init**.py"_). _(At this point, running `python -m python` should execute without errors, confirming the base setup is working.)_

### Feature: Test Harness Setup

_Objective:_ Introduce a testing framework (pytest) and demonstrate TDD with a simple example. This ensures we have automated testing in place and that it's working properly.

- [ ] **Create feature branch for test harness:** Switch to a new git branch named `feature/test-harness-setup` to isolate this feature's development.
- [ ] **Install and configure testing framework:** Add pytest to the project (e.g. `pip install pytest pytest-asyncio`). Initialize a basic pytest configuration in `pyproject.toml` with test discovery patterns. Update `pyproject.toml` test script to use `pytest`. Commit these changes (commit message: _"Add pytest testing framework and configuration"_).
- [ ] **TDD example – greet function:** Using TDD, implement a simple `greet` function as a demonstration:

  - Write a new test in `python/tests/test_greet.py` for a function `greet(name: str)` that should return `"Hello, <name>!"`. Include edge cases in the test (e.g., if name is an empty string or `None`, decide on expected behavior such as returning just `"Hello!"` or throwing an error). Initially, this test will fail since `greet` doesn't exist yet.
  - Implement the `greet(name: str) -> str` function in `python/utils/greet.py` to make the test pass. Ensure the function handles edge cases: if `name` is falsy or empty, use a default like `"World"` or return a specific message. Add a docstring for `greet` explaining its behavior. Run the tests locally to confirm they pass.
  - Commit the new test and function implementation together (commit message: _"Add greet() function with tests (returns greeting, handles empty input)"_).

- [ ] **Merge test harness feature:** Once tests are passing, merge the `feature/test-harness-setup` branch back into the main branch (all unit tests should run and pass in CI). The project now has a working test harness with an example test.

### Feature: CI/CD Configuration

_Objective:_ Set up continuous integration to run tests on every push, ensuring code remains stable. This uses a simple workflow (e.g., GitHub Actions) to install dependencies and run the test suite.

- [ ] **Create feature branch for CI setup:** Switch to a new branch named `feature/ci-setup`.
- [ ] **Add CI workflow script:** Create a CI configuration file (for example, `.github/workflows/ci.yml` for GitHub Actions) that defines a pipeline to run on each push or pull request. The workflow should:

  - Install Python (specify a version, e.g., 3.11).
  - Install dependencies (`pip install -e .`).
  - Run the test script (`pytest`).
    Configure the workflow to badge statuses, if desired. Commit the workflow file (commit message: _"Add CI pipeline configuration for running tests"_).

- [ ] **(Optional) Configure code coverage:** _(Optional step for completeness.)_ Integrate a code coverage tool (like pytest-cov) in the CI to track test coverage. This can be done by adding `--cov=python` to the test script and uploading results. Add any necessary config and commit (commit message: _"Enable test coverage in CI"_).
- [ ] **Merge CI setup feature:** Merge the `feature/ci-setup` branch into main. Verify that the CI pipeline runs successfully on the main branch (it should execute the example tests). Now the project has continuous integration ensuring that all tests must pass on new commits.

## Phase 2: LangGraph Agent Framework

_Objective:_ Develop the core architecture for a stateful AI agent using LangGraph. This includes defining basic agent data structures, an execution loop, and LLM integration. The aim is to have a simple agent that can traverse a predefined graph of tasks/states. We will use TDD for the agent logic, ensuring correctness of state transitions.

### Feature: LangGraph Core Setup

_Goal:_ Set up the foundational LangGraph framework with basic workflow capabilities.

- [ ] **Create feature branch for LangGraph core:** Switch to a new branch named `feature/langgraph-core`.
- [ ] **Install and configure LangGraph:** Add LangGraph dependencies to `pyproject.toml` (e.g., `langgraph`, `langchain`, `langchain-openai`). Create a basic LangGraph workflow structure in `python/workflows/`. Document that this will be the foundation for all agent workflows. Commit the new dependencies and structure (commit message: _"Add LangGraph dependencies and basic workflow structure"_).

- [ ] **TDD LangGraph workflow initialization:** Now implement a basic behavior with tests:

  - Write a test in a new file `python/tests/test_workflow.py` for a simple LangGraph workflow. For example, create a basic graph with two nodes that pass state between them. Test that the workflow can be initialized and executed with proper state management. This test will initially fail if the workflow structure is incomplete.
  - Implement the basic LangGraph workflow in `python/workflows/basic.py` to pass the test: create a simple graph with state management, ensure proper node execution, and verify state transitions. Include input validation where appropriate and add TODO comments for future enhancements.
  - Run the new test to confirm it passes.
  - Commit the test and implementation (commit message: _"Implement basic LangGraph workflow with state management"_).

- [ ] **Merge LangGraph core feature:** Merge the `feature/langgraph-core` branch into main. At this stage, the basic LangGraph framework is in place with minimal functionality, and the test for workflow initialization passes.

### Feature: LLM Integration

_Goal:_ Integrate real LLM capabilities using the existing strategy pattern.

- [ ] **Create feature branch for LLM integration:** Switch to a new branch named `feature/llm-integration`.
- [ ] **TDD LLM strategy integration:** Develop LLM integration using the existing strategy pattern:

  - Write integration tests in `python/tests/test_llm_integration.py` that test the existing LLM strategies (OpenAI, Grok) within a LangGraph workflow. Test that nodes can call LLMs and receive proper responses. Include edge cases like API failures, rate limits, and invalid responses.
  - Integrate the existing LLM strategies into LangGraph nodes. Ensure the factory pattern works correctly within the workflow context. Add proper error handling and retry logic for API calls.
  - Run the integration tests to ensure they pass with real LLM calls (using mocked responses for CI).
  - Commit the integration code and tests (commit message: _"Integrate LLM strategies into LangGraph workflow with error handling"_).

- [ ] **Add end-to-end usage example:** Now that the LLM integration is working, create a simple end-to-end demonstration:

  - Update the main entry point to demonstrate a complete LangGraph workflow with LLM integration. Show how the workflow can process input, call LLMs, and produce structured output.
  - Write an end-to-end test that validates the complete workflow from input to output, including LLM calls and state management.
  - Commit the changes (commit message: _"Add end-to-end example of LangGraph workflow with LLM integration"_).

- [ ] **Merge LLM integration feature:** Merge the `feature/llm-integration` branch into main. At this point, the application has a working LangGraph framework with real LLM integration, verified by unit/integration tests and an end-to-end test.

## Future Phase (Planned Enhancements)

_With the LangGraph framework in place, future phases will focus on expanding the system's functionality and integrating with the Bitcoin DCA workflow. Some planned enhancements include:_

- **Bitcoin DCA Workflow Integration:** Extend the existing Bitcoin news analysis workflow to include DCA decision-making, price analysis, and automated trading logic. This will leverage the existing LangGraph structure and LLM integration.
- **Performance Optimizations:** Identify any performance-critical code paths (for example, complex data processing or large-scale workflow execution). Those components can be optimized or potentially re-written in Rust for efficiency if needed.
- **Advanced Workflow Features:** Build upon the LangGraph framework to support more complex workflows:

  - Implement branching logic where LLM outputs determine the next node (introducing conditional transitions in the graph).
  - Add persistent state management to workflows (so they can maintain context across runs or recover from interruptions).
  - Introduce tool usage – allow workflows to invoke external tools or APIs as part of their steps (e.g., web search, calculations, Bitcoin RPC calls).
  - Support multi-workflow orchestration or parallel execution if needed.

- **Robust Error Handling and Recovery:** Enhance the workflow execution with error catching, retries, and possibly human-in-the-loop interventions for unresolvable states (aligning with LangGraph's durable execution goals).
- **Documentation and Examples:** As features grow, expand the README and documentation with usage examples and scenarios. Include guidance on how to run the workflow system and how to extend it with new tools or behaviors.

Each of these future improvements would be developed in its own feature branch with the same rigorous TDD approach (write tests for new behaviors, implement the feature, ensure all tests pass, then integrate). By following this plan step-by-step, the team can incrementally build a robust AI agent application with confidence in its correctness and maintainability. Each phase ensures a working product at that stage, allowing for continuous feedback and adjustment as needed.
