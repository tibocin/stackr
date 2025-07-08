/**
 * Node class for Agent workflow graph
 * 
 * PURPOSE: Represents a state or task in the agent's workflow
 * RELATED: Agent, Graph, workflow orchestration
 * TAGS: agent, node, workflow, state
 */

/**
 * A Node represents a single state or task in the agent's workflow graph.
 * Each node can have multiple next nodes, allowing for branching workflows.
 */
export class Node {
  public id: string;
  public nextNodes: Node[];

  /**
   * Creates a new Node with the specified ID
   * 
   * @param id - Unique identifier for this node
   * @param nextNodes - Optional array of next nodes in the workflow
   */
  constructor(id: string, nextNodes: Node[] = []) {
    this.id = id;
    this.nextNodes = nextNodes;
  }

  /**
   * Adds a next node to this node's workflow
   * 
   * @param node - The node to add as a next step
   */
  addNextNode(node: Node): void {
    this.nextNodes.push(node);
  }

  /**
   * Checks if this node has any next nodes
   * 
   * @returns true if there are next nodes, false otherwise
   */
  hasNextNodes(): boolean {
    return this.nextNodes.length > 0;
  }

  /**
   * Gets the first next node (for simple linear workflows)
   * 
   * @returns The first next node, or null if none exist
   */
  getFirstNextNode(): Node | null {
    return this.nextNodes.length > 0 ? this.nextNodes[0] || null : null;
  }
} 