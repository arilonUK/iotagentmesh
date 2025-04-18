
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
    <ScrollArea className="h-[800px] w-full rounded-md border">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">IoT Platform Story Map</h2>
          <p className="text-muted-foreground">
            Development roadmap in CSV format showing activities, tasks, and prioritized stories.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left font-medium">Activity</th>
                <th className="px-4 py-2 text-left font-medium">Task</th>
                <th className="px-4 py-2 text-left font-medium">Priority</th>
                <th className="px-4 py-2 text-left font-medium">User Story</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) =>
                activity.tasks.flatMap((task) =>
                  task.stories.map((story, storyIndex) => (
                    <tr
                      key={`${activity.name}-${task.name}-${storyIndex}`}
                      className="border-b"
                    >
                      {storyIndex === 0 && (
                        <td
                          className="px-4 py-2 font-medium"
                          rowSpan={task.stories.length}
                        >
                          {task === activity.tasks[0] ? activity.name : ""}
                        </td>
                      )}
                      {storyIndex === 0 && (
                        <td
                          className="px-4 py-2"
                          rowSpan={task.stories.length}
                        >
                          {task.name}
                        </td>
                      )}
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            story.priority === 1
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : story.priority === 2
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                          }`}
                        >
                          P{story.priority}
                        </span>
                      </td>
                      <td className="px-4 py-2">{story.text}</td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">P1 (MVP)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">P2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm">P3</span>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default StoryMap;
