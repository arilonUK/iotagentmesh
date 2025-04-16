
import { Home, BarChart, ListChecks, Box } from "lucide-react";

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
    to: "/dashboard/products",
    icon: Box,
    label: "Products",
    end: false
  }
] as const;
