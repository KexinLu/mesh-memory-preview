import { useCallback, useEffect, useState } from "react";
import {
  AppShell,
  Container,
  Title,
  Grid,
  Stack,
  Text,
  Loader,
  Center,
  Group,
  Badge,
} from "@mantine/core";
import { MemoryFilters } from "./components/MemoryFilters";
import { MemoryTable } from "./components/MemoryTable";
import { MemoryDetail } from "./components/MemoryDetail";
import { ProjectSelector } from "./components/ProjectSelector";
import { recall, type Memory, type RecallInput } from "./api/client";

export default function App() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selected, setSelected] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<string | null>(null);
  const [filterInput, setFilterInput] = useState<RecallInput>({});

  const doRecall = useCallback(
    async (input: RecallInput) => {
      setLoading(true);
      setError(null);
      try {
        const merged: RecallInput = { ...input };
        if (project) merged.projectId = project;
        const result = await recall(merged);
        setMemories(result);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
        setMemories([]);
      } finally {
        setLoading(false);
      }
    },
    [project]
  );

  useEffect(() => {
    doRecall(filterInput);
  }, [doRecall, filterInput]);

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header
        p="md"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Group gap="md">
          <Title order={3}>mesh-memory</Title>
          <ProjectSelector value={project} onChange={setProject} />
        </Group>
        <Group gap="sm">
          <Badge variant="light" size="lg">
            {memories.length} memories
          </Badge>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="xl">
          <Stack gap="md">
            <MemoryFilters onChange={setFilterInput} />

            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}

            {loading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : (
              <Grid>
                <Grid.Col span={{ base: 12, md: selected ? 7 : 12 }}>
                  <MemoryTable
                    memories={memories}
                    selected={selected}
                    onSelect={setSelected}
                  />
                </Grid.Col>
                {selected && (
                  <Grid.Col span={{ base: 12, md: 5 }}>
                    <MemoryDetail memory={selected} />
                  </Grid.Col>
                )}
              </Grid>
            )}
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
