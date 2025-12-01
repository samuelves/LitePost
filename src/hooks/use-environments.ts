import { useState, useEffect } from "react";
import { Environment, EnvVariable } from "../types";

export function useEnvironments() {
  const [envs, setEnvs] = useState<Environment[]>([]);
  const [activeEnvId, setActiveEnvId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("aero-envs");
    if (saved) {
      setEnvs(JSON.parse(saved));
    } else {
      setEnvs([
        {
          id: "default",
          name: "Global",
          vars: [
            { key: "base_url", value: "http://localhost:3000", active: true },
          ],
        },
      ]);
      setActiveEnvId("default");
    }
  }, []);

  useEffect(() => {
    if (envs.length > 0)
      localStorage.setItem("aero-envs", JSON.stringify(envs));
  }, [envs]);

  const activeVars = activeEnvId
    ? envs.find((e) => e.id === activeEnvId)?.vars || []
    : [];

  const addEnv = (name: string) => {
    const newEnv: Environment = {
      id: Date.now().toString(),
      name,
      vars: [{ key: "", value: "", active: true }],
    };
    setEnvs([...envs, newEnv]);
    setActiveEnvId(newEnv.id);
  };

  const updateEnvVars = (envId: string, newVars: EnvVariable[]) => {
    setEnvs(envs.map((e) => (e.id === envId ? { ...e, vars: newVars } : e)));
  };

  const deleteEnv = (envId: string) => {
    const newEnvs = envs.filter((e) => e.id !== envId);
    setEnvs(newEnvs);
    if (activeEnvId === envId) setActiveEnvId(newEnvs[0]?.id || null);
  };

  return {
    envs,
    activeEnvId,
    setActiveEnvId,
    activeVars,
    addEnv,
    updateEnvVars,
    deleteEnv,
  };
}
