import { environments } from '../config.json';

export type Env = {
    id: string;
    apiKey: string;
    api: string;
    name: string;
    devOnly: boolean;
};

export function getEnvById(envs: Array<Env>, id: string): Env | undefined {
    return envs.find((env) => env.id === id);
}

export function getEnvUrl(env: Env) {
    return `/api/tracking/${env.id}`;
}

export const envs: Array<Env> = environments.filter(
    (env) => !env.devOnly || process.env.REACT_APP_MODE === 'development'
);
