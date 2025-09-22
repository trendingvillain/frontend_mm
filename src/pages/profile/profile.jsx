
// src/pages/profile/Profile.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Box,
} from "@mui/material";

import { fetchProfile, updateProfile } from "./../../config/api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await fetchProfile();
        if (data.success) {
          setProfile(data.user);
          setForm({
            name: data.user.name || "",
            phone: data.user.phone || "",
            address: data.user.address || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const { data } = await updateProfile(form);
      if (data.success) {
        setProfile(data.user);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          My Profile
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Email" value={profile.email} disabled />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Role" value={profile.role} disabled />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Business" value={profile.business_name} disabled />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="GST" value={profile.gst_number} disabled />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Status" value={profile.status} disabled />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Profile"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
