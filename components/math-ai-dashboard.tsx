"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Upload, Clock,  AlertCircle,  Zap} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { UserCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

interface HistoryItem {
  id: string;
  prompt: string;
  response: string;
  timestamp: number;
}

export function MathAiDashboard() {
  const [prompt, setPrompt] = useState<string>("")
  const [image, setImage] = useState<File | null>(null)
  const [response, setResponse] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeTab, setActiveTab] = useState<'solver' | 'history'>('solver')
  const [expandedItems, setExpandedItems] = useState<any>({});

  useEffect(() => {
    const savedHistory = localStorage.getItem('mathAiHistory')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const saveToHistory = (prompt: string, response: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      prompt,
      response,
      timestamp: Date.now(),
    }
    const updatedHistory = [newItem, ...history].slice(0, 10)
    setHistory(updatedHistory)
    localStorage.setItem('mathAiHistory', JSON.stringify(updatedHistory))
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setResponse("");
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return prevProgress + 10
      })
    }, 1000)

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (image) {
        formData.append("image", image);
      }

      const res = await fetch("/api/ai", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.response);
      saveToHistory(prompt, data.response);
    } catch (error) {
      console.error("Error in API call:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
      clearInterval(interval);
      setProgress(100);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("Image selected:", file.name, file.type, file.size)
      setImage(file)
      setError(null)
    }
  }

  const renderMath = (text: string) => {
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return <BlockMath key={index} math={part.slice(2, -2)} />;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        return <InlineMath key={index} math={part.slice(1, -1)} />;
      } else {
        return part;
      }
    });
  };

  const toggleExpand = (id: any) => {
    setExpandedItems((prev: any) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="flex h-screen dark:bg-gray-900">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex space-x-2 mb-4">
                  <Button
                    variant={activeTab === 'solver' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('solver')}
                  >
                    Problem Solver
                  </Button>
                  <Button
                    variant={activeTab === 'history' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('history')}
                  >
                    History
                  </Button>
                </div>
                {activeTab === 'solver' ? (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your math question here..."
                      className="min-h-[100px] resize-none"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                      >
                        {image ? (
                          <div className="flex flex-col items-center justify-center w-full h-full">
                            <img
                              src={URL.createObjectURL(image)}
                              alt="Uploaded math problem"
                              className="max-h-full max-w-full object-contain rounded-lg"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 800x400px)</p>
                          </div>
                        )}
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                      </label>
                    </div>
                    <Button onClick={handleSubmit} className="w-full" disabled={isLoading || (!prompt.trim() && !image)}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Solving...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Solve Problem
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => {
                      const isExpanded = expandedItems[item.id];
                      return (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <p className="font-semibold">Question:</p>
                            <p className="mb-2">{item.prompt}</p>
                            <p className="font-semibold">Answer:</p>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 mt-1">
                              <div
                                className={`${isExpanded ? '' : 'line-clamp-4'
                                  } transition-all duration-300 ease-in-out`}
                              >
                                {renderMath(item.response)}
                              </div>
                              {!isExpanded && (
                                <button
                                  className="text-blue-500 mt-2"
                                  onClick={() => toggleExpand(item.id)}
                                >
                                  See more...
                                </button>
                              )}
                              {isExpanded && (
                                <button
                                  className="text-blue-500 mt-2"
                                  onClick={() => toggleExpand(item.id)}
                                >
                                  See less
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {isLoading && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estimated time remaining</span>
                  </div>
                  <Progress value={progress} className="mt-2" />
                </CardContent>
              </Card>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {response && activeTab === 'solver' && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start space-x-4">
                    <Avatar>
                      <UserCircle className="h-8 w-8 text-primary" />
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">School AI</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Here's the solution to your problem:</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-inner">
                    {renderMath(response)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}