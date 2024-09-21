import React, {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react"
import { ChatMessage, ChatThread } from "../shared_types"
import { getVSCodeAPI } from "./getVscodeApi"

const createEmptyThread = () => ({
    id: "",
    createdAt: "",
    messages: [],
})

const createNewThread = () => ({
	id: new Date().getTime().toString(),
	createdAt: new Date().toISOString(),
	messages: [],
})

interface IChatProviderProps {
	chatMessageHistory: ChatMessage[]
	addMessageToHistory: (message: ChatMessage) => void
	setPreviousThreads: (threads: any) => void
	previousThreads: ChatThread[]
	selectThread: (thread: ChatThread) => void
}

const defaults = {
	chatMessageHistory: [],
	addMessageToHistory: () => {},
	setPreviousThreads: () => {},
    // placeholder for thread until first message is sent so that createdAt date is accurate
	thread: createEmptyThread(),
	previousThreads: [],
	selectThread: () => {},
}

const ChatContext = createContext<IChatProviderProps>(defaults)

function ChatProvider({ children }: { children: ReactNode }) {
	const [previousThreads, setPreviousThreads] = useState<ChatThread[]>(
		defaults.previousThreads
	)
	const [thread, setThread] = useState<ChatThread>(defaults.thread)

	useEffect(() => {
		getVSCodeAPI().postMessage({ type: "getThreadHistory" })
	}, [])

	useEffect(() => {
		if (thread.messages.length) {
			getVSCodeAPI().postMessage({ type: "updateThread", thread })
		}
	}, [thread])

	const addMessageToHistory = (message: ChatMessage) => {
		setThread((prev) => ({
			...prev,
			// if there is no thread, create a new one with current timestamp
			...(!thread.id && createNewThread()),
			messages: [...prev.messages, message],
		}))
	}

	const handleReceiveThreadHistory = (threads: ChatThread[]) =>
		setPreviousThreads(
			threads.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			)
		)

	return (
		<ChatContext.Provider
			value={{
				chatMessageHistory: thread.messages,
				addMessageToHistory,
				setPreviousThreads: handleReceiveThreadHistory,
				previousThreads,
				selectThread: setThread,
			}}
		>
			{children}
		</ChatContext.Provider>
	)
}

function useChat(): IChatProviderProps {
	const context = useContext<IChatProviderProps>(ChatContext)
	if (context === undefined) {
		throw new Error("useChat must be used within a ChatProvider")
	}
	return context
}

export { ChatProvider, useChat }
