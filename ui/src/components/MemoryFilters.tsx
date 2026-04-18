import { useEffect, useState } from "react";
import {
  Group,
  MultiSelect,
  TextInput,
  ActionIcon,
  Paper,
  Stack,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconX } from "@tabler/icons-react";
import {
  fetchMemoryKinds,
  type Lane,
  type RecallInput,
} from "../api/client";

interface Props {
  onChange: (input: RecallInput) => void;
}

const LANE_OPTIONS = [
  { value: "L1", label: "L1 — scratch" },
  { value: "L2", label: "L2 — working" },
  { value: "L3", label: "L3 — canonical" },
];

export function MemoryFilters({ onChange }: Props) {
  const [kinds, setKinds] = useState<string[]>([]);
  const [lanes, setLanes] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 300);

  const [kindOptions, setKindOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchMemoryKinds().then((ks) => setKindOptions(ks.map((k) => k.name)));
  }, []);

  useEffect(() => {
    const input: RecallInput = {};
    if (lanes.length > 0) input.lanes = lanes as Lane[];
    if (kinds.length > 0) input.kinds = kinds;
    if (debouncedQuery) input.query = debouncedQuery;
    onChange(input);
  }, [kinds, lanes, debouncedQuery, onChange]);

  const clearAll = () => {
    setKinds([]);
    setLanes([]);
    setQuery("");
  };

  const hasFilters = kinds.length > 0 || lanes.length > 0 || query;

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        <Group grow>
          <TextInput
            placeholder="Search memories..."
            leftSection={<IconSearch size={16} />}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            rightSection={
              hasFilters && (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={clearAll}
                  aria-label="Clear filters"
                >
                  <IconX size={14} />
                </ActionIcon>
              )
            }
          />
        </Group>
        <Group grow>
          <MultiSelect
            data={LANE_OPTIONS}
            value={lanes}
            onChange={setLanes}
            placeholder="All lanes"
            clearable
          />
          <MultiSelect
            data={kindOptions}
            value={kinds}
            onChange={setKinds}
            placeholder="All kinds"
            clearable
            searchable
          />
        </Group>
      </Stack>
    </Paper>
  );
}
