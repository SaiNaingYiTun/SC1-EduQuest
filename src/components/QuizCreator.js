import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Plus, Trash2, Save, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function QuizCreator({ onSaveQuiz }) {
  const [quizTitle, setQuizTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [characterClass, setCharacterClass] = useState("warrior");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState("100");
  const [itemReward, setItemReward] = useState("");
  const [questions, setQuestions] = useState([
    {
      id: "q1",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    }
  ]);

  const addQuestion = () => {
    const newQuestion = {
      id: `q${questions.length + 1}`,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    } else {
      toast.error("Quiz must have at least one question");
    }
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSave = () => {
    // Validation
    if (!quizTitle.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    const invalidQuestions = questions.filter(q => 
      !q.question.trim() || q.options.some(opt => !opt.trim())
    );

    if (invalidQuestions.length > 0) {
      toast.error("Please complete all questions and options");
      return;
    }

    const quiz = {
      id: `custom-${Date.now()}`,
      title: quizTitle,
      subject,
      difficulty,
      characterClass,
      description,
      duration: `${Math.max(3, questions.length * 2)} min`,
      xpReward: parseInt(xpReward) || 100,
      itemReward: itemReward || undefined,
      questions: questions.map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }))
    };

    onSaveQuiz(quiz);
    toast.success("Quiz created successfully!");
    
    // Reset form
    setQuizTitle("");
    setSubject("");
    setDescription("");
    setItemReward("");
    setQuestions([{
      id: "q1",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    }]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
          <CardDescription>Set up the basic details for your quest</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quest Title</Label>
              <Input
                id="title"
                placeholder="e.g., Algebraic Expressions"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Character Class</Label>
              <Select value={characterClass} onValueChange={setCharacterClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warrior">Warrior (Math)</SelectItem>
                  <SelectItem value="mage">Mage (Science)</SelectItem>
                  <SelectItem value="hacker">Hacker (Programming)</SelectItem>
                  <SelectItem value="scholar">Scholar (History)</SelectItem>
                  <SelectItem value="artist">Artist (Arts)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="xp">XP Reward</Label>
              <Input
                id="xp"
                type="number"
                placeholder="100"
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item">Item Reward (Optional)</Label>
              <Input
                id="item"
                placeholder="e.g., ⚔️ Iron Sword"
                value={itemReward}
                onChange={(e) => setItemReward(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-xl">Questions</h3>
        <Button onClick={addQuestion} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      <AnimatePresence>
        {questions.map((question, qIndex) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                  {questions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Textarea
                    placeholder="Enter your question..."
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Answer Options</Label>
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <Badge variant={question.correctAnswer === optIndex ? "default" : "outline"}>
                        {String.fromCharCode(65 + optIndex)}
                      </Badge>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        value={option}
                        onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                      />
                      <Button
                        variant={question.correctAnswer === optIndex ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateQuestion(question.id, 'correctAnswer', optIndex)}
                      >
                        {question.correctAnswer === optIndex ? "✓ Correct" : "Set Correct"}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Explanation (Optional)</Label>
                  <Textarea
                    placeholder="Explain the correct answer..."
                    value={question.explanation}
                    onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Cancel
        </Button>
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />
          Create Quest
        </Button>
      </div>
    </div>
  );
}
