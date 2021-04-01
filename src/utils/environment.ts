import { environments } from '../config.json';

export type Env = {
    id: string;
    apiKey: string;
    api: string;
    name: string;
}

export function getEnvById(envs: Array<Env>, id: string): Env | undefined {
    return envs.find((env) => env.id === id);
}

export function getEnvUrl(env: Env) {
    return `/api/tracking/${env.id}`;
}

export const envs: Array<Env> = environments;
