import { Table, Badge, Text, Group, UnstyledButton, Box } from "@mantine/core";
import type { Memory, Lane } from "../api/client";

interface Props {
  memories: Memory[];
  selected: Memory | null;
  onSelect: (m: Memory) => void;
}

const LANE_COLORS: Record<Lane, string> = {
  L1: "yellow",
  L2: "blue",
  L3: "green",
};

const LANE_LABELS: Record<Lane, string> = {
  L1: "scratch",
  L2: "working",
  L3: "canonical",
};

function ImportanceBar({ value }: { value: number }) {
  return (
    <Box
      style={{
        width: 48,
        height: 6,
        borderRadius: 3,
        background: "var(--mantine-color-dark-5)",
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          width: `${value * 100}%`,
          height: "100%",
          borderRadius: 3,
          background:
            value >= 0.8
              ? "var(--mantine-color-green-6)"
              : value >= 0.5
                ? "var(--mantine-color-yellow-6)"
                : "var(--mantine-color-gray-6)",
        }}
      />
    </Box>
  );
}

export function MemoryTable({ memories, selected, onSelect }: Props) {
  if (memories.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No memories found
      </Text>
    );
  }

  return (
    <Table highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Lane</Table.Th>
          <Table.Th>Kind</Table.Th>
          <Table.Th>Title</Table.Th>
          <Table.Th>Project</Table.Th>
          <Table.Th>Importance</Table.Th>
          <Table.Th>Trust</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {memories.map((m) => (
          <UnstyledButton
            key={m.id}
            component="tr"
            onClick={() => onSelect(m)}
            style={{
              cursor: "pointer",
              background:
                selected?.id === m.id
                  ? "var(--mantine-color-indigo-light)"
                  : undefined,
            }}
          >
            <Table.Td>
              <Badge
                size="sm"
                variant="light"
                color={LANE_COLORS[m.lane]}
              >
                {LANE_LABELS[m.lane]}
              </Badge>
            </Table.Td>
            <Table.Td>
              <Badge size="sm" variant="outline">
                {m.kind}
              </Badge>
            </Table.Td>
            <Table.Td style={{ maxWidth: 360 }}>
              <Text size="sm" fw={500} lineClamp={2} style={{ wordBreak: "break-word" }}>
                {m.title}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="xs" c="dimmed">
                {m.projectId ?? "-"}
              </Text>
            </Table.Td>
            <Table.Td>
              <Group gap="xs">
                <ImportanceBar value={m.importance} />
                <Text size="xs" c="dimmed">
                  {m.importance.toFixed(2)}
                </Text>
              </Group>
            </Table.Td>
            <Table.Td>
              <Group gap="xs">
                <ImportanceBar value={m.trust} />
                <Text size="xs" c="dimmed">
                  {m.trust.toFixed(2)}
                </Text>
              </Group>
            </Table.Td>
          </UnstyledButton>
        ))}
      </Table.Tbody>
    </Table>
  );
}
