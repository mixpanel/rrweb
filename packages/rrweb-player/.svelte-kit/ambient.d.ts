
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const ANTHROPIC_VERTEX_PROJECT_ID: string;
	export const LESSOPEN: string;
	export const npm_package_dev: string;
	export const SLACK_BOT_TOKEN: string;
	export const TFLINT_OPA_POLICY_DIR: string;
	export const USER: string;
	export const SSH_CLIENT: string;
	export const CLAUDE_CODE_ENTRYPOINT: string;
	export const npm_config_user_agent: string;
	export const GIT_EDITOR: string;
	export const CHRONOSPHERE_ORG_NAME: string;
	export const XDG_SESSION_TYPE: string;
	export const GIT_ASKPASS: string;
	export const npm_node_execpath: string;
	export const npm_package_resolved: string;
	export const SHLVL: string;
	export const BROWSER: string;
	export const npm_config_noproxy: string;
	export const GO15VENDOREXPERIMENT: string;
	export const HOME: string;
	export const npm_package_optional: string;
	export const TERM_PROGRAM_VERSION: string;
	export const VSCODE_IPC_HOOK_CLI: string;
	export const npm_package_json: string;
	export const BASH_DEFAULT_TIMEOUT_MS: string;
	export const npm_package_engines_node: string;
	export const NODE_OPTIONS: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const FNM_ARCH: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const SSL_CERT_FILE: string;
	export const npm_config_userconfig: string;
	export const npm_config_local_prefix: string;
	export const npm_package_integrity: string;
	export const NEW_MACHINE: string;
	export const VSCODE_PYTHON_AUTOACTIVATE_GUARD: string;
	export const GH_NO_UPDATE_NOTIFIER: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const COLORTERM: string;
	export const GOOGLE_APPLICATION_CREDENTIALS: string;
	export const COLOR: string;
	export const DEBUGINFOD_URLS: string;
	export const FNM_VERSION_FILE_STRATEGY: string;
	export const USE_GKE_GCLOUD_AUTH_PLUGIN: string;
	export const FNM_LOGLEVEL: string;
	export const LOGNAME: string;
	export const FNM_NODE_DIST_MIRROR: string;
	export const CLAUDE_CODE_USE_VERTEX: string;
	export const _: string;
	export const npm_config_prefix: string;
	export const npm_config_npm_version: string;
	export const CLAUDE_CODE_SSE_PORT: string;
	export const XDG_SESSION_CLASS: string;
	export const GEMINI_CLI_IDE_WORKSPACE_PATH: string;
	export const TERM: string;
	export const XDG_SESSION_ID: string;
	export const OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: string;
	export const npm_config_cache: string;
	export const SLACK_TEAM_ID: string;
	export const CLOUD_ML_REGION: string;
	export const GEMINI_CLI_IDE_SERVER_PORT: string;
	export const npm_config_node_gyp: string;
	export const PATH: string;
	export const NODE: string;
	export const npm_package_name: string;
	export const COREPACK_ENABLE_AUTO_PIN: string;
	export const XDG_RUNTIME_DIR: string;
	export const DEVBOX: string;
	export const SSL_CERT_DIR: string;
	export const NoDefaultCurrentDirectoryInExePath: string;
	export const LANG: string;
	export const VIRTUAL_ENV_PROMPT: string;
	export const UV_INDEX_GCP_ARTIFACT_REGISTRY_USERNAME: string;
	export const LS_COLORS: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const FNM_DIR: string;
	export const TERM_PROGRAM: string;
	export const npm_lifecycle_script: string;
	export const SSH_AUTH_SOCK: string;
	export const FNM_RESOLVE_ENGINES: string;
	export const SHELL: string;
	export const GITHUB_PERSONAL_ACCESS_TOKEN: string;
	export const GOPATH: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const LESSCLOSE: string;
	export const CLAUDECODE: string;
	export const npm_package_dev_optional: string;
	export const VIRTUAL_ENV: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const GEMINI_CLI_IDE_AUTH_TOKEN: string;
	export const npm_config_globalconfig: string;
	export const npm_config_init_module: string;
	export const npm_package_peer: string;
	export const PWD: string;
	export const OTEL_RESOURCE_ATTRIBUTES: string;
	export const GCP_DEVBOX: string;
	export const FNM_MULTISHELL_PATH: string;
	export const npm_execpath: string;
	export const VIRTUAL_ENV_DISABLE_PROMPT: string;
	export const SSH_CONNECTION: string;
	export const XDG_DATA_DIRS: string;
	export const npm_config_global_prefix: string;
	export const npm_command: string;
	export const FNM_COREPACK_ENABLED: string;
	export const MANPATH: string;
	export const INIT_CWD: string;
	export const EDITOR: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		ANTHROPIC_VERTEX_PROJECT_ID: string;
		LESSOPEN: string;
		npm_package_dev: string;
		SLACK_BOT_TOKEN: string;
		TFLINT_OPA_POLICY_DIR: string;
		USER: string;
		SSH_CLIENT: string;
		CLAUDE_CODE_ENTRYPOINT: string;
		npm_config_user_agent: string;
		GIT_EDITOR: string;
		CHRONOSPHERE_ORG_NAME: string;
		XDG_SESSION_TYPE: string;
		GIT_ASKPASS: string;
		npm_node_execpath: string;
		npm_package_resolved: string;
		SHLVL: string;
		BROWSER: string;
		npm_config_noproxy: string;
		GO15VENDOREXPERIMENT: string;
		HOME: string;
		npm_package_optional: string;
		TERM_PROGRAM_VERSION: string;
		VSCODE_IPC_HOOK_CLI: string;
		npm_package_json: string;
		BASH_DEFAULT_TIMEOUT_MS: string;
		npm_package_engines_node: string;
		NODE_OPTIONS: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		FNM_ARCH: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		SSL_CERT_FILE: string;
		npm_config_userconfig: string;
		npm_config_local_prefix: string;
		npm_package_integrity: string;
		NEW_MACHINE: string;
		VSCODE_PYTHON_AUTOACTIVATE_GUARD: string;
		GH_NO_UPDATE_NOTIFIER: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		COLORTERM: string;
		GOOGLE_APPLICATION_CREDENTIALS: string;
		COLOR: string;
		DEBUGINFOD_URLS: string;
		FNM_VERSION_FILE_STRATEGY: string;
		USE_GKE_GCLOUD_AUTH_PLUGIN: string;
		FNM_LOGLEVEL: string;
		LOGNAME: string;
		FNM_NODE_DIST_MIRROR: string;
		CLAUDE_CODE_USE_VERTEX: string;
		_: string;
		npm_config_prefix: string;
		npm_config_npm_version: string;
		CLAUDE_CODE_SSE_PORT: string;
		XDG_SESSION_CLASS: string;
		GEMINI_CLI_IDE_WORKSPACE_PATH: string;
		TERM: string;
		XDG_SESSION_ID: string;
		OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: string;
		npm_config_cache: string;
		SLACK_TEAM_ID: string;
		CLOUD_ML_REGION: string;
		GEMINI_CLI_IDE_SERVER_PORT: string;
		npm_config_node_gyp: string;
		PATH: string;
		NODE: string;
		npm_package_name: string;
		COREPACK_ENABLE_AUTO_PIN: string;
		XDG_RUNTIME_DIR: string;
		DEVBOX: string;
		SSL_CERT_DIR: string;
		NoDefaultCurrentDirectoryInExePath: string;
		LANG: string;
		VIRTUAL_ENV_PROMPT: string;
		UV_INDEX_GCP_ARTIFACT_REGISTRY_USERNAME: string;
		LS_COLORS: string;
		VSCODE_GIT_IPC_HANDLE: string;
		FNM_DIR: string;
		TERM_PROGRAM: string;
		npm_lifecycle_script: string;
		SSH_AUTH_SOCK: string;
		FNM_RESOLVE_ENGINES: string;
		SHELL: string;
		GITHUB_PERSONAL_ACCESS_TOKEN: string;
		GOPATH: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		LESSCLOSE: string;
		CLAUDECODE: string;
		npm_package_dev_optional: string;
		VIRTUAL_ENV: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		GEMINI_CLI_IDE_AUTH_TOKEN: string;
		npm_config_globalconfig: string;
		npm_config_init_module: string;
		npm_package_peer: string;
		PWD: string;
		OTEL_RESOURCE_ATTRIBUTES: string;
		GCP_DEVBOX: string;
		FNM_MULTISHELL_PATH: string;
		npm_execpath: string;
		VIRTUAL_ENV_DISABLE_PROMPT: string;
		SSH_CONNECTION: string;
		XDG_DATA_DIRS: string;
		npm_config_global_prefix: string;
		npm_command: string;
		FNM_COREPACK_ENABLED: string;
		MANPATH: string;
		INIT_CWD: string;
		EDITOR: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
