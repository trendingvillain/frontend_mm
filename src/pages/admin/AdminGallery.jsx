import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Alert, Snackbar } from '@mui/material';
import { postGallery } from '../../config/api'; // Adjust path as needed

const AdminGallery = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setSnackbar({
        open: true,
        message: 'Please select an image to upload.',
        severity: 'error',
      });
      return;
    }
    const formData = new FormData();
    formData.append('galleryImage', selectedFile);
    try {
      const response = await postGallery(formData);
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Image uploaded successfully!',
          severity: 'success',
        });
        setSelectedFile(null);
        setPreview(null);
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Upload failed.',
          severity: 'error',
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error uploading image.',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5, p: 3, boxShadow: 2, borderRadius: 2 }}>
      <Typography variant="h5" fontWeight={600} align="center" gutterBottom>
        Upload Gallery Image
      </Typography>
      <form onSubmit={handleUpload}>
        <Button variant="contained" component="label" fullWidth sx={{ mb: 2 }}>
          Select Image
          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
        </Button>
        {preview && (
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6 }} />
          </Box>
        )}
        <Button
          variant="contained"
          color="primary"
          type="submit"
          fullWidth
          disabled={!selectedFile}
        >
          Upload
        </Button>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminGallery;
