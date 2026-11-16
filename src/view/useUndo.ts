import * as React from "react";
import { Actions, Action } from "../model/Actions";
import { Model } from "../model/Model";

/** actions that don't create an undo step by default */
const DEFAULT_IGNORE_ACTION_TYPES = [Actions.SET_ACTIVE_TABSET];

/**
 * Options for the {@link useUndo} hook
 */
export interface IUndoOptions {
    /** maximum number of undo steps to retain, default 100 */
    maxBufferSize?: number;
    /** action types that should not create an undo step, default [Actions.SET_ACTIVE_TABSET] */
    ignoreActionTypes?: string[];
}

/**
 * The result of the {@link useUndo} hook
 */
export interface IUseUndoResult {
    /** the model to pass to the Layout component */
    model: Model | null;
    /**
     * Replaces the model (e.g. after loading a layout). By default the undo/redo history is
     * cleared; pass `false` as the second argument to keep it (for example for an in-place
     * round-trip of the same model, which should not lose the history).
     */
    setModel: (model: Model, resetHistory?: boolean) => void;
    /** undo the most recent change, if any */
    undo: () => void;
    /** redo the most recently undone change, if any */
    redo: () => void;
    /** true if there is at least one undo step available */
    canUndo: boolean;
    /** true if there is at least one redo step available */
    canRedo: boolean;
    /** the number of undo steps available */
    undoCount: number;
    /** the number of redo steps available */
    redoCount: number;
    /** clear the undo/redo history without replacing the model */
    reset: () => void;
}

/**
 * React hook that encapsulates undo/redo for a FlexLayout {@link Model}. It owns the model state,
 * records an undo snapshot before each model mutation (collapsing an entire drag gesture into a
 * single step), and replaces the model on undo/redo via `Model.fromJson` so mounted tab content
 * is preserved. The model is passed to the Layout component from the returned `model` field.
 *
 * ```javascript
 * const { model, setModel, undo, redo, canUndo, canRedo, undoCount, redoCount } = useUndo(initialModel);
 *
 * <Layout model={model} factory={factory} />
 * <button onClick={undo} disabled={!canUndo}>Undo ({undoCount})</button>
 * <button onClick={redo} disabled={!canRedo}>Redo ({redoCount})</button>
 * ```
 *
 * Each recorded action re-renders the host, which by default re-renders all visible tabs; see the
 * Layout's `invalidateTabContentOnParentRender` prop.
 * @param initialModel the initial model (or null if the model is loaded asynchronously), or a
 * function that lazily returns it (evaluated once, like a `useState` initializer)
 * @param options optional configuration
 */
export function useUndo(initialModel?: Model | null | (() => Model | null), options?: IUndoOptions): IUseUndoResult {
    const maxBufferSize = options?.maxBufferSize ?? 100;
    const ignoreActionTypesRef = React.useRef(options?.ignoreActionTypes ?? DEFAULT_IGNORE_ACTION_TYPES);
    React.useEffect(() => {
        ignoreActionTypesRef.current = options?.ignoreActionTypes ?? DEFAULT_IGNORE_ACTION_TYPES;
    });

    const [model, setModelState] = React.useState<Model | null>(() => {
        if (typeof initialModel === "function") {
            return initialModel();
        }
        return initialModel ?? null;
    });
    const [undoCount, setUndoCount] = React.useState(0);
    const [redoCount, setRedoCount] = React.useState(0);

    // keeps the model available to the change listener and undo/redo without stale closures; it is
    // written from the effect below and from setModel/undo/redo (never during render)
    const modelRef = React.useRef<Model | null>(model);

    const undoBuffer = React.useRef<string[]>([]);
    const redoBuffer = React.useRef<string[]>([]);
    // the pre-drag state for a gesture in progress; only the first adjusting action records it so
    // the whole gesture collapses into a single undo step
    const modelBeforeAdjusting = React.useRef<string | null>(null);

    // record an undo snapshot before each mutation
    React.useEffect(() => {
        if (!model) {
            return;
        }
        modelRef.current = model;
        const changeListener = {
            onBeforeAction: (action: Action) => {
                if (action.isAdjusting()) {
                    if (modelBeforeAdjusting.current === null) {
                        modelBeforeAdjusting.current = JSON.stringify(modelRef.current!.toJson());
                    }
                } else {
                    if (!ignoreActionTypesRef.current.includes(action.type)) {
                        undoBuffer.current.push(modelBeforeAdjusting.current ?? JSON.stringify(modelRef.current!.toJson()));
                        if (undoBuffer.current.length > maxBufferSize) {
                            undoBuffer.current.shift();
                        }
                        redoBuffer.current = [];
                        setUndoCount(undoBuffer.current.length);
                        setRedoCount(0);
                    }
                    modelBeforeAdjusting.current = null;
                }
            },
        };
        model.addChangeListener(changeListener);
        return () => {
            model.removeChangeListener(changeListener);
        };
    }, [model, maxBufferSize]);

    const setModel = React.useCallback((m: Model, resetHistory = true) => {
        modelRef.current = m;
        setModelState(m);
        if (resetHistory) {
            undoBuffer.current = [];
            redoBuffer.current = [];
            modelBeforeAdjusting.current = null;
            setUndoCount(0);
            setRedoCount(0);
        }
    }, []);

    const undo = React.useCallback(() => {
        const current = modelRef.current;
        if (!current) {
            return;
        }
        const json = undoBuffer.current.pop();
        if (json === undefined) {
            return;
        }
        redoBuffer.current.push(JSON.stringify(current.toJson()));
        const next = Model.fromJson(JSON.parse(json), current);
        modelRef.current = next;
        setUndoCount(undoBuffer.current.length);
        setRedoCount(redoBuffer.current.length);
        setModelState(next);
    }, []);

    const redo = React.useCallback(() => {
        const current = modelRef.current;
        if (!current) {
            return;
        }
        const json = redoBuffer.current.pop();
        if (json === undefined) {
            return;
        }
        undoBuffer.current.push(JSON.stringify(current.toJson()));
        const next = Model.fromJson(JSON.parse(json), current);
        modelRef.current = next;
        setUndoCount(undoBuffer.current.length);
        setRedoCount(redoBuffer.current.length);
        setModelState(next);
    }, []);

    const reset = React.useCallback(() => {
        undoBuffer.current = [];
        redoBuffer.current = [];
        modelBeforeAdjusting.current = null;
        setUndoCount(0);
        setRedoCount(0);
    }, []);

    return {
        model,
        setModel,
        undo,
        redo,
        canUndo: undoCount > 0,
        canRedo: redoCount > 0,
        undoCount,
        redoCount,
        reset,
    };
}
