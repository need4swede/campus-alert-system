
import React from 'react';
import { useAlert } from '@/context/AlertContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart as BarChartIcon,
  Clock,
  UserCircle,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Statistics = () => {
  const { alertHistory } = useAlert();

  // Get counts by alert type
  const alertCounts = alertHistory.reduce((acc, alert) => {
    const type = alert.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Format for bar chart
  const barChartData = Object.entries(alertCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Get counts by user
  const userCounts = alertHistory.reduce((acc, alert) => {
    const userId = alert.initiatedBy.id;
    const userName = alert.initiatedBy.name;
    acc[userId] = acc[userId] || { name: userName, value: 0 };
    acc[userId].value += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number }>);

  // Format for pie chart
  const pieChartData = Object.values(userCounts);

  // Calculate average resolution time (in minutes)
  const resolutionTimes = alertHistory
    .filter((alert) => alert.resolvedAt)
    .map((alert) => {
      const start = new Date(alert.timestamp).getTime();
      const end = new Date(alert.resolvedAt!).getTime();
      return Math.round((end - start) / (1000 * 60)); // Convert ms to minutes
    });

  const averageResolutionTime =
    resolutionTimes.length > 0
      ? Math.round(
          resolutionTimes.reduce((sum, time) => sum + time, 0) /
            resolutionTimes.length
        )
      : 0;

  // Chart colors
  const COLORS = ['#ffc107', '#2196f3', '#f44336', '#ff9800', '#9c27b0'];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Alert Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{alertHistory.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Common Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChartIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold capitalize">
                {barChartData.length > 0
                  ? barChartData.reduce((a, b) => (a.value > b.value ? a : b)).name
                  : 'None'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {averageResolutionTime} min
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Initiator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">
                {pieChartData.length > 0
                  ? pieChartData.reduce((a, b) => (a.value > b.value ? a : b)).name
                  : 'None'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Alerts by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts by User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Initiated By</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Resolved By</TableHead>
                <TableHead>Resolution Time</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertHistory.map((alert) => {
                const startTime = new Date(alert.timestamp);
                const endTime = alert.resolvedAt
                  ? new Date(alert.resolvedAt)
                  : null;
                const duration = endTime
                  ? Math.round(
                      (endTime.getTime() - startTime.getTime()) / (1000 * 60)
                    )
                  : null;

                return (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium capitalize">
                      {alert.type}
                    </TableCell>
                    <TableCell>{alert.initiatedBy.name}</TableCell>
                    <TableCell>
                      {startTime.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {alert.resolvedBy ? alert.resolvedBy.name : 'Not resolved'}
                    </TableCell>
                    <TableCell>
                      {duration !== null ? `${duration} min` : 'N/A'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {alert.note || 'N/A'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;
