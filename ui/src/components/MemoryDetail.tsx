import {
  Paper,
  Title,
  Text,
  Badge,
  Group,
  Stack,
  Code,
  Divider,
  CopyButton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import type { Memory, Lane } from "../api/client";

interface Props {
  memory: Memory | null;
}

const LANE_COLORS: Record<Lane, string> = {
  L1: "yellow",
  L2: "blue",
  L3: "green",
};

export function MemoryDetail({ memory }: Props) {
  if (!memory) {
    return (
      <Paper p="xl" withBorder h="100%">
        <Text c="dimmed" ta="center" pt="xl">
          Select a memory to view details
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={4}>{memory.title}</Title>
          <CopyButton value={memory.id}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "Copied" : "Copy ID"}>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={copy}
                  color={copied ? "teal" : "gray"}
                >
                  {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>

        <Group gap="xs">
          <Badge variant="light" color={LANE_COLORS[memory.lane]}>
            {memory.lane}
          </Badge>
          <Badge variant="outline">{memory.kind}</Badge>
          {memory.projectId && (
            <Badge variant="dot" color="gray">
              {memory.projectId}
            </Badge>
          )}
        </Group>

        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
            Summary
          </Text>
          <Text size="sm" style={{ wordBreak: "break-word" }}>
            {memory.summary}
          </Text>
        </div>

        {memory.content && (
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
              Content
            </Text>
            <Code block style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {memory.content}
            </Code>
          </div>
        )}

        <Divider />

        <Group gap="xl">
          <div>
            <Text size="xs" c="dimmed">
              Importance
            </Text>
            <Text size="sm" fw={600}>
              {memory.importance.toFixed(2)}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Recency
            </Text>
            <Text size="sm" fw={600}>
              {memory.recencyScore.toFixed(2)}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Access count
            </Text>
            <Text size="sm" fw={600}>
              {memory.accessCount}
            </Text>
          </div>
          <div>
            <Text size="xs" c="dimmed">
              Trust
            </Text>
            <Text
              size="sm"
              fw={600}
              c={memory.trust >= 0.7 ? "green" : memory.trust >= 0.3 ? "yellow" : "red"}
            >
              {memory.trust.toFixed(2)}
            </Text>
          </div>
        </Group>

        {memory.hydratedRefs.length > 0 && (
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
              References
            </Text>
            <Stack gap={4}>
              {memory.hydratedRefs.map((r) => (
                <Group key={r.id} gap="xs" wrap="nowrap" align="flex-start">
                  <Badge size="xs" variant="light" color="indigo" style={{ flexShrink: 0 }}>
                    ref
                  </Badge>
                  <Text size="sm" style={{ wordBreak: "break-word", flex: 1 }}>
                    {r.title}
                  </Text>
                  <Text size="xs" c="dimmed" ff="monospace" style={{ flexShrink: 0 }}>
                    {r.id.slice(0, 8)}
                  </Text>
                </Group>
              ))}
            </Stack>
          </div>
        )}

        <div>
          <Text size="xs" c="dimmed">
            ID
          </Text>
          <Text size="xs" ff="monospace">
            {memory.id}
          </Text>
        </div>
      </Stack>
    </Paper>
  );
}
