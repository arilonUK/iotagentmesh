
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const StoryMap = () => {
  const activities = [
    {
      name: "User & Organization Management",
      tasks: [
        {
          name: "Authentication",
          stories: [
            { priority: 1, text: "Create account" },
            { priority: 1, text: "Login with credentials" },
            { priority: 2, text: "Social media login" },
            { priority: 3, text: "Two-factor authentication" }
          ]
        },
        {
          name: "Organization Setup",
          stories: [
            { priority: 1, text: "Create organization" },
            { priority: 1, text: "View organizations" },
            { priority: 2, text: "Customize branding" },
            { priority: 3, text: "Set organization policies" }
          ]
        }
      ]
    },
    {
      name: "Product Management",
      tasks: [
        {
          name: "Product Definition",
          stories: [
            { priority: 1, text: "Create product templates" },
            { priority: 1, text: "Edit product details" },
            { priority: 2, text: "Clone templates" },
            { priority: 3, text: "Define product relationships" }
          ]
        },
        {
          name: "Property Configuration",
          stories: [
            { priority: 1, text: "Define basic properties" },
            { priority: 2, text: "Create property groups" },
            { priority: 3, text: "Define property dependencies" }
          ]
        }
      ]
    },
    {
      name: "Device Management",
      tasks: [
        {
          name: "Device Registration",
          stories: [
            { priority: 1, text: "Register single device" },
            { priority: 2, text: "Bulk import devices" },
            { priority: 3, text: "Secure device provisioning" }
          ]
        },
        {
          name: "Device Monitoring",
          stories: [
            { priority: 1, text: "View device status" },
            { priority: 2, text: "Monitor performance" },
            { priority: 3, text: "Generate health reports" }
          ]
        }
      ]
    }
  ];

  return (
    <ScrollArea className="h-[800px] w-full rounded-md border p-4">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">IoT Platform Story Map</h2>
          <p className="text-muted-foreground mb-6">
            Visual representation of user activities, tasks, and stories prioritized by implementation phases.
          </p>
        </div>
        
        <div className="space-y-6">
          {activities.map((activity, i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <CardTitle>{activity.name}</CardTitle>
                <CardDescription>User activities and related tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activity.tasks.map((task, j) => (
                    <div key={j} className="space-y-2">
                      <h4 className="font-medium text-lg">{task.name}</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {task.stories.map((story, k) => (
                          <div
                            key={k}
                            className={`p-2 rounded-md text-sm ${
                              story.priority === 1
                                ? "bg-green-100 dark:bg-green-900/20"
                                : story.priority === 2
                                ? "bg-yellow-100 dark:bg-yellow-900/20"
                                : "bg-blue-100 dark:bg-blue-900/20"
                            }`}
                          >
                            {story.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Priority 1 (MVP)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Priority 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm">Priority 3</span>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default StoryMap;
