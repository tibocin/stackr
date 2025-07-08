/**
 * Graph class for Agent workflow structure
 * 
 * PURPOSE: Encapsulates the workflow structure (states and transitions)
 * RELATED: Agent, Node, workflow orchestration
 * TAGS: agent, graph, workflow, structure
 */

import { Node } from './Node';

/**
 * A Graph encapsulates the workflow structure, containing nodes and their relationships.
 * It designates a start node and manages the overall workflow topology.
 */
export class Graph {
  public nodes: Node[];
  public startNode: Node | null;

  /**
   * Creates a new Graph with the specified start node
   * 
   * @param startNode - The node where the workflow begins
   * @param additionalNodes - Optional additional nodes to include in the graph
   */
  constructor(startNode: Node | null, additionalNodes: Node[] = []) {
    this.startNode = startNode;
    this.nodes = startNode ? [startNode, ...additionalNodes] : additionalNodes;
  }

  /**
   * Adds a node to the graph
   * 
   * @param node - The node to add
   */
  addNode(node: Node): void {
    if (!this.nodes.find(n => n.id === node.id)) {
      this.nodes.push(node);
    }
  }

  /**
   * Gets a node by its ID
   * 
   * @param id - The ID of the node to find
   * @returns The node if found, null otherwise
   */
  getNodeById(id: string): Node | null {
    return this.nodes.find(node => node.id === id) || null;
  }

  /**
   * Checks if the graph has a valid start node
   * 
   * @returns true if the graph has a start node, false otherwise
   */
  hasStartNode(): boolean {
    return this.startNode !== null;
  }

  /**
   * Gets all nodes in the graph
   * 
   * @returns Array of all nodes in the graph
   */
  getAllNodes(): Node[] {
    return [...this.nodes];
  }
} 