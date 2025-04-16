
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
    label: "Devices"
  },
  {
    to: "/dashboard/data-buckets",
    icon: ListChecks,
    label: "Data Buckets"
  },
  {
    to: "/dashboard/products",
    icon: Box,
    label: "Products"
  }
] as const;
