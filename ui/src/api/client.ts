import { GraphQLClient, gql } from "graphql-request";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/graphql";
const API_TOKEN = import.meta.env.VITE_API_TOKEN ?? "";

export const client = new GraphQLClient(API_URL, {
  headers: { Authorization: `Bearer ${API_TOKEN}` },
});

// ── Types ──────────────────────────────────────────────────

export type Lane = "L1" | "L2" | "L3";

export interface Memory {
  id: string;
  projectId: string | null;
  lane: Lane;
  kind: string;
  title: string;
  summary: string;
  content: string | null;
  importance: number;
  recencyScore: number;
  accessCount: number;
  refs: string[];
  hydratedRefs: { id: string; title: string }[];
  trust: number;
  validatedAt: string;
}

export interface MemoryKind {
  name: string;
  description: string;
}

export interface AnchorNamespace {
  name: string;
  description: string;
}

export interface Project {
  name: string;
  description: string;
}

export interface RecallInput {
  lanes?: Lane[];
  kinds?: string[];
  projectId?: string;
  anchors?: { namespace: string; value: string }[];
  query?: string;
  limit?: number;
}

// ── Queries ────────────────────────────────────────────────

const RECALL_QUERY = gql`
  query Recall($input: RecallInput!) {
    recall(input: $input) {
      id
      projectId
      lane
      kind
      title
      summary
      content
      importance
      recencyScore
      accessCount
      refs
      hydratedRefs { id title }
      trust
      validatedAt
    }
  }
`;

const MEMORY_KINDS_QUERY = gql`
  query MemoryKinds {
    memoryKinds {
      name
      description
    }
  }
`;

const ANCHOR_NAMESPACES_QUERY = gql`
  query AnchorNamespaces {
    anchorNamespaces {
      name
      description
    }
  }
`;

const PROJECTS_QUERY = gql`
  query Projects {
    projects {
      name
      description
    }
  }
`;

const ANCHOR_VALUES_QUERY = gql`
  query AnchorValues($namespace: String!) {
    anchorValues(namespace: $namespace)
  }
`;

// ── API functions ──────────────────────────────────────────

export async function recall(input: RecallInput): Promise<Memory[]> {
  const data = await client.request<{ recall: Memory[] }>(RECALL_QUERY, {
    input,
  });
  return data.recall;
}

export async function fetchMemoryKinds(): Promise<MemoryKind[]> {
  const data = await client.request<{ memoryKinds: MemoryKind[] }>(
    MEMORY_KINDS_QUERY
  );
  return data.memoryKinds;
}

export async function fetchAnchorNamespaces(): Promise<AnchorNamespace[]> {
  const data = await client.request<{ anchorNamespaces: AnchorNamespace[] }>(
    ANCHOR_NAMESPACES_QUERY
  );
  return data.anchorNamespaces;
}

export async function fetchProjects(): Promise<Project[]> {
  const data = await client.request<{ projects: Project[] }>(PROJECTS_QUERY);
  return data.projects;
}

export async function fetchAnchorValues(namespace: string): Promise<string[]> {
  const data = await client.request<{ anchorValues: string[] }>(
    ANCHOR_VALUES_QUERY,
    { namespace }
  );
  return data.anchorValues;
}
