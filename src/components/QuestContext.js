import { createContext, useContext, useState } from "react";

const QuestContext = createContext();

export function QuestProvider({ children }) {
  const [quests, setQuests] = useState([]);

  const addQuest = (newQuest) => {
    setQuests((prevQuests) => [...prevQuests, newQuest]);
  };

  return (
    <QuestContext.Provider value={{ quests, addQuest }}>
      {children}
    </QuestContext.Provider>
  );
}

export function useQuest() {
  return useContext(QuestContext);
}