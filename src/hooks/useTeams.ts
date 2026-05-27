// hooks/useTeams.ts
import { useState, useEffect } from "react";
import { TeamService } from "@/services/teamService";
import { Team } from "@/models";

const teamService = new TeamService();

export function useTeams(departmentId: string) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!departmentId) {
      setTeams([]);
      return;
    }
    setLoading(true);
    teamService.getByDepartment(departmentId)
      .then(setTeams)
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  }, [departmentId]);

  return { teams, loading };
}
