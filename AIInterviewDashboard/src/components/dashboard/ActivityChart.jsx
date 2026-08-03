import React, { useMemo } from "react";
import { Card } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Displays the distribution of activity events
 * received from the backend.
 */
function ActivityChart({ events = [] }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(events)) {
      return [];
    }

    const eventCounts = events.reduce((counts, event) => {
      const eventType = event?.eventType?.trim();

      if (!eventType) {
        return counts;
      }

      counts[eventType] = (counts[eventType] || 0) + 1;

      return counts;
    }, {});

    return Object.entries(eventCounts)
      .map(([eventType, count]) => ({
        eventType: eventType
          .toLowerCase()
          .split("_")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join(" "),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="bg-white py-3">
        <h5 className="mb-0 fw-bold text-dark">
          Activity Overview
        </h5>
      </Card.Header>

      <Card.Body>
        {chartData.length > 0 ? (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: -10,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="eventType"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="#0d6efd"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            className="d-flex align-items-center justify-content-center text-muted"
            style={{ height: 300 }}
          >
            No activity data available.
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default ActivityChart;