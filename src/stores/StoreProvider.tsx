// outsource dependencies
import type { ReactNode } from "react";
import { useContext, createContext } from "react";

// local dependencies
import type { RootStore } from "./RootStore";

const StoreContext = createContext<RootStore | null>(null);

type StoreProviderProps = {
    store: RootStore;
    children: ReactNode;
};

export function StoreProvider({ store, children }: StoreProviderProps) {
    return (
        <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
    );
}

export function useStores(): RootStore {
    const ctx = useContext(StoreContext);
    if (ctx === null) {
        throw new Error("useStores must be used within a StoreProvider");
    }
    return ctx;
}
