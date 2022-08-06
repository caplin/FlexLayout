// Libs
import React, { createContext, useContext, useEffect, useState } from "react"
import { Model } from "flexlayout-react"

import { getHighlightedJSON } from "./utils"

// Project imports

interface IAppContext {
  fontSize: string
  setFontsize: (size: string) => void

  isAdding: boolean
  setIsAdding: (isAdding: boolean) => void

  realtimeResize: boolean
  setRealtimeResize: (realtimeResize: boolean) => void

  highlightedJson?: string

  layoutFile: string
  setLayoutFile: (file: string) => void

  model?: Model
  setModel: (model: Model) => void

  nextGridIndex: number
  incNextGridIndex: () => void

  showingPopupMenu: boolean
  setShowingPopupMenu: (showingPopupMenu: boolean) => void
}

const AppContext = createContext<IAppContext | undefined>(undefined)

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontsize] = useState("medium")
  const [highlightedJson, setHighlightedJson] = useState<string | undefined>()
  const [layoutFile, setLayoutFile] = useState("default")
  const [model, setModel] = useState<Model | undefined>()
  const [isAdding, setIsAdding] = useState(false)
  const [realtimeResize, setRealtimeResize] = useState(false)

  const [nextGridIndex, setNextGridIndex] = useState(1)
  const [showingPopupMenu, setShowingPopupMenu] = useState(false)

  const incNextGridIndex = () => {
    setNextGridIndex(nextGridIndex + 1)
  }

  useEffect(() => {
    if (model) {
      const jsonText = JSON.stringify(model.toJson(), null, "\t")
      const html = getHighlightedJSON(jsonText)
      setHighlightedJson(html)
    }
  }, [model])

  const ctx = {
    layoutFile,
    setLayoutFile,
    model,
    setModel,
    isAdding,
    setIsAdding,
    fontSize,
    setFontsize,
    realtimeResize,
    setRealtimeResize,
    highlightedJson,
    nextGridIndex,
    incNextGridIndex,
    showingPopupMenu,
    setShowingPopupMenu,
  }

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error("Context is not provided")
  }
  return ctx
}
