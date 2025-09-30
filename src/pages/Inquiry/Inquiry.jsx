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
  Box, // Added Box for layout utility
} from "@mui/material";
import { HelpOutline } from "@mui/icons-material"; // Added an icon for the empty state
import dayjs from "dayjs";

// --- THEME CONSTANTS ---
const ACCENT_GOLD = '#BF8A00'; 
const PRIMARY_BLACK = '#121212'; 
const DEEP_GRAY = '#F5F5F5';
// --- END THEME CONSTANTS ---

const statusColors = {
  // Mapping status to thematic colors/styles
  new: "warning",       // Yellow/Amber for new
  responded: "success", // Green for success
  closed: "default",    // Gray/Black for closed
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress sx={{ color: ACCENT_GOLD }} size={60} />
      </Box>
    );
  }

  if (!inquiries.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, bgcolor: DEEP_GRAY, border: `2px solid ${PRIMARY_BLACK}`, m: 4 }}>
        <HelpOutline sx={{ fontSize: 80, color: ACCENT_GOLD, mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: PRIMARY_BLACK, textTransform: 'uppercase' }}>
          NO ACTIVE INQUIRIES
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Your question log is empty. Use the contact form to initiate a query.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: PRIMARY_BLACK, textTransform: 'uppercase', mb: 4 }}>
        Client Inquiry Log
      </Typography>

      <div className="space-y-6">
        {inquiries.map((inq) => (
          <Card 
            key={inq.id} 
            // Themed Card Styles
            sx={{ 
                borderRadius: 0, 
                border: `2px solid ${PRIMARY_BLACK}30`, 
                bgcolor: 'white',
                transition: 'box-shadow 0.3s, border-color 0.3s',
                '&:hover': { 
                    boxShadow: 6, 
                    border: `2px solid ${ACCENT_GOLD}` 
                } 
            }}
          >
            <CardContent sx={{ bgcolor: DEEP_GRAY }}>
              {/* Header Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, borderBottom: `1px solid ${PRIMARY_BLACK}20`, pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY_BLACK, textTransform: 'uppercase' }}>
                  {inq.product_name ? `Regarding: ${inq.product_name}` : "General Inquiry"}
                </Typography>
                
                {/* Status Chip */}
                <Chip
                  label={inq.status.toUpperCase()}
                  color={statusColors[inq.status] || "default"}
                  size="small"
                  sx={{ borderRadius: 0, fontWeight: 800 }}
                />
              </Box>

              {/* Message Content */}
              <Typography variant="body1" sx={{ mt: 2, color: PRIMARY_BLACK }}>
                {inq.message}
              </Typography>

              <Divider sx={{ my: 2, borderColor: PRIMARY_BLACK + '40' }} />

              {/* Footer Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  DATE SUBMITTED:
                </Typography>
                <Typography variant="body2" sx={{ color: ACCENT_GOLD, fontWeight: 700 }}>
                  {/* FIXED: Removed time component (hh:mm A) */}
                  {dayjs(inq.created_at).format("DD MMM YYYY")} 
                </Typography>
              </Box>
              
              {inq.response && (
                  <Box sx={{ mt: 2, p: 2, border: `1px solid ${ACCENT_GOLD}`, bgcolor: 'white', borderRadius: 0 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: PRIMARY_BLACK, display: 'block', mb: 0.5 }}>
                          OUR RESPONSE:
                      </Typography>
                      <Typography variant="body1" sx={{ color: PRIMARY_BLACK }}>
                          {inq.response}
                      </Typography>
                  </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Box>
  );
};

export default UserInquiries;
