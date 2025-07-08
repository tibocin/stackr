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
   * Allows duplicate entries for retry scenarios and audit trails
   * 
   * @param allowDuplicates - Whether to allow duplicate entries (default: true for retry scenarios)
   */
  recordVisit(allowDuplicates: boolean = true): void {
    if (this.currentNode) {
      if (allowDuplicates || !this.visitedNodes.includes(this.currentNode)) {
        this.visitedNodes.push(this.currentNode);
      }
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

  /**
   * Advances the agent to the next node in the graph
   * Always records the current node as visited
   * 
   * @returns true if the agent advanced, false if no next node available
   */
  step(): boolean {
    if (!this.currentNode) {
      return false;
    }

    if (this.visitedNodes.length === 0) {
    this.recordVisit();
    }

    // Check if there's a next node to move to
    const nextNode = this.currentNode.getFirstNextNode();
    if (nextNode) {
      this.currentNode = nextNode;
      this.recordVisit();
      return true;
    }

    return false;
  }

  /**
   * Runs the agent through the entire graph from start to finish
   * Continues stepping until no more nodes are available
   */
  runAll(): void {
    // Step through the graph until we can't advance further
    while (this.step()) {
      // Continue stepping until no more nodes available
    }
  }

  /**
   * Checks if the agent has completed the graph traversal
   * 
   * @returns true if the agent is at a node with no next nodes, false otherwise
   */
  isCompleted(): boolean {
    if (!this.currentNode) {
      return true;
    }

    return !this.currentNode.hasNextNodes();
  }
} 