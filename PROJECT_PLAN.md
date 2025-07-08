Excellent. I’ll create a comprehensive Markdown build plan for the Stackr Bitcoin DCA app starting from scratch. It will use TypeScript initially, flagging TODOs for eventual refactors to Rust and Python, and structure each development step to support agent-based execution in Cursor with Goose. The plan will cover foundational setup (including Bitcoin Knots, test harnesses, and CI/CD), followed by modular LangGraph-based agent integration.

I’ll let you know as soon as it’s ready for review.

# Project Plan: AI Agent Orchestration Application

This plan outlines a step-by-step development strategy using Test-Driven Development (TDD), small iterative commits, and feature branching. The project starts from scratch in TypeScript (with TODO notes for future Rust/Python refactoring). Each feature is developed on its own branch and merged when complete. Every step below is a task (with a checkbox) that includes writing a test first, then implementing the function or feature (with proper documentation and edge-case handling), and finally committing the changes with a descriptive message. The application remains in a working state at each commit, and foundational pieces are built first to support later features.

## Phase 0: Setup and CI/CD

You're right to point this out. While the existing **phased plan** outlines a complete step-by-step architecture, we need to **explicitly include the Docker setup** and containerization strategy as a foundational element. This ensures consistency across development environments, aligns with future deployment targets (Vercel, Start9, Umbrel), and supports the principle of reproducibility for LangGraph agents and services.

---

### ✅ **Docker Integration Plan**

**🔧 Where It Should Go:**
Docker should be included in **Phase 0: Setup & CI/CD** as a **parallel foundational track** that supports:

- Development container setup (with Node.js, Bitcoin Knots, LangGraph, SQLite, etc.)
- Testnet Bitcoin node startup
- Service container orchestration via `docker-compose`
- Path toward future production containers for Vercel/Start9/Umbrel

---

### 🧱 Addendum to Phase 0: Setup & CI/CD

Update Phase 0 as follows:

---

#### 🐳 0.1 Docker Environment Setup

- [ ] **`Create Dockerfile` for main service**

  - Node.js + LangGraph + TS setup
  - Define `WORKDIR`, install deps, `CMD ["yarn", "dev"]`

- [ ] **`Create docker-compose.yml`**

  - Define services:

    - `web`: app
    - `bitcoind`: Bitcoin Knots on testnet
    - `db`: SQLite (optional, dev only)

  - Set volumes, ports, restart policy

- [ ] **`Create docker-compose.override.yml` for dev**

  - Hot reload support, bind mounts, dev env vars

- [ ] **`.dockerignore` file**

  - Ignore `node_modules`, `.next`, etc.

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

  - `yarn docker:up`
  - `yarn docker:dev`
  - `yarn docker:test`

## Phase 1: Foundation Setup

_Objective:_ Establish the base project structure, testing framework, and continuous integration pipeline. This ensures the environment is ready for development and that the app is always in a working state with automated tests and CI from the beginning.

### Feature: Project Initialization

- [ ] **Initialize repository and Node.js project:** Create a new git repository (if not already initialized). Add a `README.md` with project name and a brief description, and include a LICENSE file (e.g. MIT License). Initialize an NPM project with `npm init -y` to generate a `package.json`. Commit these initial files (commit message: _"Initialize project with README, license, and package.json"_).
- [ ] **Set up TypeScript configuration:** Install TypeScript as a dev dependency (e.g. `npm install --save-dev typescript`). Create a `tsconfig.json` in the project root with a basic configuration (target ESNext, module CommonJS, include `src` directory, etc.). Ensure strict type checking options are enabled. Commit the TypeScript config and dependency changes (commit message: _"Add TypeScript configuration and compiler settings"_).
- [ ] **Create base application entry point:** In a new `src` directory, create an `index.ts` file. Implement a minimal **Hello World** functionality to verify the setup (for example, a function `main()` that returns or logs `"Hello, World!"`). Include a TODO comment noting that this is a placeholder to be expanded later. Document the function with a comment. Commit the new file (commit message: _"Add base application entry (Hello World) in src/index.ts"_). _(At this point, running `tsc` or `npx ts-node src/index.ts` should execute without errors, confirming the base setup is working.)_

### Feature: Test Harness Setup

_Objective:_ Introduce a testing framework (Jest) and demonstrate TDD with a simple example. This ensures we have automated testing in place and that it’s working properly.

- [ ] **Create feature branch for test harness:** Switch to a new git branch named `feature/test-harness-setup` to isolate this feature’s development.
- [ ] **Install and configure testing framework:** Add Jest to the project (e.g. `npm install --save-dev jest @types/jest ts-jest`). Initialize a basic Jest configuration (you can use `npx ts-jest config:init` to create a `jest.config.js` with TypeScript support). Update `package.json` test script to use `jest`. Commit these changes (commit message: _"Add Jest testing framework and configuration"_).
- [ ] **TDD example – greet function:** Using TDD, implement a simple `greet` function as a demonstration:

  - Write a new test in `src/index.test.ts` for a function `greet(name: string)` that should return `"Hello, <name>!"`. Include edge cases in the test (e.g., if name is an empty string or `null`, decide on expected behavior such as returning just `"Hello!"` or throwing an error). Initially, this test will fail since `greet` doesn’t exist yet.
  - Implement the `greet(name: string): string` function in `src/index.ts` to make the test pass. Ensure the function handles edge cases: if `name` is falsy or empty, use a default like `"World"` or return a specific message. Add a JSDoc comment for `greet` explaining its behavior. Run the tests locally to confirm they pass.
  - Commit the new test and function implementation together (commit message: _"Add greet() function with tests (returns greeting, handles empty input)"_).

- [ ] **Merge test harness feature:** Once tests are passing, merge the `feature/test-harness-setup` branch back into the main branch (all unit tests should run and pass in CI). The project now has a working test harness with an example test.

### Feature: CI/CD Configuration

_Objective:_ Set up continuous integration to run tests on every push, ensuring code remains stable. This uses a simple workflow (e.g., GitHub Actions) to install dependencies and run the test suite.

- [ ] **Create feature branch for CI setup:** Switch to a new branch named `feature/ci-setup`.
- [ ] **Add CI workflow script:** Create a CI configuration file (for example, `.github/workflows/ci.yml` for GitHub Actions) that defines a pipeline to run on each push or pull request. The workflow should:

  - Install Node.js (specify a version, e.g., 18.x).
  - Install dependencies (`npm ci`).
  - Run the test script (`npm test`).
    Configure the workflow to badge statuses, if desired. Commit the workflow file (commit message: _"Add CI pipeline configuration for running tests"_).

- [ ] **(Optional) Configure code coverage:** _(Optional step for completeness.)_ Integrate a code coverage tool (like Jest’s built-in coverage or Coveralls) in the CI to track test coverage. This can be done by adding `--coverage` to the test script and uploading results. Add any necessary config and commit (commit message: _"Enable test coverage in CI"_).
- [ ] **Merge CI setup feature:** Merge the `feature/ci-setup` branch into main. Verify that the CI pipeline runs successfully on the main branch (it should execute the example tests). Now the project has continuous integration ensuring that all tests must pass on new commits.

## Phase 2: Minimal LangGraph-Agent Framework

_Objective:_ Develop the core architecture for a stateful AI agent using a minimal graph-based workflow (inspired by LangGraph). This includes defining basic agent data structures, an execution loop, and a stub for LLM integration. The aim is to have a simple agent that can traverse a predefined graph of tasks/states. We will use TDD for the agent logic, ensuring correctness of state transitions. (Note: Actual LLM calls will be stubbed out in TypeScript with a plan to integrate Python-based LLM in the future. Similarly, any performance-critical sections will include TODO notes for potential Rust refactoring.)

### Feature: Agent Core Structures

_Goal:_ Define the fundamental classes for the agent system (Agent, Node, and Graph) with minimal functionality. This sets up the framework to represent an agent’s state and workflow graph.

- [ ] **Create feature branch for agent core:** Switch to a new branch named `feature/agent-core`.
- [ ] **Design stub classes (Agent, Node, Graph):** Create a new file `src/agent.ts`. Define empty class structures and constructors:

  - `class Node` – with at least an identifier (e.g. `id: string`) and possibly a list of next nodes (e.g. `nextNodes: Node[]` initialized empty). Document that a `Node` represents a state or task in the agent's workflow. (No complex logic yet.)
  - `class Graph` – with properties to hold nodes (e.g. `nodes: Node[]`) and designate a start node (e.g. `startNode: Node`). Provide a constructor that takes a start node (and optionally additional nodes). Document that `Graph` encapsulates the workflow structure (states and transitions).
  - `class Agent` – with a reference to a Graph and a pointer to current state (e.g. `currentNode: Node | null`). Its constructor should accept a `Graph` and set the agent’s `currentNode` to the graph’s start node. Document that `Agent` will execute tasks along the graph.
    Initially, leave methods unimplemented. Include input validation where appropriate (e.g., Agent’s constructor should throw an error or set `currentNode` to null if no start node is provided). Add TODO comments for future enhancements (like supporting persistent memory or more complex transitions).
  - Commit the new file with these stub class definitions (commit message: _"Add Agent, Node, and Graph classes (stub structures for agent framework)"_).

- [ ] **TDD Agent initialization:** Now implement a basic behavior with tests:

  - Write a test in a new file `src/agent.test.ts` for Agent’s constructor. For example, create a `Node` with id `"start"`, use it to create a `Graph` (with that node as start), then construct an `Agent` with this graph. Assert that `agent.currentNode.id === "start"` after initialization. Also test an edge case: if a Graph with an undefined start node is passed to Agent, it should handle it (e.g., throw an error or default to null currentNode). This test will initially fail if the Agent constructor logic is incomplete.
  - Implement the Agent constructor to pass the test: set `this.currentNode` to the provided graph’s `startNode`. If the `startNode` is missing (null/undefined), throw an informative Error (document this in code comments). Ensure the Node and Graph classes support this usage (e.g., Graph should store the startNode from its constructor argument). Run the new test to confirm it passes.
  - Commit the test and implementation (commit message: _"Implement Agent initialization with start node (currentNode set to graph.startNode)"_).

- [ ] **Merge agent core feature:** Merge the `feature/agent-core` branch into main. At this stage, the basic classes for the agent framework are in place (with minimal functionality), and the test for Agent initialization passes.

### Feature: Basic Agent Execution Loop

_Goal:_ Implement the ability for the Agent to traverse through the graph of Nodes. This will include a simple step function and a run loop, along with tracking visited nodes. We will test that an agent can move through a sequence of nodes from start to finish.

- [ ] **Create feature branch for agent run-loop:** Switch to a new branch named `feature/agent-run-loop`.
- [ ] **TDD agent traversal (step & run):** Develop the agent’s traversal methods using TDD:

  - Write an integration test in `src/agent.test.ts` (or a new `AgentRun.test.ts`) that sets up a small linear graph and verifies the agent can traverse it. For example, create three Node instances `A`, `B`, `C` (with ids `"A"`, `"B"`, `"C"`). Link them by setting `A.nextNodes = [B]` and `B.nextNodes = [C]` (and `C.nextNodes = []` to mark the end). Create a Graph with start node `A`, then initialize an Agent with this graph. In the test, call a method (to be implemented) like `agent.runAll()` that should make the agent walk through the graph from A to C. After running, assert that `agent.currentNode` is `C` (the last node). Additionally, track the path: we can plan to have Agent maintain a list of visited node IDs. The test can assert that the visited sequence is `["A", "B", "C"]`. This test will fail initially since `runAll()` (and the underlying step logic) is not implemented yet.
  - Implement the traversal logic in `src/agent.ts`:

    - Add a property `visitedNodes: Node[]` (or `visitedNodeIds: string[]`) to the Agent class to record the visitation order.
    - Implement `Agent.step()`: this method should advance the agent to the next node. For a simple approach, if `currentNode` has at least one `nextNodes`, set the agent’s `currentNode` to the first node in that list. If `currentNode` has no next nodes, the agent has reached the end; the method can leave `currentNode` as is or set a flag to indicate completion. Always record the current node in `visitedNodes` before moving (if not already recorded). Include input safety (e.g., if `currentNode` is `null` for some reason, handle gracefully).
    - Implement `Agent.runAll()`: loop or repeatedly call `step()` until the agent can no longer advance (e.g., no next node). After completion, ensure the final node is recorded in `visitedNodes` if not already. This results in the agent having a full record of its path. Add a short description in comments for these methods, and note any potential improvements (e.g., a TODO: “If graphs can contain loops or many nodes, consider adding cycle detection or moving heavy loop logic to Rust for performance”).
    - Run the test written earlier. It should now pass, confirming the agent moves through A->B->C correctly and stops at C.

  - Commit the updated Agent code and test (commit message: _"Implement Agent.step() and runAll() for sequential graph traversal with visited tracking"_).

- [ ] **Add end-to-end usage example:** Now that the agent core logic is working, create a simple end-to-end demonstration and test:

  - Update `src/index.ts` (the main entry) to use the Agent framework. For example, in a `main()` function or at the bottom, construct a small example graph (similar to A->B->C above) and create an Agent to run it. Have the program print out the visited nodes or final result (e.g., `console.log("Visited nodes:", agent.visitedNodes.map(n => n.id).join(" -> "));`). This serves as a basic demonstration of the agent in action.
  - Write an end-to-end test (perhaps in a file `src/e2e.test.ts`) that spawns the application and checks its output. For instance, use Node’s child_process to run `node dist/index.js` (after building) or `ts-node src/index.ts`, then capture the console output. Assert that the output contains the expected sequence (e.g., `"Visited nodes: A -> B -> C"`). This test validates the whole system wiring (from main function through agent traversal).
  - Commit the changes (commit message: _"Add end-to-end test and example usage of Agent in main entry"_).

- [ ] **Merge agent run-loop feature:** Merge the `feature/agent-run-loop` branch into main. At this point, the application has a minimal working agent framework: it can represent a graph of steps and an agent can automatically traverse from start to finish. The functionality is verified by unit/integration tests and an end-to-end test.

### Feature: LLM Integration Stub

_Goal:_ Prepare for AI integration by creating a stub function that will later interface with a Large Language Model (LLM). In this step, we add a placeholder for querying an LLM (like OpenAI API or similar) and ensure it can be easily swapped out for a real implementation. We will mark this for future refactoring to Python (where LangChain/LangGraph’s actual LLM tools can be used).

- [ ] **Create feature branch for LLM stub:** Switch to a new branch named `feature/llm-stub`.
- [ ] **Add LLM query module (stub):** Create a new file `src/llm.ts` with an exported function signature for querying an LLM. For example:

  ```ts
  export async function queryLLM(prompt: string): Promise<string> {
    // TODO: Integrate real LLM call (e.g., via Python backend or external API)
    throw new Error("Not implemented");
  }
  ```

  Document that this function will send a prompt to an AI model and return the response. Initially, have it throw an error or return a dummy not-implemented indicator. Commit this stub file (commit message: _"Add LLM query stub function (to be implemented later)"_).

- [ ] **TDD implement stubbed response:** Now implement a basic dummy behavior for `queryLLM`:

  - Write a unit test in `src/llm.test.ts` that imports `queryLLM` and calls it with a sample prompt (e.g., `"Hello"`). In this controlled stub, decide on a fixed dummy output (for example, always return `"LLM response stub"` regardless of input). The test should await the function and assert that the returned string equals the expected dummy response. This test will fail until we implement the function (currently it throws).
  - Implement the `queryLLM` function in `src/llm.ts` to return a resolved Promise with a fixed string, e.g.:

    ```ts
    export async function queryLLM(prompt: string): Promise<string> {
      // TODO: Replace with real LLM API call (possibly via Python LangChain)
      return "LLM response stub";
    }
    ```

    Add a TODO note in the code commenting that this is a placeholder and that a proper implementation will use a Python service or LangGraph integration to get a real response from an LLM. Ensure to handle the input (e.g., if prompt is empty, perhaps return an empty or default response).

  - Run the `queryLLM` test to ensure it passes with the dummy implementation.
  - Commit the test and function implementation (commit message: _"Implement queryLLM stub to return dummy LLM response (placeholder for real AI integration)"_).

- [ ] **Merge LLM stub feature:** Merge the `feature/llm-stub` branch into main. The codebase now contains an `queryLLM` interface function, which will later be refactored to call an actual LLM in Python. For now, the stub ensures the rest of the application can compile and even simulate an AI response if needed. (Integration of this stub into the Agent’s workflow is not done in this minimal phase, but the hook is ready for future use.)

## Future Phase (Planned Enhancements)

_With the minimal agent framework in place, future phases will focus on integrating real AI capabilities and expanding the system’s functionality. Some planned enhancements include:_

- **Real LLM Integration:** Refactor the `queryLLM` function to use a Python backend or external API (e.g. OpenAI or Anthropic) to get actual model responses. This might involve creating a Python module or microservice (using LangChain/LangGraph in Python) and calling it from the Node.js app (perhaps via an HTTP request or FFI). The current stub will be replaced accordingly.
- **Performance Optimizations (Rust):** Identify any performance-critical code paths (for example, traversing very large graphs or heavy data processing). Those components can be re-written in Rust for efficiency. For instance, if the agent’s decision-making loop becomes complex, a Rust implementation compiled to WebAssembly could be integrated for speed. (Currently, the traversal is simple, but future features like complex planning or large-memory management might benefit from Rust optimization.)
- **Advanced Agent Features:** Build upon the LangGraph-like framework to support more complex workflows:

  - Implement branching logic where an LLM’s output determines the next Node (introducing conditional transitions in the graph).
  - Add memory and state persistence to the Agent (so it can maintain context across runs or recover from interruptions).
  - Introduce tool usage – allow the agent to invoke external tools or APIs as part of its steps (e.g., web search, calculations), similar to LangChain tools.
  - Support multi-agent orchestration or parallel workflows if needed, where multiple agents can operate and communicate.

- **Robust Error Handling and Recovery:** Enhance the agent loop with error catching, retries, and possibly human-in-the-loop interventions for unresolvable states (aligning with LangGraph’s durable execution goals).
- **Documentation and Examples:** As features grow, expand the README and documentation with usage examples and scenarios. Include guidance on how to run the agent system and how to extend it with new tools or behaviors.

Each of these future improvements would be developed in its own feature branch with the same rigorous TDD approach (write tests for new behaviors, implement the feature, ensure all tests pass, then integrate). By following this plan step-by-step, the team (with the help of AI agents in Cursor and Goose) can incrementally build a robust AI agent application with confidence in its correctness and maintainability. Each phase ensures a working product at that stage, allowing for continuous feedback and adjustment as needed.
