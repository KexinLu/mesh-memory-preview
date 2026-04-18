import { useEffect, useState } from "react";
import { Select } from "@mantine/core";
import { IconFolder } from "@tabler/icons-react";
import { fetchProjects } from "../api/client";

interface Props {
  value: string | null;
  onChange: (project: string | null) => void;
}

export function ProjectSelector({ value, onChange }: Props) {
  const [projects, setProjects] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects().then((ps) => setProjects(ps.map((p) => p.name)));
  }, []);

  return (
    <Select
      data={projects}
      value={value}
      onChange={onChange}
      placeholder="All projects"
      leftSection={<IconFolder size={16} />}
      clearable
      searchable
      w={240}
    />
  );
}
