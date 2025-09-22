// src/pages/inquiries/UserInquiries.jsx
import React, { useEffect, useState } from "react";
import { fetchUserInquiries } from "./../../config/api"; // your service file
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";

const statusColors = {
  new: "warning",
  responded: "success",
  closed: "default",
};

const UserInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInquiries = async () => {
      try {
        const { data } = await fetchUserInquiries();
        if (data.success) {
          setInquiries(data.inquiries);
        }
      } catch (error) {
        console.error("Error fetching inquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInquiries();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  if (!inquiries.length) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 4 }}>
        No inquiries found.
      </Typography>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <Typography variant="h5" gutterBottom>
        My Inquiries
      </Typography>

      {inquiries.map((inq) => (
        <Card key={inq.id} className="shadow-md rounded-xl">
          <CardContent>
            <div className="flex justify-between items-center">
              <Typography variant="h6">{inq.product_name}</Typography>
              <Chip
                label={inq.status}
                color={statusColors[inq.status] || "default"}
                size="small"
              />
            </div>

            <Typography variant="body1" sx={{ mt: 1 }}>
              {inq.message}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Typography variant="body2" color="text.secondary">
              {dayjs(inq.created_at).format("DD MMM YYYY, hh:mm A")}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserInquiries;
