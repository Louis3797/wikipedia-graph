export interface Node {
  title: string;
  color: string;
}

export interface Link {
  source: Node;
  target: Node;
}
