
import { Home, BarChart, ListChecks, Box, MessageSquare, HardDrive } from "lucide-react";

export const dashboardMenuItems = [
  {
    to: "/dashboard",
    icon: Home,
    label: "Home",
    end: true
  },
  {
    to: "/dashboard/devices",
    icon: BarChart,
    label: "Devices",
    end: false
  },
  {
    to: "/dashboard/data-buckets",
    icon: ListChecks,
    label: "Data Buckets",
    end: false
  },
  {
    to: "/dashboard/endpoints",
    icon: MessageSquare,
    label: "Endpoints",
    end: false
  },
  {
    to: "/dashboard/storage",
    icon: HardDrive,
    label: "File Storage",
    end: false
  },
  {
    to: "/dashboard/products",
    icon: Box,
    label: "Products",
    end: false
  }
] as const;
