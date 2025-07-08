/**
 * Agent class for executing workflow tasks
 * 
 * PURPOSE: Executes tasks along the graph and manages state transitions
 * RELATED: Graph, Node, workflow orchestration
 * TAGS: agent, execution, workflow, state-management
 */

import { Graph } from './Graph';
import { Node } from './Node';

/**
 * An Agent executes tasks along a workflow graph, maintaining state and tracking progress.
 * It can traverse through nodes, record visits, and manage the execution flow.
 */
export class Agent {
  public graph: Graph;
  public currentNode: Node | null;
  public visitedNodes: Node[];

  /**
   * Creates a new Agent with the specified graph
   * 
   * @param graph - The workflow graph to execute
   * @throws Error if the graph has no start node
   */
  constructor(graph: Graph) {
    if (!graph.hasStartNode()) {
      throw new Error('Graph must have a start node');
    }
    
    this.graph = graph;
    this.currentNode = graph.startNode;
    this.visitedNodes = [];
  }

  /**
   * Records the current node as visited
   * Prevents duplicate entries in the visited nodes list
   */
  recordVisit(): void {
    if (this.currentNode && !this.visitedNodes.includes(this.currentNode)) {
      this.visitedNodes.push(this.currentNode);
    }
  }

  /**
   * Gets the current node ID
   * 
   * @returns The ID of the current node, or null if no current node
   */
  getCurrentNodeId(): string | null {
    return this.currentNode?.id || null;
  }

  /**
   * Gets the number of visited nodes
   * 
   * @returns The count of visited nodes
   */
  getVisitedCount(): number {
    return this.visitedNodes.length;
  }

  /**
   * Checks if the agent has visited a specific node
   * 
   * @param nodeId - The ID of the node to check
   * @returns true if the node has been visited, false otherwise
   */
  hasVisited(nodeId: string): boolean {
    return this.visitedNodes.some(node => node.id === nodeId);
  }

  /**
   * Gets the path of visited node IDs
   * 
   * @returns Array of visited node IDs in order
   */
  getVisitedPath(): string[] {
    return this.visitedNodes.map(node => node.id);
  }
} 