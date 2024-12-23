/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Glass Devtools, Inc. All rights reserved.
 *  Void Editor additions licensed under the AGPLv3 License.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IEncryptionService } from '../../../../platform/encryption/common/encryptionService.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';

const configEnum = <EnumArr extends readonly string[]>(description: string, defaultVal: EnumArr[number], enumArr: EnumArr) => {
	return {
		description,
		defaultVal,
		enumArr,
	}
}

const configString = (description: string, defaultVal: string) => {
	return {
		description,
		defaultVal,
		enumArr: undefined,
	}
}

export const parseMaxTokensStr = (maxTokensStr: string) => {
	// parse the string but only if the full string is a valid number, eg parseInt('100abc') should return NaN
	const int = isNaN(Number(maxTokensStr)) ? undefined : parseInt(maxTokensStr)
	if (Number.isNaN(int))
		return undefined
	return int
}


// fields you can customize (don't forget 'default' - it isn't included here!)
export const nonDefaultConfigFields = [
	'anthropic',
	'openAI',
	'gemini',
	'greptile',
	'groq',
	'ollama',
	'openRouter',
	'openAICompatible',
	'azure',
] as const



const voidConfigInfo: Record<
	typeof nonDefaultConfigFields[number] | 'default', {
		[prop: string]: {
			description: string;
			enumArr?: readonly string[] | undefined;
			defaultVal: string;
		};
	}
> = {
	default: {
		whichApi: configEnum(
			'API Provider.',
			'anthropic',
			nonDefaultConfigFields,
		),

		maxTokens: configEnum(
			'Max number of tokens to output.',
			'1024',
			[
				'default', // this will be parseInt'd into NaN and ignored by the API. Anything that's not a number has this behavior.
				'1024',
				'2048',
				'4096',
				'8192'
			] as const,
		),

	},
	anthropic: {
		apikey: configString('Anthropic API key.', ''),
		model: configEnum(
			'Anthropic model to use.',
			'claude-3-5-sonnet-20240620',
			[
				'claude-3-5-sonnet-20240620',
				'claude-3-opus-20240229',
				'claude-3-sonnet-20240229',
				'claude-3-haiku-20240307'
			] as const,
		),
	},
	openAI: {
		apikey: configString('OpenAI API key.', ''),
		model: configEnum(
			'OpenAI model to use.',
			'gpt-4o',
			[
				'o1-preview',
				'o1-mini',
				'gpt-4o',
				'gpt-4o-2024-05-13',
				'gpt-4o-2024-08-06',
				'gpt-4o-mini',
				'gpt-4o-mini-2024-07-18',
				'gpt-4-turbo',
				'gpt-4-turbo-2024-04-09',
				'gpt-4-turbo-preview',
				'gpt-4-0125-preview',
				'gpt-4-1106-preview',
				'gpt-4',
				'gpt-4-0613',
				'gpt-3.5-turbo-0125',
				'gpt-3.5-turbo',
				'gpt-3.5-turbo-1106'
			] as const
		),
	},
	greptile: {
		apikey: configString('Greptile API key.', ''),
		githubPAT: configString('Github PAT that Greptile uses to access your repository', ''),
		remote: configEnum(
			'Repo location',
			'github',
			[
				'github',
				'gitlab'
			] as const
		),
		repository: configString('Repository identifier in "owner / repository" format.', ''),
		branch: configString('Name of the branch to use.', 'main'),
	},
	groq: {
		apikey: configString('Groq API key.', ''),
		model: configEnum(
			'Groq model to use.',
			'mixtral-8x7b-32768',
			[
				"mixtral-8x7b-32768",
				"llama2-70b-4096",
				"gemma-7b-it"
			] as const
		),
	},
	ollama: {
		endpoint: configString(
			'The endpoint of your Ollama instance. Start Ollama by running `OLLAMA_ORIGINS="vscode - webview://*" ollama serve`.',
			'http://127.0.0.1:11434'
		),
		model: configEnum(
			'Ollama model to use.',
			'codestral',
			['codestral', 'qwen2.5-coder', 'qwen2.5-coder:0.5b', 'qwen2.5-coder:1.5b', 'qwen2.5-coder:3b', 'qwen2.5-coder:7b', 'qwen2.5-coder:14b', 'qwen2.5-coder:32b', 'codegemma', 'codegemma:2b', 'codegemma:7b', 'codellama', 'codellama:7b', 'codellama:13b', 'codellama:34b', 'codellama:70b', 'codellama:code', 'codellama:python', 'command-r', 'command-r:35b', 'command-r-plus', 'command-r-plus:104b', 'deepseek-coder-v2', 'deepseek-coder-v2:16b', 'deepseek-coder-v2:236b', 'falcon2', 'falcon2:11b', 'firefunction-v2', 'firefunction-v2:70b', 'gemma', 'gemma:2b', 'gemma:7b', 'gemma2', 'gemma2:2b', 'gemma2:9b', 'gemma2:27b', 'llama2', 'llama2:7b', 'llama2:13b', 'llama2:70b', 'llama3', 'llama3:8b', 'llama3:70b', 'llama3-chatqa', 'llama3-chatqa:8b', 'llama3-chatqa:70b', 'llama3-gradient', 'llama3-gradient:8b', 'llama3-gradient:70b', 'llama3.1', 'llama3.1:8b', 'llama3.1:70b', 'llama3.1:405b', 'llava', 'llava:7b', 'llava:13b', 'llava:34b', 'llava-llama3', 'llava-llama3:8b', 'llava-phi3', 'llava-phi3:3.8b', 'mistral', 'mistral:7b', 'mistral-large', 'mistral-large:123b', 'mistral-nemo', 'mistral-nemo:12b', 'mixtral', 'mixtral:8x7b', 'mixtral:8x22b', 'moondream', 'moondream:1.8b', 'openhermes', 'openhermes:v2.5', 'phi3', 'phi3:3.8b', 'phi3:14b', 'phi3.5', 'phi3.5:3.8b', 'qwen', 'qwen:7b', 'qwen:14b', 'qwen:32b', 'qwen:72b', 'qwen:110b', 'qwen2', 'qwen2:0.5b', 'qwen2:1.5b', 'qwen2:7b', 'qwen2:72b', 'smollm', 'smollm:135m', 'smollm:360m', 'smollm:1.7b'] as const
		),
	},
	openRouter: {
		model: configString(
			'OpenRouter model to use.',
			'openai/gpt-4o'
		),
		apikey: configString('OpenRouter API key.', ''),
	},
	openAICompatible: {
		endpoint: configString('The baseUrl (exluding /chat/completions).', 'http://127.0.0.1:11434/v1'),
		model: configString('The name of the model to use.', 'gpt-4o'),
		apikey: configString('Your API key.', ''),
	},
	azure: {
		// 'void.azure.apiKey': {
		// 	'type': 'string',
		// 	'description': 'Azure API key.'
		// },
		// 'void.azure.deploymentId': {
		// 	'type': 'string',
		// 	'description': 'Azure API deployment ID.'
		// },
		// 'void.azure.resourceName': {
		// 	'type': 'string',
		// 	'description': 'Name of the Azure OpenAI resource. Either this or `baseURL` can be used. \nThe resource name is used in the assembled URL: `https://{resourceName}.openai.azure.com/openai/deployments/{modelId}{path}`'
		// },
		// 'void.azure.providerSettings': {
		// 	'type': 'object',
		// 	'properties': {
		// 		'baseURL': {
		// 			'type': 'string',
		// 			'default': 'https://${resourceName}.openai.azure.com/openai/deployments',
		// 			'description': 'Azure API base URL.'
		// 		},
		// 		'headers': {
		// 			'type': 'object',
		// 			'description': 'Custom headers to include in the requests.'
		// 		}
		// 	}
		// },
	},
	gemini: {
		apikey: configString('Google API key.', ''),
		model: configEnum(
			'Gemini model to use.',
			'gemini-1.5-flash',
			[
				'gemini-1.5-flash',
				'gemini-1.5-pro',
				'gemini-1.5-flash-8b',
				'gemini-1.0-pro'
			] as const
		),
	},
}


// this is the type that comes with metadata like desc, default val, etc
export type VoidConfigInfo = typeof voidConfigInfo
export type VoidConfigField = keyof typeof voidConfigInfo // typeof configFields[number]

// this is the type that specifies the user's actual config
export type PartialVoidConfig = {
	[K in keyof typeof voidConfigInfo]?: {
		[P in keyof typeof voidConfigInfo[K]]?: typeof voidConfigInfo[K][P]['defaultVal']
	}
}

export type VoidConfig = {
	[K in keyof typeof voidConfigInfo]: {
		[P in keyof typeof voidConfigInfo[K]]: typeof voidConfigInfo[K][P]['defaultVal']
	}
}


const getVoidConfig = (partialVoidConfig: PartialVoidConfig): VoidConfig => {
	const config = {} as PartialVoidConfig
	for (const field of [...nonDefaultConfigFields, 'default'] as const) {
		config[field] = {}
		for (const prop in voidConfigInfo[field]) {
			config[field][prop] = partialVoidConfig[field]?.[prop]?.trim() || voidConfigInfo[field][prop].defaultVal
		}
	}
	return config as VoidConfig
}


const VOID_CONFIG_KEY = 'void.partialVoidConfig'

export type SetFieldFnType = <K extends VoidConfigField>(field: K, param: keyof VoidConfigInfo[K], newVal: string) => Promise<void>;

export type ConfigState = {
	partialVoidConfig: PartialVoidConfig; // free parameter
	voidConfig: VoidConfig; // computed from partialVoidConfig
}

export interface IVoidConfigStateService {
	readonly _serviceBrand: undefined;
	readonly state: ConfigState;
	readonly voidConfigInfo: VoidConfigInfo;
	onDidChangeState: Event<void>;
	setField: SetFieldFnType;
}

export const IVoidConfigStateService = createDecorator<IVoidConfigStateService>('VoidConfigStateService');
class VoidConfigStateService extends Disposable implements IVoidConfigStateService {
	_serviceBrand: undefined;

	private readonly _onDidChangeState = new Emitter<void>();
	readonly onDidChangeState: Event<void> = this._onDidChangeState.event; // this is primarily for use in react, so react can listen + update on state changes

	state: ConfigState;
	readonly voidConfigInfo: VoidConfigInfo = voidConfigInfo; // just putting this here for simplicity, it's static though

	constructor(
		@IStorageService private readonly _storageService: IStorageService,
		@IEncryptionService private readonly _encryptionService: IEncryptionService,
		// could have used this, but it's clearer the way it is (+ slightly different eg StorageTarget.USER)
		// @ISecretStorageService private readonly _secretStorageService: ISecretStorageService,
	) {
		super()

		// at the start, we haven't read the partial config yet, but we need to set state to something, just treat partialVoidConfig like it's empty
		this.state = {
			partialVoidConfig: {},
			voidConfig: getVoidConfig({}),
		}

		// read and update the actual state immediately
		this._readPartialVoidConfig().then(partialVoidConfig => {
			this._setState(partialVoidConfig)
		})

	}

	private async _readPartialVoidConfig(): Promise<PartialVoidConfig> {
		const encryptedPartialConfig = this._storageService.get(VOID_CONFIG_KEY, StorageScope.APPLICATION)

		if (!encryptedPartialConfig)
			return {}

		const partialVoidConfigStr = await this._encryptionService.decrypt(encryptedPartialConfig)
		return JSON.parse(partialVoidConfigStr)
	}


	private async _storePartialVoidConfig(partialVoidConfig: PartialVoidConfig) {
		const encryptedPartialConfigStr = await this._encryptionService.encrypt(JSON.stringify(partialVoidConfig))
		this._storageService.store(VOID_CONFIG_KEY, encryptedPartialConfigStr, StorageScope.APPLICATION, StorageTarget.USER)
	}


	// Set field on PartialVoidConfig
	setField: SetFieldFnType = async <K extends VoidConfigField>(field: K, param: keyof VoidConfigInfo[K], newVal: string) => {
		const { partialVoidConfig } = this.state

		const newPartialConfig: PartialVoidConfig = {
			...partialVoidConfig,
			[field]: {
				...partialVoidConfig[field],
				[param]: newVal
			}
		}
		await this._storePartialVoidConfig(newPartialConfig)
		this._setState(newPartialConfig)
	}

	// internal function to update state, should be called every time state changes
	private async _setState(partialVoidConfig: PartialVoidConfig) {
		this.state = {
			partialVoidConfig: partialVoidConfig,
			voidConfig: getVoidConfig(partialVoidConfig),
		}
		this._onDidChangeState.fire()
	}

}

registerSingleton(IVoidConfigStateService, VoidConfigStateService, InstantiationType.Eager);
